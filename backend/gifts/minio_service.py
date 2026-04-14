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
        self.endpoint_url = os.getenv(
            "MINIO_ENDPOINT", "https://minio-latest-2yx5.onrender.com"
        )
        self.access_key = os.getenv("MINIO_ROOT_USER")
        self.secret_key = os.getenv("MINIO_ROOT_PASSWORD")
        self.bucket_name = "gifts"
        self.public_url_prefix = f"{self.endpoint_url}/{self.bucket_name}"

        if not self.access_key or not self.secret_key:
            raise ValueError("MINIO credentials not configured")

        self.client = boto3.client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name="us-east-1",
        )

        # Ensure bucket exists
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist."""
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            # Bucket doesn't exist, create it
            self.client.create_bucket(Bucket=self.bucket_name)
            # Make bucket public
            self._make_bucket_public()

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
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=img_bytes.getvalue(),
                ContentType="image/jpeg",
                Metadata={"gift-id": str(gift_id)} if gift_id else {},
            )

            public_url = f"{self.public_url_prefix}/{file_key}"
            return public_url

        except Exception as e:
            print(f"Error uploading image to MinIO: {e}")
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
