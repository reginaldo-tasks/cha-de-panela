"""
MinIO user creation and policy assignment utilities.
Uses MinIO Admin API to create dedicated user with proper permissions.
"""

import os
import json
from minio import Minio
from minio.error import S3Error


def create_app_user():
    """
    Create a dedicated 'gifts-app' user in MinIO with proper permissions.
    Returns: (access_key, secret_key) or (None, None) on error
    """

    endpoint = (
        os.getenv("MINIO_ENDPOINT", "").replace("https://", "").replace("http://", "")
    )
    root_user = os.getenv("MINIO_ROOT_USER", "")
    root_password = os.getenv("MINIO_ROOT_PASSWORD", "")

    if not all([endpoint, root_user, root_password]):
        return None, None, "Missing MinIO configuration"

    try:
        # Create admin client with root credentials
        use_ssl = "minio" not in endpoint  # SSL if not localhost or IP
        port = 9000  # Default MinIO port

        admin_client = Minio(
            endpoint,
            access_key=root_user,
            secret_key=root_password,
            secure=use_ssl,
            region="us-east-1",
        )

        # User details
        app_user = "gifts-app"
        app_password = os.urandom(16).hex()  # Generate secure random password

        # Check if user exists
        try:
            # Try to describe user (this will fail if user doesn't exist)
            info = admin_client.admin_user_info(app_user)
            return app_user, app_password, "User already exists"
        except:
            # User doesn't exist, create it
            pass

        # Create the new user
        admin_client.admin_user_add(app_user, app_password)

        # Policy for gifts bucket (allow read/write)
        policy_dict = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": f"arn:aws:iam::000000000000:user/{app_user}"},
                    "Action": [
                        "s3:GetObject",
                        "s3:PutObject",
                        "s3:DeleteObject",
                        "s3:ListBucket",
                    ],
                    "Resource": [
                        "arn:aws:s3:::gifts",
                        "arn:aws:s3:::gifts/*",
                    ],
                }
            ],
        }

        # Attach policy to user
        admin_client.admin_policy_attach("readwrite", app_user)

        return app_user, app_password, "User created successfully"

    except Exception as e:
        return None, None, f"Failed to create user: {str(e)}"


def set_bucket_policy_public():
    """Set bucket policy to allow public read access"""

    endpoint = (
        os.getenv("MINIO_ENDPOINT", "").replace("https://", "").replace("http://", "")
    )
    root_user = os.getenv("MINIO_ROOT_USER", "")
    root_password = os.getenv("MINIO_ROOT_PASSWORD", "")

    if not all([endpoint, root_user, root_password]):
        return False, "Missing MinIO configuration"

    try:
        use_ssl = "minio" not in endpoint

        admin_client = Minio(
            endpoint,
            access_key=root_user,
            secret_key=root_password,
            secure=use_ssl,
        )

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

        admin_client.set_bucket_policy("gifts", json.dumps(policy))
        return True, "Public read policy set"

    except Exception as e:
        return False, f"Failed to set policy: {str(e)}"
