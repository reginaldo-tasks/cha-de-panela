#!/usr/bin/env python
"""
Emergency script to create donations table directly in production database.
Run this with: python force_create_donations_table.py
"""
import os
import psycopg2
from psycopg2 import sql

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set!")
    exit(1)

print("=" * 60)
print("FORCE CREATE DONATIONS TABLE IN PRODUCTION")
print("=" * 60)

try:
    # Connect to PostgreSQL
    print(f"\n→ Connecting to PostgreSQL database...")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Check if table exists
    print("→ Checking if donations table exists...")
    cursor.execute(
        """
        SELECT EXISTS(
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'donations'
        )
    """
    )
    table_exists = cursor.fetchone()[0]

    if table_exists:
        print("✓ Donations table already exists!")
    else:
        print("→ Table does not exist. Creating now...")

        # Create donations table
        cursor.execute(
            """
            CREATE TABLE donations (
                id uuid PRIMARY KEY,
                gift_id uuid NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
                donor_name VARCHAR(255) NOT NULL,
                amount NUMERIC(10, 2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
        print("✓ Created donations table")

        # Create indexes
        print("→ Creating indexes...")
        cursor.execute(
            """
            CREATE INDEX donations_gift_id_550374_idx ON donations(gift_id)
        """
        )
        print("✓ Created gift_id index")

        cursor.execute(
            """
            CREATE INDEX donations_created_95af24_idx ON donations(created_at DESC)
        """
        )
        print("✓ Created created_at index")

        # Commit changes
        conn.commit()
        print("\n✓ DONATIONS TABLE CREATED SUCCESSFULLY!")

    cursor.close()
    conn.close()

except psycopg2.Error as e:
    print(f"\n✗ Database error: {type(e).__name__}")
    print(f"  {str(e)}")
    exit(1)
except Exception as e:
    print(f"\n✗ Error: {type(e).__name__}")
    print(f"  {str(e)}")
    exit(1)

print("\n" + "=" * 60)
print("Done! The /api/gifts/*/donate/ endpoint should now work.")
print("=" * 60)
