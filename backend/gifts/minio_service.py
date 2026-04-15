"""
MinIO S3 service for image uploads.
Uses MinIO Python SDK for better compatibility.
"""

import os
import uuid
import sys
from io import BytesIO
from PIL import Image
from minio import Minio
from minio.error import S3Error


class MinIOService:
    """Service for uploading images to MinIO using MinIO SDK."""

    def __init__(self):
        self.endpoint_url = os.getenv(
            "MINIO_ENDPOINT", "https://minio-latest-2yx5.onrender.com"
        )
        self.access_key = os.getenv("MINIO_ROOT_USER", "").strip()
        self.secret_key = os.getenv("MINIO_ROOT_PASSWORD", "").strip()
        self.bucket_name = "gifts"
        self.public_url_prefix = f"{self.endpoint_url}/{self.bucket_name}"

        # Debug logging
        access_key_masked = (
            f"{self.access_key[:3]}...{self.access_key[-3:]}"
            if len(self.access_key) > 6
            else "***"
        )
        secret_key_masked = (
            f"{self.secret_key[:3]}...{self.secret_key[-3:]}"
            if len(self.secret_key) > 6
            else "***"
        )

        print(f"[MinIO] Endpoint: {self.endpoint_url}", file=sys.stderr)
        print(
            f"[MinIO] Access Key configured: {bool(self.access_key)} ({access_key_masked})",
            file=sys.stderr,
        )
        print(
            f"[MinIO] Secret Key configured: {bool(self.secret_key)} (length: {len(self.secret_key)})",
            file=sys.stderr,
        )

        if not self.access_key or not self.secret_key:
            print(f"ERROR: MINIO credentials not configured!", file=sys.stderr)
            raise ValueError("MINIO credentials not configured")

        # Create MinIO client
        # MinIO SDK handles SSL verification and permissions better than boto3
        endpoint_clean = self.endpoint_url.replace("https://", "").replace(
            "http://", ""
        )
        use_ssl = "https://" in self.endpoint_url

        try:
            self.client = Minio(
                endpoint_clean,
                access_key=self.access_key,
                secret_key=self.secret_key,
                secure=use_ssl,
                region="us-east-1",
            )
            print(
                f"[MinIO] MinIO SDK client created for: {endpoint_clean}",
                file=sys.stderr,
            )
        except Exception as e:
            print(f"[MinIO] Error creating client: {str(e)}", file=sys.stderr)
            raise

        # Ensure bucket exists
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist."""
        try:
            exists = self.client.bucket_exists(self.bucket_name)
            if exists:
                print(f"[MinIO] Bucket '{self.bucket_name}' exists", file=sys.stderr)
            else:
                print(f"[MinIO] Creating bucket '{self.bucket_name}'", file=sys.stderr)
                self.client.make_bucket(self.bucket_name)
                print(f"[MinIO] Bucket created successfully", file=sys.stderr)
                self._make_bucket_public()
        except Exception as e:
            print(f"[MinIO] Bucket check error: {str(e)}", file=sys.stderr)
            # Don't raise - let it fail later with specific error

    def _make_bucket_public(self):
        """Set bucket policy for public read access."""
        import json

        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": f"arn:aws:s3:::{self.bucket_name}/*",
                }
            ],
        }
        try:
            self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))
            print(f"[MinIO] Bucket policy set to public read", file=sys.stderr)
        except Exception as e:
            print(
                f"[MinIO] Warning: Could not set bucket policy: {str(e)}",
                file=sys.stderr,
            )

    def upload_image(self, image_file, gift_id=None):
        """
        Upload image to MinIO and return public URL.

        Args:
            image_file: Django InMemoryUploadedFile or similar
            gift_id: Optional UUID for organizing images

        Returns:
            Tuple of (public_url, file_key) or (None, None) on error
        """
        if not image_file:
            return None, None

        try:
            # Optimize image
            img = Image.open(image_file)

            # Convert to RGB if necessary (handle PNG with transparency)
            if img.mode in ("RGBA", "LA", "P"):
                rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = rgb_img

            # Resize if too large
            max_size = (1200, 1200)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)

            # Save to bytes
            img_bytes = BytesIO()
            img.save(img_bytes, format="JPEG", quality=85, optimize=True)
            img_bytes.seek(0)

            # Generate key
            file_ext = ".jpg"
            gift_prefix = f"{gift_id}/" if gift_id else ""
            file_key = f"images/{gift_prefix}{uuid.uuid4()}{file_ext}"

            # Upload to MinIO using SDK
            print(
                f"[MinIO] Uploading {file_key} (size: {len(img_bytes.getvalue())} bytes)",
                file=sys.stderr,
            )

            # Use put_object from MinIO SDK (this works where boto3 fails)
            result = self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=file_key,
                data=img_bytes,
                length=len(img_bytes.getvalue()),
                content_type="image/jpeg",
            )

            public_url = f"{self.public_url_prefix}/{file_key}"
            print(f"[MinIO] Upload successful: {public_url}", file=sys.stderr)
            return public_url, file_key

        except S3Error as e:
            error_msg = f"S3 Error: {str(e)}"
            print(f"[MinIO] S3Error: {error_msg}", file=sys.stderr)
            return None, None
        except Exception as e:
            error_msg = f"Upload error: {str(e)}"
            print(f"[MinIO] Exception: {error_msg}", file=sys.stderr)
            return None, None

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            error_msg = e.response.get("Error", {}).get("Message", str(e))
            import sys

            print(f"[MinIO] ClientError ({error_code}): {error_msg}", file=sys.stderr)
            if error_code == "403":
                diagnose_msg = (
                    f"Access denied uploading to MinIO.\n"
                    f"  Endpoint: {self.endpoint_url}\n"
                    f"  Bucket: {self.bucket_name}\n"
                    f"  User: {self.access_key}\n"
                    f"  Possible causes:\n"
                    f"    - Credentials are incorrect\n"
                    f"    - User lacks s3:PutObject permission\n"
                    f"    - Bucket has restrictive policies\n"
                    f"  Error: {error_msg}"
                )
                print(f"[MinIO] DIAGNOSIS: {diagnose_msg}", file=sys.stderr)
                raise Exception(diagnose_msg)
            else:
                raise Exception(f"MinIO error: {error_msg}")
        except Exception as e:
            import sys

            print(f"[MinIO] Error uploading image: {e}", file=sys.stderr)
            import traceback

            traceback.print_exc(file=sys.stderr)
            raise

    def delete_image(self, file_key):
        """Delete image from MinIO."""
        try:
            if not file_key:
                return

            # Extract key from full URL if needed
            if file_key.startswith("http"):
                file_key = file_key.replace(self.public_url_prefix + "/", "")

            self.client.delete_object(Bucket=self.bucket_name, Key=file_key)
        except ClientError as e:
            print(f"Warning: Could not delete image: {e}")


# Singleton instance
_minio_service = None


def get_minio_service():
    """Get MinIO service instance."""
    global _minio_service
    if _minio_service is None:
        try:
            _minio_service = MinIOService()
        except ValueError:
            # Return None if credentials not configured
            return None
    return _minio_service
