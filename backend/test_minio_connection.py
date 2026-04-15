#!/usr/bin/env python
"""
Test MinIO connectivity and credentials.
Run locally or in production to debug MinIO issues.
"""

import os
import sys
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError


def test_minio_connection():
    """Test MinIO connection, credentials, and permissions."""

    endpoint = os.getenv("MINIO_ENDPOINT", "https://minio-latest-2yx5.onrender.com")
    access_key = os.getenv("MINIO_ROOT_USER")
    secret_key = os.getenv("MINIO_ROOT_PASSWORD")
    bucket_name = "gifts"

    print(f"Testing MinIO Connection")
    print(f"=" * 60)
    print(f"Endpoint: {endpoint}")
    print(f"Access Key Present: {bool(access_key)}")
    print(f"Secret Key Present: {bool(secret_key)}")
    print(f"Bucket: {bucket_name}")
    print(f"=" * 60)

    if not access_key or not secret_key:
        print("❌ ERROR: Credentials not configured!")
        print(f"   MINIO_ROOT_USER: {access_key}")
        print(f"   MINIO_ROOT_PASSWORD: {secret_key}")
        return False

    try:
        # Create boto3 client
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
        print("✓ MinIO client created successfully")

        # Test 1: Check bucket exists
        try:
            response = client.head_bucket(Bucket=bucket_name)
            print(f"✓ Bucket '{bucket_name}' exists and is accessible")
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            if error_code == "404":
                print(
                    f"⚠ Bucket '{bucket_name}' does not exist (will attempt to create)"
                )
            elif error_code == "403":
                print(f"❌ Access denied to bucket '{bucket_name}'")
                print(f"   Error: {e.response.get('Error', {}).get('Message', str(e))}")
                return False
            else:
                print(f"❌ Error checking bucket: {e}")
                return False

        # Test 2: List buckets
        try:
            response = client.list_buckets()
            buckets = [b["Name"] for b in response.get("Buckets", [])]
            print(f"✓ Available buckets: {buckets}")
            if bucket_name not in buckets:
                print(
                    f"  Note: '{bucket_name}' not in list, will create on first upload"
                )
        except ClientError as e:
            print(f"⚠ Could not list buckets: {e}")

        # Test 3: Try uploading a test file (if bucket writeable)
        try:
            test_key = "test-connection.txt"
            test_content = b"Test upload from test_minio_connection.py"

            client.put_object(
                Bucket=bucket_name,
                Key=test_key,
                Body=test_content,
                ContentType="text/plain",
            )
            print(f"✓ Successfully uploaded test file: {test_key}")

            # Try to delete it
            try:
                client.delete_object(Bucket=bucket_name, Key=test_key)
                print(f"✓ Successfully deleted test file: {test_key}")
            except Exception as delete_error:
                print(f"⚠ Could not delete test file: {delete_error}")

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            error_msg = e.response.get("Error", {}).get("Message", str(e))
            if error_code == "403":
                print(f"❌ Access denied for upload (403 Forbidden)")
                print(f"   Error: {error_msg}")
                print(
                    f"   Credentials may not have write permission to '{bucket_name}'"
                )
                return False
            else:
                print(f"❌ Upload failed: {error_msg}")
                return False

        print(f"=" * 60)
        print("✓ MinIO connection test successful!")
        return True

    except Exception as e:
        print(f"❌ Failed to create MinIO client: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_minio_connection()
    sys.exit(0 if success else 1)
