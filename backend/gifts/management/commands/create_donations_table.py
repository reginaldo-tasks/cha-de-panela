"""
Django management command to create donations table if it doesn't exist.

Usage:
    python manage.py create_donations_table
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from django.conf import settings


def table_exists(table_name):
    """Check if a table exists in the database."""
    try:
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
    except Exception:
        return False


class Command(BaseCommand):
    help = (
        "Create donations table if it doesn't exist (fallback for migration failures)"
    )

    def handle(self, *args, **options):
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("CREATE DONATIONS TABLE"))
        self.stdout.write("=" * 60)

        db_engine = settings.DATABASES["default"]["ENGINE"]
        db_name = settings.DATABASES["default"].get("NAME", "N/A")

        self.stdout.write(f"\nDatabase engine: {db_engine}")
        self.stdout.write(f"Database name: {db_name}")

        # Check if table already exists
        if table_exists("donations"):
            self.stdout.write(
                self.style.SUCCESS(
                    "\n✓ Donations table already exists. No action needed."
                )
            )
            return

        self.stdout.write("\n→ Donations table does not exist. Creating it now...")

        try:
            with connection.cursor() as cursor:
                if "postgresql" in db_engine:
                    # PostgreSQL SQL
                    self.stdout.write("  Creating table (PostgreSQL format)...")
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
                    self.stdout.write("  Creating indexes...")
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
                    self.stdout.write("  Creating table (SQLite format)...")
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
                    self.stdout.write("  Creating indexes...")
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
                self.stdout.write(
                    self.style.SUCCESS("\n✓ Donations table created successfully!")
                )

                self.stdout.write("\nTable columns:")
                with connection.cursor() as cursor:
                    if "postgresql" in db_engine:
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
                        self.stdout.write(f"  - {row[0]}: {row[1]}")

                self.stdout.write("\n" + "=" * 60)
                self.stdout.write(
                    self.style.SUCCESS("✅ DONATIONS TABLE CREATED SUCCESSFULLY!")
                )
                self.stdout.write("=" * 60 + "\n")
            else:
                raise CommandError("Table creation verification failed.")

        except Exception as e:
            error_msg = str(e)
            if "already exists" in error_msg:
                self.stdout.write(
                    self.style.SUCCESS("\n✓ Table already exists (shown by database).")
                )
                return
            raise CommandError(f"Error creating table: {type(e).__name__}: {e}")
