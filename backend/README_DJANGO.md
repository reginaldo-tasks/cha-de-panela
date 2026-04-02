# 🎁 Django DRF Backend - Cha de Panela

Backend Django REST Framework para a aplicação de Lista de Presentes de Casamento.

## 📋 Requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)

## 🚀 Setup Rápido

### Opção 1: Script automático (recomendado)

```bash
chmod +x start.sh
./start.sh
```

### Opção 2: Setup Manual
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

#### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

#### 3. Executar migrações
```bash
python manage.py migrate
```

#### 4. Criar superusuário (admin) - OPCIONAL
```bash
python manage.py createsuperuser
```

#### 5. Executar servidor
```bash
python manage.py runserver 0.0.0.0:8000
```

O servidor estará disponível em `http://localhost:8000`

**Nota**: O banco de dados iniciará vazio. Acesse o frontend e crie sua conta usando a página de registro.

## 🔌 API Endpoints

### Autenticação

#### 🔓 Login
```
POST /api/auth/login/
Body: {
  "email": "casal@email.com",
  "password": "senha123"
}
Response: {
  "token": "jwt_token_here",
  "couple": { id, couple_name, list_title, ... }
}
```

#### 📝 Registrar Novo Usuário
```
POST /api/auth/register/
Body: {
  "email": "novo@email.com",
  "password": "senha123",
  "couple_name": "Novo Casal" (opcional)
}
Response: {
  "token": "jwt_token_here",
  "couple": { id, couple_name, ... }
}
```

```
GET /api/auth/me/
Headers: Authorization: Bearer {token}
Response: { id, email, couple_name, ... }
```

### 💑 Casal

#### 👁️ Get Informações Públicas do Casal
```
GET /api/couple/{id}/
Response: { id, couple_name, list_title, wedding_date, biography, ... }
```

#### ✏️ Atualizar Perfil do Casal
```
PUT /api/couple/{id}/
Headers: Authorization: Bearer {token}
Body: {
  "couple_name": "Novo Nome",
  "list_title": "Título da Lista",
  "whatsapp": "5511999999999",
  "pix_key": "chave.pix@email.com",
  "wedding_date": "2025-06-15",
  "biography": "Nossa história...",
  "image_url": "https://...",
  "qr_code_url": "https://..."
}
Response: { id, couple_name, list_title, ... }
```

### 🎁 Presentes

#### 📖 Listar Todos os Presentes
```
GET /api/gifts/
Query params:
  - couple_id: Filtrar por casal
  - status: Filtrar por status (available, reserved, purchased)
Response: [{ id, name, description, price, status, ... }, ...]
```

#### 🔍 Obter Detalhes de um Presente
```
GET /api/gifts/{id}/
Response: { id, name, description, price, status, ... }
```

#### ➕ Criar Presente
```
POST /api/gifts/
Headers: Authorization: Bearer {token}
Body: {
  "name": "Jogo de cozinha",
  "description": "Descrição do presente",
  "category": "Cozinha",
  "price": 150.00,
  "priority": 1,
  "image_url": "https://...",
  "url": "https://..."
}
Response: { id, name, ... }
```

#### 📝 Atualizar Presente
```
PUT /api/gifts/{id}/
Headers: Authorization: Bearer {token}
Body: { name, description, category, price, status, ... }
Response: { id, name, ... }
```

#### 🗑️ Deletar Presente
```
DELETE /api/gifts/{id}/
Headers: Authorization: Bearer {token}
Response: (204 No Content)
```

#### 🎫 Reservar Presente (Público)
```
POST /api/gifts/{id}/reserve/
Body: { "name": "Nome de quem vai presentear" }
Response: { id, name, status: "reserved", reserved_by, ... }
```

#### ✅ Marcar Presente como Comprado (Owner Only)
```
POST /api/gifts/{id}/select/
Headers: Authorization: Bearer {token}
Response: { id, name, status: "purchased", is_selected: true, ... }
```

## ✅ Health Check

```
GET /api/health/
Response: { status: "ok" }
```

## 📚 Documentação Interativa

- **Swagger UI**: http://localhost:8000/api/docs/swagger/
- **ReDoc**: http://localhost:8000/api/docs/redoc/
- **Schema OpenAPI**: http://localhost:8000/api/schema/

## 🗄️ Banco de Dados

- **Tipo**: SQLite (padrão) ou PostgreSQL
- **Arquivo**: `db.sqlite3` (para SQLite)
- **ORM**: Django ORM

### Tabelas
- **auth_user** - Usuários do sistema
- **couples** - Informações dos casais/admins
- **gifts** - Lista de presentes

## 🔧 Variáveis de Ambiente

```
DEBUG=True                                  # Debug mode
DJANGO_SETTINGS_MODULE=core.settings        # Módulo de configuração
SECRET_KEY=...                             # Chave secreta para sessões
JWT_SECRET_KEY=...                         # Chave secreta para JWT tokens
DATABASE_URL=sqlite:///db.sqlite3          # URL do banco de dados
ALLOWED_HOSTS=localhost,127.0.0.1          # Hosts permitidos
CORS_ORIGINS=http://localhost:5173,...     # Origens CORS permitidas
```

## 📦 Dependências Principais

- **Django 4.2** - Framework web
- **Django REST Framework** - API REST
- **PyJWT** - Autenticação JWT
- **django-cors-headers** - Suporte CORS
- **drf-spectacular** - Documentação OpenAPI/Swagger
- **Pillow** - Processamento de imagens

## 🏗️ Estrutura do Projeto

```
backend/
  manage.py              # Comando principal Django
  seed.py                # Script para popular BD
  start.sh              # Script para iniciar
  requirements.txt      # Dependências
  
  core/
    settings.py         # Configurações Django
    urls.py             # Rotas principais
    wsgi.py             # WSGI application
    asgi.py             # ASGI application
  
  gifts/
    models.py           # Modelos (Couple, Gift)
    serializers.py      # Serializers DRF
    views.py            # Views/ViewSets genéricos
    urls.py             # Rotas da app
    permissions.py      # Permissões customizadas
    admin.py            # Admin Django
    apps.py             # Config da app
  
  api/
    authentication.py   # Autenticação JWT customizada
```

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'django'"
```bash
pip install -r requirements.txt
```

### Banco de dados corrompido
```bash
rm db.sqlite3
python manage.py migrate
python seed.py
```

### Erro de CORS
Verifique se a origem do frontend está em `CORS_ORIGINS` no `.env`

### Erro de migração
```bash
python manage.py migrate --fake initial  # Se necessário
python manage.py migrate
```

## 🔐 Segurança

### Regras de Negócio Implementadas no Backend

1. **Autenticação JWT**: Todos os endpoints de escrita requerem token JWT válido
2. **Verificação de Proprietário**: Only couple owners can update their gifts
3. **Validação de Presente Comprado**: Presentes comprados não podem ser reservados
4. **Validação de Presentes Reservados**: Um presente só pode ter uma reserva por vez
5. **Validações de Dados**: Validações de preço positivo, prioridade ≥ 1, etc.

## 🚀 Deploy

### Para Vercel, Heroku ou similar

1. Configure as variáveis de ambiente no provider
2. Use um banco PostgreSQL (recomendado para produção)
3. Configure `ALLOWED_HOSTS` apropriadamente
4. Execute `python manage.py collectstatic`
5. Configure o arquivo wsgi.py para o provider

## 📝 Licença

MIT License
