#!/bin/bash

# Script para gerar Secret Keys para Django e JWT
# Uso: ./generate_secrets.sh

echo "╔════════════════════════════════════════╗"
echo "║  🔐 Secret Keys Generator              ║"
echo "║  Para Chá de Panela (Produção)         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Verificar se Python está instalado
if ! command -v python &> /dev/null; then
    echo "❌ Python não encontrado. Instale Python 3.11+"
    exit 1
fi

echo "📝 Gerando chaves criptográficas..."
echo ""

# Gerar SECRET_KEY (Django)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 SECRET_KEY (Django)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
echo "$SECRET_KEY"
echo ""

# Gerar JWT_SECRET_KEY (PyJWT)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 JWT_SECRET_KEY (PyJWT)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(50))")
echo "$JWT_SECRET_KEY"
echo ""

# Opção de salvar em arquivo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Opções:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Salvar em backend/.env.production"
echo "2️⃣  Salvar em backend/.env (desenvolvimento)"
echo "3️⃣  Apenas exibir (copiar manualmente)"
echo ""
read -p "Escolha uma opção (1/2/3): " option

case $option in
    1)
        echo ""
        echo "📁 Salvando em backend/.env.production..."
        cat >> "backend/.env.production" << EOF

# Secret Keys (Gerado: $(date))
SECRET_KEY=$SECRET_KEY
JWT_SECRET_KEY=$JWT_SECRET_KEY
EOF
        echo "✅ Chaves salvas em backend/.env.production"
        echo ""
        ;;
    2)
        echo ""
        echo "📁 Salvando em backend/.env..."
        cat >> "backend/.env" << EOF

# Secret Keys (Gerado: $(date))
SECRET_KEY=$SECRET_KEY
JWT_SECRET_KEY=$JWT_SECRET_KEY
EOF
        echo "✅ Chaves salvas em backend/.env"
        echo ""
        ;;
    3)
        echo ""
        echo "📋 Copie as chaves abaixo para o seu .env:"
        echo ""
        echo "SECRET_KEY=$SECRET_KEY"
        echo "JWT_SECRET_KEY=$JWT_SECRET_KEY"
        echo ""
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Próximos passos:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Se ainda não fez, configure no Vercel:"
echo "   vercel env add SECRET_KEY"
echo "   vercel env add JWT_SECRET_KEY"
echo ""
echo "2. Teste localmente:"
echo "   python manage.py check"
echo "   python manage.py runserver"
echo ""
echo "3. Deploy:"
echo "   git push"
echo ""
echo "✅ Pronto!"
