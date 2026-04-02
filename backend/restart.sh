#!/bin/bash

# Backend restart script
cd /home/builds/happy-couple-registry/backend

echo "🔄 Reiniciando Backend Flask..."
pkill -f "python3.12 app.py" 2>/dev/null

sleep 2

echo "🚀 Iniciando Backend Flask em background..."
source venv/bin/activate
nohup python3.12 app.py > /tmp/backend.log 2>&1 &

sleep 3

echo "✅ Backend iniciado!"
echo "📍 URL: http://localhost:5000/api"
echo ""
echo "Testando health check..."
curl -s http://localhost:5000/api/health | python3 -m json.tool 2>/dev/null || echo "Aguardando inicialização..."
