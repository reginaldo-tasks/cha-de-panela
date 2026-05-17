"""
Vercel Blob Storage service for image uploads via Node.js wrapper.
Uses Vercel Blob API through a serverless function.
"""

import os
import uuid
import sys
import requests
from io import BytesIO
from PIL import Image


class BlobStorageService:
    """Service for uploading images to Vercel Blob Storage via wrapper."""

    # Use the frontend deployment URL (where the /api/upload function is)
    BLOB_UPLOAD_API = os.getenv(
        "BLOB_UPLOAD_API",
        "https://cha-de-panela-web.vercel.app/api/upload",
    )
    ALLOWED_FORMATS = ["JPEG", "PNG", "WEBP"]

    def __init__(self):
        print(f"[BLOB] Using Vercel Blob Storage via {self.BLOB_UPLOAD_API}", file=sys.stderr)

    def upload_image(self, image_file, gift_id=None):
        """
        Upload image to Vercel Blob Storage via Node.js wrapper.

        Args:
            image_file: Django InMemoryUploadedFile or similar
            gift_id: Optional UUID for organizing images

        Returns:
            tuple: (public_url, file_path)
        """
        try:
            # Optimize image
            image_path, optimized_image = self._optimize_image(image_file)

            # Prepare binary data
            image_data = optimized_image.getvalue()

            # Prepare headers
            headers = {
                "x-file-name": image_path,
            }

            # Add gift_id if provided
            params = {}
            if gift_id:
                headers["x-gift-id"] = str(gift_id)
                params["gift_id"] = str(gift_id)

            # Upload via wrapper API
            response = requests.post(
                self.BLOB_UPLOAD_API,
                data=image_data,
                headers=headers,
                params=params,
                timeout=60,
            )

            if response.status_code in [200, 201]:
                data = response.json()
                public_url = data.get("url", "")
                pathname = data.get("pathname", "")
                print(f"[BLOB] Upload success: {pathname}", file=sys.stderr)
                return public_url, pathname
            else:
                error_msg = f"Blob upload failed: {response.status_code} - {response.text}"
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
            # Note: Delete via API would require additional endpoint
            # For now, this is a placeholder
            print(f"[BLOB] Delete requested for: {file_path}", file=sys.stderr)
            return True

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
