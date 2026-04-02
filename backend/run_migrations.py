#!/usr/bin/env python
"""
Database migration runner for Vercel builds.
Ensures migrations are applied with proper error handling and logging.
"""
import os
import sys
import django

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Configure Django
django.setup()

# Import after Django setup
from django.core.management import call_command
from django.db import connections


def check_database_connection():
    """Verify database connection is available."""
    try:
        connection = connections['default']
        connection.ensure_connection()
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False


def run_migrations():
    """Run Django migrations."""
    try:
        print("\n→ Running database migrations...")
        call_command('migrate', verbosity=2, interactive=False)
        print("✓ Migrations completed successfully")
        return True
    except Exception as e:
        print(f"✗ Migration error: {e}")
        return False


def create_superuser_if_needed():
    """Create a superuser for initial setup if it doesn't exist."""
    from django.contrib.auth.models import User
    
    try:
        admin_email = 'admin@chapanela.local'
        if not User.objects.filter(email=admin_email).exists():
            print(f"\n→ Creating superuser: {admin_email}")
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
        print(f"✗ Superuser creation error: {e}")


if __name__ == '__main__':
    print("=" * 60)
    print("DJANGO DATABASE MIGRATION RUNNER")
    print("=" * 60)
    
    # Check database connection
    if not check_database_connection():
        print("\n⚠ Warning: Could not connect to database")
        print("Make sure environment variables are set:")
        print("  - DB_NAME, DB_USER, DB_PASSWORD")
        print("  - DB_HOST, DB_PORT")
        sys.exit(1)
    
    # Run migrations
    if not run_migrations():
        sys.exit(1)
    
    # Attempt to create superuser
    create_superuser_if_needed()
    
    print("\n" + "=" * 60)
    print("Database setup complete!")
    print("=" * 60)
