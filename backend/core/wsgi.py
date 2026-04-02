"""
WSGI config for Gift Registry project.
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Initialize Django
django.setup()

from django.core.wsgi import get_wsgi_application
from django.core.management import call_command
from django.db import connection

# Auto-migrate on first request if tables don't exist
def ensure_database_initialized():
    """Create tables if they don't exist"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM auth_user LIMIT 1")
        return True  # Tables exist
    except Exception:
        # Tables don't exist, run migrations
        try:
            call_command('migrate', verbosity=0, interactive=False)
            return True
        except Exception as e:
            print(f"Warning: Database migration failed: {e}", file=sys.stderr)
            return False

# Ensure database is initialized
ensure_database_initialized()

application = get_wsgi_application()
