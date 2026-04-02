"""
Vercel serverless handler for Flask application
"""

import sys
import os

# Add parent directory to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from app import create_app

app = create_app()

def handler(environ, start_response):
    return app.wsgi_app(environ, start_response)
