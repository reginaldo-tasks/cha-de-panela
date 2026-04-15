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

    NOTE: This endpoint generates credentials but actual user creation
    should be done via MinIO console or using mc (MinIO Client) CLI.
    """

    endpoint = (
        os.getenv("MINIO_ENDPOINT", "").replace("https://", "").replace("http://", "")
    )
    root_user = os.getenv("MINIO_ROOT_USER", "")
    root_password = os.getenv("MINIO_ROOT_PASSWORD", "")

    if not all([endpoint, root_user, root_password]):
        return None, None, "Missing MinIO configuration"

    try:
        # Generate credentials for new user
        app_user = "gifts-app"
        app_password = os.urandom(16).hex()  # Generate secure random password

        # This is a workaround since MinIO Python SDK doesn't have full admin user management
        # The user should be created via:
        # 1. MinIO Web Console (http://minio-endpoint:9001)
        # 2. Using MinIO mc CLI: mc admin user add minio gifts-app PASSWORD

        # However, we can suggest next steps
        instructions = f"""
MinIO User Credentials Generated:
Username: {app_user}
Password: {app_password}

To create this user in MinIO:
1. Via Console: Login to {endpoint}:9001
2. Or via CLI: mc admin user add TARGET_ALIAS {app_user} {app_password}
3. Then assign policy: mc admin policy attach TARGET_ALIAS readwrite --user {app_user}

Then update Vercel env variables:
- MINIO_ROOT_USER={app_user}
- MINIO_ROOT_PASSWORD={app_password}
"""

        return (
            app_user,
            app_password,
            "Credentials generated. Create user manually via MinIO console.",
        )

    except Exception as e:
        import traceback

        return None, None, f"Error: {str(e)}. Trace: {traceback.format_exc()}"


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
