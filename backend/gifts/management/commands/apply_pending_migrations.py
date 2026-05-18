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
        try:
            with connection.cursor() as cursor:
                # Check if column exists
                cursor.execute("""
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'couples' AND column_name = 'theme'
                    LIMIT 1
                """)
                if cursor.fetchone():
                    self.stdout.write(self.style.SUCCESS("✓ couples.theme column already exists"))
                    return
            
            # Column doesn't exist, add it
            self.stdout.write("→ Adding missing couples.theme column...")
            with connection.cursor() as cursor:
                cursor.execute("""
                    ALTER TABLE couples ADD COLUMN theme VARCHAR(20) DEFAULT 'rose'
                """)
            self.stdout.write(self.style.SUCCESS("✓ couples.theme column created"))
            
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"⚠ Could not ensure couples.theme: {type(e).__name__}: {str(e)[:100]}"))
    
    def _ensure_gift_donation_options_column(self):
        """Ensure the donation_options column exists on gifts table."""
        try:
            with connection.cursor() as cursor:
                # Check if column exists
                cursor.execute("""
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'gifts' AND column_name = 'donation_options'
                    LIMIT 1
                """)
                if cursor.fetchone():
                    self.stdout.write(self.style.SUCCESS("✓ gifts.donation_options column already exists"))
                    self._print_completion()
                    return
            
            # Column doesn't exist, add it
            self.stdout.write("→ Adding missing gifts.donation_options column...")
            with connection.cursor() as cursor:
                cursor.execute("""
                    ALTER TABLE gifts ADD COLUMN donation_options jsonb DEFAULT '[]'::jsonb
                """)
            self.stdout.write(self.style.SUCCESS("✓ gifts.donation_options column created"))
            
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"⚠ Could not ensure gifts.donation_options: {type(e).__name__}: {str(e)[:100]}"))
        
        self._print_completion()
    
    def _print_completion(self):
        """Print schema check completion message."""
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("✓ Schema check complete"))
        self.stdout.write("=" * 60)
