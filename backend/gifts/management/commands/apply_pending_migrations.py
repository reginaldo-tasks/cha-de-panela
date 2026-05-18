"""
Management command to apply pending migrations and ensure database schema is up-to-date.
This is a fallback mechanism for Vercel deployments where migrations might not run during build.
"""
from django.core.management.base import BaseCommand
from django.db import connection
from django.core.management import call_command
from django.apps import apps


class Command(BaseCommand):
    help = 'Apply pending migrations and add missing columns if needed'

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("APPLYING PENDING MIGRATIONS")
        self.stdout.write("=" * 60)
        
        # First, try to run all pending migrations
        try:
            self.stdout.write("\nRunning: python manage.py migrate --noinput")
            call_command('migrate', verbosity=2, interactive=False)
            self.stdout.write(self.style.SUCCESS("✓ All migrations applied successfully"))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"⚠ Migration warning: {e}"))
        
        # Check and manually add columns if they're missing
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write("CHECKING SCHEMA")
        self.stdout.write("=" * 60)
        
        self._ensure_couple_theme_column()
        self._ensure_gift_donation_options_column()
    
    def _ensure_couple_theme_column(self):
        """Ensure the theme column exists on couples table."""
        with connection.cursor() as cursor:
            try:
                # Check if column exists
                cursor.execute("""
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'couples' AND column_name = 'theme'
                """)
                if cursor.fetchone():
                    self.stdout.write(self.style.SUCCESS("✓ couples.theme column already exists"))
                else:
                    self.stdout.write("→ Adding missing couples.theme column...")
                    cursor.execute("""
                        ALTER TABLE couples ADD COLUMN theme VARCHAR(20) DEFAULT 'rose'
                    """)
                    connection.commit()
                    self.stdout.write(self.style.SUCCESS("✓ couples.theme column created"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"⚠ Could not check/create couples.theme: {e}"))
    
    def _ensure_gift_donation_options_column(self):
        """Ensure the donation_options column exists on gifts table."""
        with connection.cursor() as cursor:
            try:
                # Check if column exists
                cursor.execute("""
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'gifts' AND column_name = 'donation_options'
                """)
                if cursor.fetchone():
                    self.stdout.write(self.style.SUCCESS("✓ gifts.donation_options column already exists"))
                else:
                    self.stdout.write("→ Adding missing gifts.donation_options column...")
                    cursor.execute("""
                        ALTER TABLE gifts ADD COLUMN donation_options jsonb DEFAULT '[]'::jsonb
                    """)
                    connection.commit()
                    self.stdout.write(self.style.SUCCESS("✓ gifts.donation_options column created"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"⚠ Could not check/create gifts.donation_options: {e}"))
        
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("✓ Schema check complete"))
        self.stdout.write("=" * 60)
