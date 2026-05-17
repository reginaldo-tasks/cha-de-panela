"""
Vercel Blob Storage service for image uploads.
Uses Vercel Blob API for cloud storage ONLY.
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
        
        if not self.token:
            raise ValueError("S3_READ_WRITE_TOKEN environment variable is not configured")
        
        print("[BLOB] Using Vercel Blob Storage", file=sys.stderr)

    def upload_image(self, image_file, gift_id=None):
        """
        Upload image to Vercel Blob Storage.

        Args:
            image_file: Django InMemoryUploadedFile or similar
            gift_id: Optional UUID for organizing images

        Returns:
            tuple: (public_url, file_path)
        """
        try:
            # Optimize image
            image_path, optimized_image = self._optimize_image(image_file)

            # Generate unique pathname
            if gift_id:
                pathname = f"gifts/{gift_id}/{image_path}"
            else:
                pathname = f"gifts/{image_path}"

            # Upload to Vercel Blob
            headers = {
                "Authorization": f"Bearer {self.token}",
            }

            response = requests.put(
                f"{self.VERCEL_BLOB_API}/?pathname={pathname}",
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
                print(f"[BLOB] ERROR: {error_msg}", file=sys.stderr)
                raise Exception(error_msg)

        except Exception as e:
            error_msg = f"Error uploading to Vercel Blob: {str(e)}"
            print(f"[BLOB] ERROR: {error_msg}", file=sys.stderr)
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
            file_name = f"{uuid.uuid4()}.jpg"

            return file_name, output

        except Exception as e:
            error_msg = f"Image optimization error: {str(e)}"
            print(f"[BLOB] ERROR: {error_msg}", file=sys.stderr)
            raise

    def delete_image(self, file_path):
        """Delete image from Vercel Blob Storage."""
        try:
            headers = {
                "Authorization": f"Bearer {self.token}",
            }

            response = requests.delete(
                f"{self.VERCEL_BLOB_API}/?pathname={file_path}",
                headers=headers,
                timeout=30,
            )

            if response.status_code in [200, 204]:
                print(f"[BLOB] Delete success: {file_path}", file=sys.stderr)
                return True
            else:
                print(f"[BLOB] Delete failed: {response.status_code}", file=sys.stderr)
                return False

        except Exception as e:
            print(f"[BLOB] Error deleting: {str(e)}", file=sys.stderr)
            return False


def get_blob_service():
    """Factory function to get blob storage service."""
    try:
        return BlobStorageService()
    except Exception as e:
        print(f"[BLOB] Failed to initialize service: {str(e)}", file=sys.stderr)
        return None
