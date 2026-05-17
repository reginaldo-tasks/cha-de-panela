"""
Vercel Blob Storage service for image uploads.
Uses Vercel Blob API for cloud storage (recommended).
Fallback to Supabase S3 if Vercel Blob token not configured.
"""

import os
import uuid
import sys
import requests
from io import BytesIO
from PIL import Image


class BlobStorageService:
    """Service for uploading images to Vercel Blob Storage."""

    VERCEL_BLOB_API = "https://blob.vercelusercontent.com"
    ALLOWED_FORMATS = ["JPEG", "PNG", "WEBP"]

    def __init__(self):
        # Vercel Blob Storage token
        self.token = os.getenv("S3_READ_WRITE_TOKEN", "").strip()
        self.use_vercel_blob = bool(self.token)

        if self.use_vercel_blob:
            print("[BLOB] Using Vercel Blob Storage", file=sys.stderr)
            print(
                f"[BLOB] Token configured: {'✓' if self.token else '✗'}",
                file=sys.stderr,
            )
        else:
            print(
                "[BLOB] Vercel Blob token not found, using Supabase S3 fallback",
                file=sys.stderr,
            )
            self._init_supabase_fallback()

    def _init_supabase_fallback(self):
        """Initialize Supabase S3 as fallback storage."""
        try:
            import boto3
            from botocore.client import Config

            self.endpoint_url = os.getenv(
                "SUPABASE_S3_ENDPOINT",
                "https://semrcxlyfncmanrklvon.storage.supabase.co/storage/v1/s3",
            )
            self.access_key = os.getenv("SUPABASE_ACCESS_KEY", "").strip()
            self.secret_key = os.getenv("SUPABASE_SECRET_KEY", "").strip()
            self.region = os.getenv("SUPABASE_REGION", "us-east-2")
            self.bucket_name = "gifts"

            if not self.access_key or not self.secret_key:
                print(
                    "[BLOB] Warning: Neither Vercel Blob nor Supabase S3 configured",
                    file=sys.stderr,
                )
                return

            config = Config(
                signature_version="s3v4",
                retries={"max_attempts": 3, "mode": "standard"},
                connect_timeout=10,
                read_timeout=60,
            )

            self.s3_client = boto3.client(
                "s3",
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
                config=config,
            )
            self.public_url_prefix = f"https://semrcxlyfncmanrklvon.storage.supabase.co/storage/v1/object/public/{self.bucket_name}"
            print(
                "[BLOB] Supabase S3 fallback initialized (legacy storage)",
                file=sys.stderr,
            )
        except ImportError:
            print("[BLOB] boto3 not available for S3 fallback", file=sys.stderr)
        except Exception as e:
            print(f"[BLOB] Supabase fallback init error: {str(e)}", file=sys.stderr)

    def upload_image(self, image_file, gift_id=None):
        """
        Upload image to Vercel Blob Storage or fallback to Supabase S3.

        Args:
            image_file: Django InMemoryUploadedFile or similar
            gift_id: Optional UUID for organizing images

        Returns:
            tuple: (public_url, file_path)
        """
        if self.use_vercel_blob:
            return self._upload_to_vercel_blob(image_file, gift_id)
        else:
            return self._upload_to_supabase_s3(image_file, gift_id)

    def _upload_to_vercel_blob(self, image_file, gift_id=None):
        """Upload image to Vercel Blob Storage."""
        try:
            # Optimize image
            image_path, optimized_image = self._optimize_image(image_file)

            # Generate unique filename
            if gift_id:
                pathname = f"gifts/{gift_id}/{image_path}"
            else:
                pathname = f"gifts/{image_path}"

            # Upload to Vercel Blob
            headers = {
                "Authorization": f"Bearer {self.token}",
            }

            files = {"file": (image_path, optimized_image, "application/octet-stream")}

            url = f"{self.VERCEL_BLOB_API}"
            params = {"pathname": pathname}

            response = requests.put(
                f"{url}?pathname={pathname}",
                data=optimized_image.getvalue(),
                headers=headers,
                timeout=30,
            )

            if response.status_code in [200, 201]:
                data = response.json()
                public_url = data.get("url", "")
                print(f"[BLOB] Upload success: {pathname}", file=sys.stderr)
                return public_url, pathname
            else:
                error_msg = f"Vercel Blob upload failed: {response.status_code} - {response.text}"
                print(f"[BLOB] {error_msg}", file=sys.stderr)
                raise Exception(error_msg)

        except Exception as e:
            print(f"[BLOB] Error uploading to Vercel: {str(e)}", file=sys.stderr)
            raise

    def _upload_to_supabase_s3(self, image_file, gift_id=None):
        """Upload image to Supabase S3 (fallback)."""
        try:
            if not hasattr(self, "s3_client"):
                raise Exception("S3 client not initialized")

            image_path, optimized_image = self._optimize_image(image_file)

            # Build S3 key
            if gift_id:
                s3_key = f"gifts/{gift_id}/{image_path}"
            else:
                s3_key = f"gifts/{image_path}"

            # Upload to S3
            self.s3_client.upload_fileobj(
                optimized_image,
                self.bucket_name,
                s3_key,
                ExtraArgs={"ContentType": "image/jpeg"},
            )

            public_url = f"{self.public_url_prefix}/{s3_key}"
            print(f"[BLOB] S3 upload success: {s3_key}", file=sys.stderr)
            return public_url, s3_key

        except Exception as e:
            print(f"[BLOB] Error uploading to Supabase S3: {str(e)}", file=sys.stderr)
            raise

    def _optimize_image(self, image_file):
        """Optimize image for storage (compress, resize if needed)."""
        try:
            # Read image
            image_file.seek(0)
            img = Image.open(image_file)

            # Convert RGBA to RGB if needed
            if img.mode == "RGBA":
                rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3])
                img = rgb_img

            # Resize if too large
            max_dimension = 2000
            if img.width > max_dimension or img.height > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            # Save optimized image
            output = BytesIO()
            img.save(output, format="JPEG", quality=85, optimize=True)
            output.seek(0)

            # Generate filename
            file_ext = "jpg"
            file_name = f"{uuid.uuid4()}.{file_ext}"

            return file_name, output

        except Exception as e:
            print(f"[BLOB] Image optimization error: {str(e)}", file=sys.stderr)
            raise

    def delete_image(self, file_path):
        """Delete image from storage."""
        if self.use_vercel_blob:
            return self._delete_from_vercel_blob(file_path)
        else:
            return self._delete_from_supabase_s3(file_path)

    def _delete_from_vercel_blob(self, file_path):
        """Delete image from Vercel Blob."""
        try:
            headers = {
                "Authorization": f"Bearer {self.token}",
            }

            response = requests.delete(
                f"{self.VERCEL_BLOB_API}?pathname={file_path}",
                headers=headers,
                timeout=30,
            )

            if response.status_code in [200, 204]:
                print(f"[BLOB] Delete success: {file_path}", file=sys.stderr)
                return True
            else:
                print(
                    f"[BLOB] Delete failed: {response.status_code}",
                    file=sys.stderr,
                )
                return False

        except Exception as e:
            print(f"[BLOB] Error deleting from Vercel: {str(e)}", file=sys.stderr)
            return False

    def _delete_from_supabase_s3(self, file_path):
        """Delete image from Supabase S3."""
        try:
            if not hasattr(self, "s3_client"):
                return False

            self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_path)
            print(f"[BLOB] S3 delete success: {file_path}", file=sys.stderr)
            return True

        except Exception as e:
            print(f"[BLOB] Error deleting from S3: {str(e)}", file=sys.stderr)
            return False


def get_blob_service():
    """Factory function to get blob storage service."""
    try:
        return BlobStorageService()
    except Exception as e:
        print(f"[BLOB] Failed to initialize service: {str(e)}", file=sys.stderr)
        return None
