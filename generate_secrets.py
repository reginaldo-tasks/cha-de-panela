#!/usr/bin/env python
"""
Script para gerar Secret Keys para Django e JWT
Uso: python generate_secrets.py
"""

import secrets
import os
import sys
from pathlib import Path

def generate_django_secret():
    """Gera SECRET_KEY para Django"""
    from django.core.management.utils import get_random_secret_key
    return get_random_secret_key()

def generate_jwt_secret():
    """Gera JWT_SECRET_KEY"""
    return secrets.token_urlsafe(50)

def print_header(text):
    """Imprime cabeçalho formatado"""
    print("\n" + "━" * 50)
    print(f"  {text}")
    print("━" * 50)

def main():
    """Função principal"""
    print("╔════════════════════════════════════════╗")
    print("║  🔐 Secret Keys Generator              ║")
    print("║  Para Chá de Panela (Produção)         ║")
    print("╚════════════════════════════════════════╝")
    
    try:
        # Gerar chaves
        print("\n📝 Gerando chaves criptográficas...")
        
        secret_key = generate_django_secret()
        jwt_secret_key = generate_jwt_secret()
        
        # Exibir chaves
        print_header("🔑 SECRET_KEY (Django)")
        print(secret_key)
        
        print_header("🔐 JWT_SECRET_KEY (PyJWT)")
        print(jwt_secret_key)
        
        # Menu de opções
        print_header("💾 Opções")
        print("\n1️⃣  Salvar em backend/.env.production")
        print("2️⃣  Salvar em backend/.env (desenvolvimento)")
        print("3️⃣  Exibir código para copiar manualmente")
        print("4️⃣  Sair")
        
        choice = input("\nEscolha uma opção (1-4): ").strip()
        
        if choice == "1":
            save_to_file("backend/.env.production", secret_key, jwt_secret_key)
        elif choice == "2":
            save_to_file("backend/.env", secret_key, jwt_secret_key)
        elif choice == "3":
            print_copy_format(secret_key, jwt_secret_key)
        elif choice == "4":
            print("\n👋 Até logo!")
            sys.exit(0)
        else:
            print("\n❌ Opção inválida")
            sys.exit(1)
        
        # Próximos passos
        print_header("✨ Próximos passos")
        print("""
1. Configure no Vercel:
   vercel env add SECRET_KEY
   vercel env add JWT_SECRET_KEY

2. Teste localmente:
   python manage.py check
   python manage.py runserver

3. Deploy:
   git add backend/.env.production
   git commit -m "Update secret keys"
   git push

✅ Pronto!
        """)

    except ImportError as e:
        print(f"\n❌ Erro: {e}")
        print("Certifique-se de ter Django instalado: pip install django")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)

def save_to_file(filepath, secret_key, jwt_secret_key):
    """Salva as chaves em arquivo"""
    import datetime
    
    content = f"\n# Secret Keys (Gerado: {datetime.datetime.now().isoformat()})\nSECRET_KEY={secret_key}\nJWT_SECRET_KEY={jwt_secret_key}\n"
    
    try:
        path = Path(filepath)
        
        # Criar arquivo se não existir
        if not path.exists():
            path.touch()
        
        # Adicionar chaves
        with open(path, "a") as f:
            f.write(content)
        
        print(f"\n✅ Chaves salvas em {filepath}")
        print(f"📁 Caminho completo: {path.absolute()}")
        
    except Exception as e:
        print(f"\n❌ Erro ao salvar arquivo: {e}")
        print("Copie as chaves manualmente:")
        print_copy_format(secret_key, jwt_secret_key)

def print_copy_format(secret_key, jwt_secret_key):
    """Exibe formato para copiar manualmente"""
    print(f"""
📋 Para copiar manualmente, adicione ao seu .env:

SECRET_KEY={secret_key}
JWT_SECRET_KEY={jwt_secret_key}

⚠️  Não compartilhe estas chaves!
    """)

if __name__ == "__main__":
    main()
