#!/bin/bash

# Backend starter script for Happy Couple Registry

echo "🎁 Happy Couple Registry - Backend Setup"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if database exists
if [ ! -f "gifts_registry.db" ]; then
    echo "🌱 Seeding database..."
    python seed.py
else
    echo "✅ Database already exists"
fi

# Start the Flask app
echo ""
echo "🚀 Starting Flask server..."
echo "Server will be available at: http://localhost:5000"
echo ""
python app.py
