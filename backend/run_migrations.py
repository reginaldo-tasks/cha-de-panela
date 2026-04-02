#!/usr/bin/env python
"""
Database migration runner for Vercel builds.
Ensures migrations are applied with proper error handling and logging.
"""
import os
import sys
import django

# Print current environment for debugging
print("=" * 60)
print("ENVIRONMENT CHECK")
print("=" * 60)
print(f"DJANGO_SETTINGS_MODULE: {os.getenv('DJANGO_SETTINGS_MODULE', 'NOT SET')}")
print(f"DB_NAME: {os.getenv('DB_NAME', 'NOT SET')}")
print(f"DB_USER: {os.getenv('DB_USER', 'NOT SET')}")
print(f"DB_PASSWORD: {'SET' if os.getenv('DB_PASSWORD') else 'NOT SET'}")
print(f"DB_HOST: {os.getenv('DB_HOST', 'NOT SET')}")
print(f"DB_PORT: {os.getenv('DB_PORT', 'NOT SET')}")
print(f"DEBUG: {os.getenv('DEBUG', 'NOT SET')}")

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Configure Django
try:
    django.setup()
    print("\n✓ Django setup successful")
except Exception as e:
    print(f"\n✗ Django setup failed: {e}")
    sys.exit(1)

# Import after Django setup
from django.core.management import call_command
from django.db import connections
from django.conf import settings


def check_database_connection():
    """Verify database connection is available."""
    print("\n" + "=" * 60)
    print("DATABASE CONNECTION CHECK")
    print("=" * 60)
    print(f"Database engine: {settings.DATABASES['default']['ENGINE']}")
    print(f"Database name: {settings.DATABASES['default']['NAME']}")
    print(f"Database host: {settings.DATABASES['default']['HOST']}")
    print(f"Database port: {settings.DATABASES['default']['PORT']}")
    
    try:
        connection = connections['default']
        connection.ensure_connection()
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False


def run_migrations():
    """Run Django migrations."""
    print("\n" + "=" * 60)
    print("RUNNING MIGRATIONS")
    print("=" * 60)
    try:
        print("→ Executing: python manage.py migrate --noinput")
        call_command('migrate', verbosity=2, interactive=False)
        print("✓ Migrations completed successfully")
        return True
    except Exception as e:
        print(f"✗ Migration error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False


def create_superuser_if_needed():
    """Create a superuser for initial setup if it doesn't exist."""
    from django.contrib.auth.models import User
    
    print("\n" + "=" * 60)
    print("SUPERUSER CHECK")
    print("=" * 60)
    try:
        admin_email = 'admin@chapanela.local'
        if not User.objects.filter(email=admin_email).exists():
            print(f"→ Creating superuser: {admin_email}")
            User.objects.create_superuser(
                username='admin',
                email=admin_email,
                password='change-me-in-production-123!',
                first_name='Admin',
                last_name='User'
            )
            print("✓ Superuser created (credentials: admin / change-me-in-production-123!)")
        else:
            print("→ Superuser already exists")
    except Exception as e:
        print(f"⚠ Superuser creation warning: {type(e).__name__}: {e}")


if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("DJANGO DATABASE MIGRATION RUNNER - VERCEL BUILD")
    print("=" * 60)
    
    # Check database connection
    if not check_database_connection():
        print("\n❌ FATAL: Could not connect to database")
        print("\nEnsure these environment variables are set in Vercel:")
        print("  ✓ DB_NAME = chapanela")
        print("  ✓ DB_USER = chapanela_user")
        print("  ✓ DB_PASSWORD = [your password]")
        print("  ✓ DB_HOST = dpg-d770ol9aae7s73dilprg-a.oregon-postgres.render.com")
        print("  ✓ DB_PORT = 5432")
        sys.exit(1)
    
    # Run migrations
    if not run_migrations():
        print("\n❌ FATAL: Migrations failed")
        sys.exit(1)
    
    # Attempt to create superuser
    create_superuser_if_needed()
    
    print("\n" + "=" * 60)
    print("✅ DATABASE SETUP COMPLETE!")
    print("=" * 60)
    sys.exit(0)
