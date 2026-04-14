#!/usr/bin/env python
"""
Emergency script to create donations table if migrations failed.
Run this if the donations table is missing from production.

Usage:
    python manage.py shell < create_donations_table.py

Or directly:
    python create_donations_table.py
"""
import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.db import connection
from django.conf import settings


def table_exists(table_name):
    """Check if a table exists in the database."""
    with connection.cursor() as cursor:
        if connection.vendor == "postgresql":
            cursor.execute(
                """
                SELECT EXISTS(
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = %s
                )
            """,
                [table_name],
            )
            return cursor.fetchone()[0]
        else:  # sqlite
            cursor.execute(
                """
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name=?
            """,
                [table_name],
            )
            return cursor.fetchone() is not None


def create_donations_table():
    """Create donations table if it doesn't exist."""
    print("=" * 60)
    print("CREATE DONATIONS TABLE - EMERGENCY SCRIPT")
    print("=" * 60)
    print(f"\nDatabase: {settings.DATABASES['default']['ENGINE']}")
    print(f"Database name: {settings.DATABASES['default']['NAME']}")

    if table_exists("donations"):
        print("\n✓ Donations table already exists. No action needed.")
        return True

    print("\n→ Donations table does not exist. Creating it now...")

    try:
        with connection.cursor() as cursor:
            if connection.vendor == "postgresql":
                # PostgreSQL SQL
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS donations (
                        id uuid PRIMARY KEY,
                        gift_id uuid NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
                        donor_name VARCHAR(255) NOT NULL,
                        amount NUMERIC(10, 2) NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                """
                )

                # Create indexes
                cursor.execute(
                    """
                    CREATE INDEX IF NOT EXISTS donations_gift_id_550374_idx 
                    ON donations(gift_id)
                """
                )

                cursor.execute(
                    """
                    CREATE INDEX IF NOT EXISTS donations_created_95af24_idx 
                    ON donations(created_at DESC)
                """
                )
            else:
                # SQLite SQL
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS donations (
                        id TEXT PRIMARY KEY,
                        gift_id TEXT NOT NULL REFERENCES gifts(id),
                        donor_name TEXT NOT NULL,
                        amount REAL NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                """
                )

                # Create indexes for SQLite
                cursor.execute(
                    """
                    CREATE INDEX IF NOT EXISTS donations_gift_id_550374_idx 
                    ON donations(gift_id)
                """
                )

                cursor.execute(
                    """
                    CREATE INDEX IF NOT EXISTS donations_created_95af24_idx 
                    ON donations(created_at DESC)
                """
                )

        # Verify table was created
        if table_exists("donations"):
            print("✓ Donations table created successfully!")
            print("\nTable details:")
            with connection.cursor() as cursor:
                if connection.vendor == "postgresql":
                    cursor.execute(
                        """
                        SELECT column_name, data_type 
                        FROM information_schema.columns 
                        WHERE table_name = 'donations'
                        ORDER BY ordinal_position
                    """
                    )
                else:
                    cursor.execute("PRAGMA table_info(donations)")

                for row in cursor.fetchall():
                    print(f"  - {row[0]}: {row[1]}")

            print("\n" + "=" * 60)
            print("✅ DONATIONS TABLE CREATED SUCCESSFULLY!")
            print("=" * 60)
            return True
        else:
            print("✗ Table creation verification failed.")
            return False

    except Exception as e:
        print(f"✗ Error creating table: {type(e).__name__}: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = create_donations_table()
    sys.exit(0 if success else 1)
