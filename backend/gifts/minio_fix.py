"""
MinIO fix endpoint - attempt to resolve permissions issues
"""

import os
import json
import uuid
from io import BytesIO
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from PIL import Image
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError


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
def fix_minio(request):
    """
    Attempt to fix MinIO permissions issues.

    Strategy 1: Create bucket policy for public access
    Strategy 2: Test upload with various client configurations

    Query param: token=YOUR_ADMIN_TOKEN
    """
    # Security check
    token = request.query_params.get("token", "")
    if token != ADMIN_TOKEN:
        return get_status_response(
            403, "Invalid or missing admin token", {"hint": "Use ?token=YOUR_TOKEN"}
        )

    endpoint = os.getenv("MINIO_ENDPOINT", "")
    access_key = os.getenv("MINIO_ROOT_USER", "")
    secret_key = os.getenv("MINIO_ROOT_PASSWORD", "")

    steps = []

    # Step 1: Test basic connectivity
    try:
        config = Config(
            signature_version="s3v4",
            retries={"max_attempts": 2, "mode": "standard"},
            connect_timeout=10,
            read_timeout=60,
            s3={"use_path_style_addressing": True},  # Important for MinIO
        )

        client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="us-east-1",
            verify=False,
            config=config,
        )

        steps.append(
            {
                "step": 1,
                "name": "Create boto3 S3 client with path-style addressing",
                "status": "✅ Success",
            }
        )
    except Exception as e:
        steps.append(
            {"step": 1, "name": "Create boto3 client", "status": f"❌ {str(e)}"}
        )
        return get_status_response(500, "Failed to create client", {"steps": steps})

    # Step 2: Ensure bucket exists
    try:
        try:
            client.head_bucket(Bucket="gifts")
            steps.append(
                {
                    "step": 2,
                    "name": "Check bucket 'gifts'",
                    "status": "✅ Bucket exists",
                }
            )
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") == "404":
                client.create_bucket(Bucket="gifts")
                steps.append(
                    {"step": 2, "name": "Create bucket 'gifts'", "status": "✅ Created"}
                )
            else:
                raise e
    except Exception as e:
        steps.append(
            {"step": 2, "name": "Bucket existence check", "status": f"❌ {str(e)}"}
        )

    # Step 3: Set public read policy
    try:
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": "arn:aws:s3:::gifts/*",
                }
            ],
        }

        client.put_bucket_policy(Bucket="gifts", Policy=json.dumps(policy))
        steps.append(
            {"step": 3, "name": "Set public read policy", "status": "✅ Policy set"}
        )
    except Exception as e:
        steps.append(
            {
                "step": 3,
                "name": "Set public policy",
                "status": f"⚠️ {str(e)} (non-critical)",
            }
        )

    # Step 4: TEST UPLOAD - This is where we find the real issue
    upload_success = False
    upload_error = None

    try:
        # Create a small test image
        img = Image.new("RGB", (50, 50), color="blue")
        img_bytes = BytesIO()
        img.save(img_bytes, format="JPEG", quality=70)
        img_bytes.seek(0)

        test_key = f"admin-test-{uuid.uuid4()}.jpg"

        # Try standard PUT
        response = client.put_object(
            Bucket="gifts",
            Key=test_key,
            Body=img_bytes.getvalue(),
            ContentType="image/jpeg",
        )

        upload_success = True
        public_url = f"{endpoint}/gifts/{test_key}"

        steps.append(
            {
                "step": 4,
                "name": "Upload test image",
                "status": "✅ SUCCESS!",
                "test_key": test_key,
                "public_url": public_url,
                "etag": response.get("ETag", ""),
            }
        )

        # Try to cleanup
        try:
            client.delete_object(Bucket="gifts", Key=test_key)
        except:
            pass

    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "Unknown")
        error_msg = e.response.get("Error", {}).get("Message", str(e))
        upload_error = f"{error_code}: {error_msg}"

        steps.append(
            {
                "step": 4,
                "name": "Upload test image",
                "status": f"❌ {error_code}: {error_msg}",
            }
        )
    except Exception as e:
        upload_error = str(e)
        steps.append({"step": 4, "name": "Upload test image", "status": f"❌ {str(e)}"})

    # Summary
    summary = {
        "overall": "✅ MinIO is ready!" if upload_success else "❌ Upload still fails",
        "upload_works": upload_success,
        "next_steps": [
            (
                "Try uploading from admin panel"
                if upload_success
                else "MinIO permissions still restricted"
            ),
        ],
    }

    return get_status_response(
        200,
        "MinIO fix attempt complete",
        {
            "timestamp": str(__import__("datetime").datetime.now().isoformat()),
            "steps": steps,
            "summary": summary,
        },
    )
