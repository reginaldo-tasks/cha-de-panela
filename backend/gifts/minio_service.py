"""
MinIO S3 service for image uploads.
"""

import os
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
import uuid
from PIL import Image
from io import BytesIO


class MinIOService:
    """Service for uploading images to MinIO."""

    def __init__(self):
        import sys

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
            print(
                f"ERROR: MINIO credentials not configured!",
                file=sys.stderr,
            )
            raise ValueError("MINIO credentials not configured")

        # Create boto3 S3 client with SSL verification disabled for self-signed certs
        import botocore.client
        from botocore.client import Config

        config = Config(
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"},
            connect_timeout=10,
            read_timeout=60,
        )

        try:
            self.client = boto3.client(
                "s3",
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name="us-east-1",
                verify=False,  # Disable SSL verification for self-signed certs on Render
                config=config,
            )
            print(
                f"MinIO client created successfully for endpoint: {self.endpoint_url}"
            )
        except Exception as e:
            import sys

            print(f"ERROR: Failed to create MinIO client: {e}", file=sys.stderr)
            raise

        # Ensure bucket exists
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist."""
        try:
            response = self.client.head_bucket(Bucket=self.bucket_name)
            print(f"Bucket '{self.bucket_name}' exists")
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            if error_code == "404":
                print(f"Bucket '{self.bucket_name}' does not exist, creating...")
                try:
                    self.client.create_bucket(Bucket=self.bucket_name)
                    print(f"Bucket '{self.bucket_name}' created successfully")
                    # Make bucket public
                    self._make_bucket_public()
                except ClientError as create_error:
                    import sys

                    print(
                        f"ERROR: Could not create bucket: {create_error}",
                        file=sys.stderr,
                    )
                    # Don't raise - let it fail later when actually trying to upload
            elif error_code == "403":
                import sys

                print(
                    f"ERROR: Access denied to bucket '{self.bucket_name}'. Check credentials and bucket permissions.",
                    file=sys.stderr,
                )
                # Don't raise - let it fail later with specific upload error
            else:
                import sys

                print(f"ERROR: Could not check bucket: {e}", file=sys.stderr)

    def _make_bucket_public(self):
        """Make bucket public for read access."""
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
        import json

        try:
            self.client.put_bucket_policy(
                Bucket=self.bucket_name, Policy=json.dumps(policy)
            )
        except ClientError as e:
            print(f"Warning: Could not set bucket policy: {e}")

    def upload_image(self, image_file, gift_id=None):
        """
        Upload image to MinIO and return public URL.

        Args:
            image_file: Django InMemoryUploadedFile or similar
            gift_id: Optional UUID for organizing images

        Returns:
            Tuple of (public_url, file_key)
        """
        if not image_file:
            return None

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

            # Upload to MinIO
            print(
                f"Uploading image to {self.endpoint_url}/{self.bucket_name}/{file_key} (size: {len(img_bytes.getvalue())} bytes)"
            )
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=img_bytes.getvalue(),
                ContentType="image/jpeg",
                Metadata={"gift-id": str(gift_id)} if gift_id else {},
            )

            public_url = f"{self.public_url_prefix}/{file_key}"
            print(f"Image uploaded successfully: {public_url}")
            return public_url

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
