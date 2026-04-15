"""
Admin endpoint for MinIO setup and diagnostics.
Accessible at: /api/admin/setup-minio/?token=YOUR_ADMIN_TOKEN
"""

import os
import json
import uuid
from io import BytesIO
from rest_framework.response import Response
from rest_framework.decorators import api_view
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


@api_view(["GET", "POST"])
def setup_minio(request):
    """
    Admin endpoint for MinIO setup.

    GET: Run diagnostics
    POST: Setup and test MinIO

    Query param: token=YOUR_ADMIN_TOKEN
    """
    # Security check
    token = request.query_params.get("token", "")
    if token != ADMIN_TOKEN:
        return get_status_response(
            403, "Invalid or missing admin token", {"hint": "Use ?token=YOUR_TOKEN"}
        )

    if request.method == "GET":
        return diagnose_minio()
    else:  # POST
        return setup_and_test_minio()


def diagnose_minio():
    """Run diagnostics on MinIO setup"""
    diagnostics = {
        "timestamp": str(__import__("datetime").datetime.now().isoformat()),
        "environment": {},
        "connection": {},
        "bucket": {},
        "permissions": {},
        "summary": {},
    }

    # 1. Check environment variables
    endpoint = os.getenv("MINIO_ENDPOINT", "")
    access_key = os.getenv("MINIO_ROOT_USER", "")
    secret_key = os.getenv("MINIO_ROOT_PASSWORD", "")

    diagnostics["environment"] = {
        "endpoint": endpoint,
        "access_key_configured": bool(access_key),
        "access_key_sample": (
            f"{access_key[:4]}...{access_key[-4:]}" if access_key else None
        ),
        "secret_key_configured": bool(secret_key),
        "secret_key_length": len(secret_key) if secret_key else 0,
    }

    # 2. Try to connect
    try:
        config = Config(
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"},
            connect_timeout=10,
            read_timeout=60,
        )

        client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="us-east-1",
            verify=False,
        )

        diagnostics["connection"]["status"] = "✅ Connected"
        diagnostics["connection"]["endpoint"] = endpoint

    except Exception as e:
        diagnostics["connection"]["status"] = f"❌ Failed: {str(e)}"
        return get_status_response(200, "Diagnostics complete", diagnostics)

    # 3. Check buckets
    try:
        response = client.list_buckets()
        buckets = [b["Name"] for b in response.get("Buckets", [])]
        diagnostics["bucket"]["list"] = buckets
        diagnostics["bucket"]["gifts_exists"] = "gifts" in buckets
    except Exception as e:
        diagnostics["bucket"]["list_error"] = str(e)

    # 4. Check gifts bucket
    try:
        client.head_bucket(Bucket="gifts")
        diagnostics["bucket"]["gifts_status"] = "✅ Accessible"
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "")
        diagnostics["bucket"]["gifts_status"] = f"❌ {error_code}"
    except Exception as e:
        diagnostics["bucket"]["gifts_status"] = f"❌ {str(e)}"

    # 5. Test write permission
    try:
        test_key = f"test/{uuid.uuid4()}.txt"
        client.put_object(
            Bucket="gifts",
            Key=test_key,
            Body=b"Test write permission",
            ContentType="text/plain",
        )
        diagnostics["permissions"]["write"] = "✅ Has write permission"

        # Try to delete
        try:
            client.delete_object(Bucket="gifts", Key=test_key)
            diagnostics["permissions"]["delete"] = "✅ Has delete permission"
        except:
            diagnostics["permissions"]["delete"] = "⚠️ No delete permission"

    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "")
        error_msg = e.response.get("Error", {}).get("Message", str(e))
        diagnostics["permissions"]["write"] = f"❌ {error_code}: {error_msg}"
    except Exception as e:
        diagnostics["permissions"]["write"] = f"❌ {str(e)}"

    # 6. Summary
    all_good = (
        diagnostics["connection"].get("status", "").startswith("✅")
        and diagnostics["bucket"].get("gifts_status", "").startswith("✅")
        and diagnostics["permissions"].get("write", "").startswith("✅")
    )

    diagnostics["summary"] = {
        "overall": "✅ All systems OK" if all_good else "❌ Some issues detected",
        "ready_for_upload": all_good,
        "next_steps": (
            [
                "Run POST request to setup and test",
            ]
            if all_good
            else [
                "Check endpoint and credentials",
                "Ensure bucket exists",
                "Verify user has s3:PutObject permission",
            ]
        ),
    }

    return get_status_response(200, "Diagnostics complete", diagnostics)


def setup_and_test_minio():
    """Setup MinIO and run a test upload"""
    setup_log = {
        "timestamp": str(__import__("datetime").datetime.now().isoformat()),
        "steps": [],
    }

    endpoint = os.getenv("MINIO_ENDPOINT", "")
    access_key = os.getenv("MINIO_ROOT_USER", "")
    secret_key = os.getenv("MINIO_ROOT_PASSWORD", "")

    # Step 1: Create client
    try:
        config = Config(
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"},
            connect_timeout=10,
            read_timeout=60,
        )

        client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="us-east-1",
            verify=False,
        )

        setup_log["steps"].append(
            {"step": 1, "name": "Create boto3 client", "status": "✅ Success"}
        )

    except Exception as e:
        setup_log["steps"].append(
            {"step": 1, "name": "Create boto3 client", "status": f"❌ {str(e)}"}
        )
        return get_status_response(500, "Failed to create MinIO client", setup_log)

    # Step 2: Create bucket if not exists
    try:
        try:
            client.head_bucket(Bucket="gifts")
            setup_log["steps"].append(
                {
                    "step": 2,
                    "name": "Check bucket 'gifts'",
                    "status": "✅ Bucket already exists",
                }
            )
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") == "404":
                client.create_bucket(Bucket="gifts")
                setup_log["steps"].append(
                    {
                        "step": 2,
                        "name": "Create bucket 'gifts'",
                        "status": "✅ Created",
                    }
                )
            else:
                raise e

    except Exception as e:
        setup_log["steps"].append(
            {"step": 2, "name": "Bucket setup", "status": f"❌ {str(e)}"}
        )
        return get_status_response(500, "Failed to setup bucket", setup_log)

    # Step 3: Set bucket policy
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

        setup_log["steps"].append(
            {"step": 3, "name": "Set bucket policy", "status": "✅ Public read enabled"}
        )

    except Exception as e:
        setup_log["steps"].append(
            {
                "step": 3,
                "name": "Set bucket policy",
                "status": f"⚠️ {str(e)} (non-critical)",
            }
        )

    # Step 4: Test upload with a real image
    try:
        # Create a test image
        img = Image.new("RGB", (100, 100), color="red")
        img_bytes = BytesIO()
        img.save(img_bytes, format="JPEG", quality=85)
        img_bytes.seek(0)

        test_key = f"test/{uuid.uuid4()}.jpg"

        client.put_object(
            Bucket="gifts",
            Key=test_key,
            Body=img_bytes.getvalue(),
            ContentType="image/jpeg",
        )

        public_url = f"{endpoint}/gifts/{test_key}"

        setup_log["steps"].append(
            {
                "step": 4,
                "name": "Test upload",
                "status": "✅ Success",
                "test_image_key": test_key,
                "public_url": public_url,
            }
        )

        # Try to cleanup
        try:
            client.delete_object(Bucket="gifts", Key=test_key)
        except:
            pass

    except Exception as e:
        setup_log["steps"].append(
            {"step": 4, "name": "Test upload", "status": f"❌ {str(e)}"}
        )
        return get_status_response(500, "Failed to upload test image", setup_log)

    # All succeeded!
    setup_log["summary"] = {
        "status": "✅ MinIO setup and test successful!",
        "ready": True,
        "bucket": "gifts",
        "endpoint": endpoint,
        "next": "You can now upload images from the admin panel",
    }

    return get_status_response(200, "MinIO setup complete!", setup_log)
