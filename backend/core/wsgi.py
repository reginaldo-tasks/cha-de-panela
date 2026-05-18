"""
WSGI config for Gift Registry project.
"""

import os
import sys

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Setup Django first
django_app = get_wsgi_application()

# Run migrations and schema checks on startup (for Vercel serverless where DB only available at runtime)
import django
django.setup()

try:
    from django.core.management import call_command
    from django.db import connection
    
    # Only run on first cold start (check if we need to migrate)
    def _ensure_db_ready():
        """Ensure database has all required columns at startup."""
        try:
            is_postgresql = 'postgresql' in connection.settings_dict['ENGINE'].lower()
            
            if is_postgresql:
                with connection.cursor() as cursor:
                    # Check if theme column exists
                    cursor.execute("""
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'couples' AND column_name = 'theme' LIMIT 1
                    """)
                    if not cursor.fetchone():
                        print("[WSGI STARTUP] Adding missing couples.theme column...")
                        cursor.execute("""
                            ALTER TABLE couples ADD COLUMN theme VARCHAR(20) DEFAULT 'rose'
                        """)
                    
                    # Check if donation_options column exists
                    cursor.execute("""
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'gifts' AND column_name = 'donation_options' LIMIT 1
                    """)
                    if not cursor.fetchone():
                        print("[WSGI STARTUP] Adding missing gifts.donation_options column...")
                        cursor.execute("""
                            ALTER TABLE gifts ADD COLUMN donation_options jsonb DEFAULT '[]'::jsonb
                        """)
        except Exception as e:
            print(f"[WSGI STARTUP] Warning during schema check: {type(e).__name__}: {str(e)[:100]}")
    
    # Run on startup
    _ensure_db_ready()
    
except Exception as e:
    print(f"[WSGI STARTUP] Error during database initialization: {e}")
    import traceback
    traceback.print_exc()

# Wrap the application
class WSGIApplication:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app
    
    def __call__(self, environ, start_response):
        return self.wsgi_app(environ, start_response)

application = WSGIApplication(django_app)

