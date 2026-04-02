"""
WSGI config for Gift Registry project.
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Setup Django before any other imports
django.setup()

from django.core.wsgi import get_wsgi_application
from django.core.management import call_command
from django.db import connection, IntegrityError

# Auto-initialize database on Vercel (ephemeral filesystem)
# Ensures database tables exist when serverless function cold-starts
def initialize_database():
    """Create tables if they don't exist"""
    try:
        with connection.cursor() as cursor:
            # Test if tables exist by querying a core table
            cursor.execute("SELECT 1 FROM auth_user LIMIT 1")
        return True
    except Exception:
        # Tables don't exist, run migrations
        try:
            call_command('migrate', verbosity=0, interactive=False)
            return True
        except Exception as e:
            print(f"Warning: Could not initialize database: {e}", file=sys.stderr)
            return False

# Initialize database before handling requests
if not initialize_database():
    print("Warning: Database initialization failed. Some requests may fail.", file=sys.stderr)

application = get_wsgi_application()
