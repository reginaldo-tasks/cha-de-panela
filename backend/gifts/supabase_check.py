"""
Diagnostic endpoint for Supabase S3 storage configuration.
"""

import os
import sys
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


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
@permission_classes([AllowAny])
def check_supabase_s3(request):
    """
    Check Supabase S3 configuration and connectivity.

    GET: Diagnostic report
    POST: Test upload

    Query param: token=YOUR_ADMIN_TOKEN
    """
    # Security check
    token = request.query_params.get("token", "")
    if token != ADMIN_TOKEN:
        return get_status_response(
            403, "Invalid or missing admin token", {"hint": "Use ?token=YOUR_TOKEN"}
        )

    endpoint = os.getenv("SUPABASE_S3_ENDPOINT", "")
    access_key = os.getenv("SUPABASE_ACCESS_KEY", "").strip()
    secret_key = os.getenv("SUPABASE_SECRET_KEY", "").strip()
    region = os.getenv("SUPABASE_REGION", "us-east-2")

    diagnostics = {
        "timestamp": str(__import__("datetime").datetime.now().isoformat()),
        "environment": {},
        "client": {},
        "bucket": {},
        "summary": {},
    }

    # Check environment variables
    diagnostics["environment"] = {
        "endpoint_configured": bool(endpoint),
        "endpoint": endpoint,
        "access_key_configured": bool(access_key),
        "access_key_sample": (
            f"{access_key[:3]}...{access_key[-3:]}" if access_key else None
        ),
        "secret_key_configured": bool(secret_key),
        "secret_key_length": len(secret_key) if secret_key else 0,
        "region": region,
    }

    if not endpoint or not access_key or not secret_key:
        diagnostics["summary"] = {
            "overall": "❌ Missing configuration",
            "issue": "Not all Supabase S3 credentials are configured",
            "required_env_vars": [
                "SUPABASE_S3_ENDPOINT",
                "SUPABASE_ACCESS_KEY",
                "SUPABASE_SECRET_KEY",
                "SUPABASE_REGION",
            ],
        }
        return get_status_response(200, "Configuration incomplete", diagnostics)

    # Try to create boto3 client
    try:
        import boto3
        from botocore.client import Config

        config = Config(
            signature_version="s3v4",
            retries={"max_attempts": 2, "mode": "standard"},
            connect_timeout=10,
            read_timeout=60,
        )

        client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
            config=config,
        )

        diagnostics["client"]["status"] = "✅ Created"

    except Exception as e:
        diagnostics["client"]["status"] = f"❌ Error: {str(e)}"
        diagnostics["summary"] = {
            "overall": "❌ Cannot create S3 client",
            "error": str(e),
        }
        return get_status_response(200, "Client creation failed", diagnostics)

    # Try to list buckets
    try:
        response = client.list_buckets()
        buckets = [b["Name"] for b in response.get("Buckets", [])]
        diagnostics["bucket"]["list"] = buckets
        diagnostics["bucket"]["gifts_exists"] = "gifts" in buckets
        diagnostics["bucket"]["status"] = "✅ Bucket list retrieved"
    except Exception as e:
        diagnostics["bucket"]["status"] = f"❌ Error listing buckets: {str(e)}"

    # For POST, try a test upload
    if request.method == "POST":
        try:
            from io import BytesIO
            from PIL import Image
            import uuid

            # Create test image
            img = Image.new("RGB", (50, 50), color="red")
            img_bytes = BytesIO()
            img.save(img_bytes, format="JPEG", quality=70)
            img_bytes.seek(0)

            test_key = f"admin-test-{uuid.uuid4()}.jpg"

            # Try upload
            client.put_object(
                Bucket="gifts",
                Key=test_key,
                Body=img_bytes.getvalue(),
                ContentType="image/jpeg",
            )

            diagnostics["bucket"]["test_upload"] = "✅ Test upload succeeded"
            diagnostics["bucket"]["test_key"] = test_key

            # Try cleanup
            try:
                client.delete_object(Bucket="gifts", Key=test_key)
            except:
                pass

        except Exception as e:
            diagnostics["bucket"]["test_upload"] = f"❌ {str(e)}"

    # Generate summary
    all_good = (
        bool(endpoint)
        and bool(access_key)
        and bool(secret_key)
        and "✅" in diagnostics["client"].get("status", "")
    )

    diagnostics["summary"] = {
        "overall": "✅ Configuration OK" if all_good else "❌ Issues detected",
        "ready": all_good,
        "next": (
            "Try POST request to test upload"
            if all_good
            else "Check configuration above"
        ),
    }

    return get_status_response(200, "Supabase S3 diagnostic complete", diagnostics)
