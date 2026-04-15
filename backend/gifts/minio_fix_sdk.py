"""
Direct MinIO SDK approach - using minio library instead of boto3
"""

import os
import uuid
from io import BytesIO
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from PIL import Image


ADMIN_TOKEN = os.getenv("ADMIN_SETUP_TOKEN", "default-dev-token")


def get_status_response(status_code, message, data=None):
    """Helper to create consistent response"""
    return Response(
        {
            "status": "success" if status_code == 200 else "error",
            "code": status_code,
            "message": message,
            "data": data or {},
        },
        status=status_code,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def fix_minio_sdk(request):
    """
    Attempt upload using MinIO SDK (minio library) instead of boto3.
    Sometimes SDK behaves differently than S3 API.

    Query param: token=YOUR_ADMIN_TOKEN
    """
    # Security check
    token = request.query_params.get("token", "")
    if token != ADMIN_TOKEN:
        return get_status_response(
            403, "Invalid or missing admin token", {"hint": "Use ?token=YOUR_TOKEN"}
        )

    try:
        from minio import Minio
    except ImportError:
        return get_status_response(500, "MinIO SDK not installed", {})

    endpoint = os.getenv("MINIO_ENDPOINT", "")
    access_key = os.getenv("MINIO_ROOT_USER", "")
    secret_key = os.getenv("MINIO_ROOT_PASSWORD", "")

    steps = []

    # Step 1: Create MinIO client
    try:
        # Remove protocol from endpoint
        endpoint_clean = endpoint.replace("https://", "").replace("http://", "")
        use_ssl = "https://" in endpoint

        client = Minio(
            endpoint_clean,
            access_key=access_key,
            secret_key=secret_key,
            secure=use_ssl,
            region="us-east-1",
        )

        steps.append({"step": 1, "name": "Create MinIO client", "status": "✅ Success"})
    except Exception as e:
        steps.append(
            {"step": 1, "name": "Create MinIO client", "status": f"❌ {str(e)}"}
        )
        return get_status_response(
            500, "Failed to create MinIO client", {"steps": steps}
        )

    # Step 2: Ensure bucket exists
    try:
        found = client.bucket_exists("gifts")
        if found:
            steps.append(
                {
                    "step": 2,
                    "name": "Check bucket 'gifts'",
                    "status": "✅ Bucket exists",
                }
            )
        else:
            # Try to create bucket
            client.make_bucket("gifts")
            steps.append(
                {"step": 2, "name": "Create bucket 'gifts'", "status": "✅ Created"}
            )
    except Exception as e:
        steps.append({"step": 2, "name": "Bucket check", "status": f"❌ {str(e)}"})

    # Step 3: Test UPLOAD with MinIO SDK
    try:
        # Create test image
        img = Image.new("RGB", (50, 50), color="green")
        img_bytes = BytesIO()
        img.save(img_bytes, format="JPEG", quality=70)
        img_bytes.seek(0)

        test_key = f"minio-sdk-test-{uuid.uuid4()}.jpg"

        # Upload using MinIO SDK
        response = client.put_object(
            bucket_name="gifts",
            object_name=test_key,
            data=img_bytes,
            length=len(img_bytes.getvalue()),
            content_type="image/jpeg",
        )

        public_url = f"{endpoint}/gifts/{test_key}"

        steps.append(
            {
                "step": 3,
                "name": "Upload test image (MinIO SDK)",
                "status": "✅ SUCCESS!",
                "test_key": test_key,
                "public_url": public_url,
                "response": str(response),
            }
        )

        # Try cleanup
        try:
            client.remove_object("gifts", test_key)
        except:
            pass

        upload_success = True

    except Exception as e:
        upload_success = False
        steps.append(
            {
                "step": 3,
                "name": "Upload test image",
                "status": f"❌ {str(e)[:100]}",
                "full_error": str(e),
            }
        )

    # Summary
    summary = {
        "overall": (
            "✅ MinIO SDK upload works!"
            if upload_success
            else "❌ MinIO SDK also fails"
        ),
        "sdk_upload_works": upload_success,
        "next_steps": [
            (
                "Try MinIO console if accessible"
                if not upload_success
                else "SDK approach works!"
            ),
        ],
    }

    return get_status_response(
        200,
        "MinIO SDK test complete",
        {
            "timestamp": str(__import__("datetime").datetime.now().isoformat()),
            "steps": steps,
            "summary": summary,
        },
    )
