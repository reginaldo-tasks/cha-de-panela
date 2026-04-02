#!/bin/bash

# Gift Registry Django Backend - Start Script

set -e

echo "🎁 Gift Registry - Django Backend Startup"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "⚙️  Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️  Running migrations..."
python manage.py migrate

# Start development server
echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting development server..."
echo "📍 Server running at http://localhost:8000"
echo "📚 Admin panel at http://localhost:8000/admin"
echo ""
echo "👉 First time? Create your account using the registration page"
echo ""

python manage.py runserver 0.0.0.0:8000
