"""
S3 storage service for image uploads using Supabase.
Uses boto3 for S3-compatible storage.
"""

import os
import uuid
import sys
from io import BytesIO
from PIL import Image
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError


class MinIOService:
    """Service for uploading images to Supabase S3 storage."""

    def __init__(self):
        # Supabase S3 configuration
        self.endpoint_url = os.getenv(
            "SUPABASE_S3_ENDPOINT",
            "https://semrcxlyfncmanrklvon.storage.supabase.co/storage/v1/s3",
        )
        self.access_key = os.getenv("SUPABASE_ACCESS_KEY", "").strip()
        self.secret_key = os.getenv("SUPABASE_SECRET_KEY", "").strip()
        self.region = os.getenv("SUPABASE_REGION", "us-east-2")
        self.bucket_name = "gifts"
        self.public_url_prefix = f"https://semrcxlyfncmanrklvon.storage.supabase.co/storage/v1/object/public/{self.bucket_name}"

        # Debug logging
        access_key_masked = (
            f"{self.access_key[:3]}...{self.access_key[-3:]}"
            if len(self.access_key) > 6
            else "***"
        )

        print(f"[S3] Endpoint: {self.endpoint_url}", file=sys.stderr)
        print(f"[S3] Region: {self.region}", file=sys.stderr)
        print(
            f"[S3] Access Key configured: {bool(self.access_key)} ({access_key_masked})",
            file=sys.stderr,
        )
        print(
            f"[S3] Secret Key configured: {bool(self.secret_key)} (length: {len(self.secret_key)})",
            file=sys.stderr,
        )

        if not self.access_key or not self.secret_key:
            print(f"ERROR: Supabase S3 credentials not configured!", file=sys.stderr)
            raise ValueError("Supabase S3 credentials not configured")

        # Create boto3 S3 client for Supabase
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
                region_name=self.region,
                config=config,
            )
            print(f"[S3] S3 client created for: {self.endpoint_url}", file=sys.stderr)
        except Exception as e:
            print(f"[S3] Error creating client: {str(e)}", file=sys.stderr)
            raise

        # Ensure bucket exists
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Check if bucket exists."""
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
            print(f"[S3] Bucket '{self.bucket_name}' exists", file=sys.stderr)
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            if error_code == "404":
                print(
                    f"[S3] Warning: Bucket '{self.bucket_name}' not found",
                    file=sys.stderr,
                )
            else:
                print(f"[S3] Bucket check error: {str(e)}", file=sys.stderr)

    def upload_image(self, image_file, gift_id=None):
        """
        Upload image to Supabase S3 and return public URL.

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

            # Upload to Supabase S3
            print(
                f"[S3] Uploading {file_key} (size: {len(img_bytes.getvalue())} bytes)",
                file=sys.stderr,
            )

            self.client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=img_bytes.getvalue(),
                ContentType="image/jpeg",
            )

            public_url = f"{self.public_url_prefix}/{file_key}"
            print(f"[S3] Upload successful: {public_url}", file=sys.stderr)
            return public_url, file_key

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            error_msg = e.response.get("Error", {}).get("Message", str(e))
            print(f"[S3] ClientError ({error_code}): {error_msg}", file=sys.stderr)
            return None, None
        except Exception as e:
            error_msg = f"Upload error: {str(e)}"
            print(f"[S3] Exception: {error_msg}", file=sys.stderr)
            return None, None

    def delete_image(self, file_key):
        """Delete image from S3."""
        try:
            if not file_key:
                return

            # Extract key from full URL if needed
            if file_key.startswith("http"):
                file_key = file_key.replace(self.public_url_prefix + "/", "")

            self.client.delete_object(Bucket=self.bucket_name, Key=file_key)
            print(f"[S3] Deleted: {file_key}", file=sys.stderr)
        except Exception as e:
            print(f"[S3] Warning: Could not delete image: {e}", file=sys.stderr)

    def get_image_url(self, key):
        """Get public URL for an image key."""
        return f"{self.public_url_prefix}/{key}"


# Singleton instance
_minio_service = None


def get_minio_service():
    """Get S3 service instance."""
    global _minio_service
    if _minio_service is None:
        try:
            _minio_service = MinIOService()
        except ValueError:
            # Return None if credentials not configured
            return None
    return _minio_service
