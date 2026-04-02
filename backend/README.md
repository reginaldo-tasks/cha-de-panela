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

#### 1. Criar ambiente virtual
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

## 👤 Fluxo de Primeiro Acesso

1. Inicie o backend com `./start.sh`
2. Inicie o frontend (em outra aba)
3. Acesse http://localhost:5173 (ou a porta do seu frontend)
4. Clique em "Criar Conta" ou "Registrar"
5. Preenchça:
   - Email: seu-email@exemplo.com
   - Senha: sua-senha-segura
   - Nome do Casal: (opcional, pode deixar em branco)
6. Você receberá um token JWT e será autenticado automaticamente
7. Agora pode criar sua lista de presentes

## 🌱 Seed com Dados de Teste (OPCIONAL)

Se você quiser testar a aplicação com dados de exemplo:

```bash
python seed.py
```

Isso criará um casal padrão com:
- 📧 Email: `casal@email.com`
- 🔑 Senha: `senha123`
- 💑 Casal: Iara & Ramon
- 5 presentes de exemplo

## 🔌 API Endpoints

### Autenticação

#### 🔓 Login
```
POST /api/auth/login
Body: {
  "email": "casal@email.com",
  "password": "senha123"
}
Response: {
  "token": "jwt_token_here",
  "couple": { id, email, coupleName, ... }
}
```

#### 👤 Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { id, email, coupleName, ... }
```

### 💑 Casal

#### 👁️ Get Public Info
```
GET /api/couple/public
Response: { id, coupleName, weddingDate, biography, ... }
```

#### ✏️ Update Couple
```
PUT /api/couple
Headers: Authorization: Bearer {token}
Body: {
  "coupleName": "Novo Nome",
  "listTitle": "Título da Lista",
  "whatsapp": "5511999999999",
  "pixKey": "chave.pix@email.com",
  "weddingDate": "2025-06-15",
  "biography": "Nossa história...",
  "imageUrl": "https://...",
  "qrCodeUrl": "https://..."
}
Response: { id, coupleName, listTitle, whatsapp, pixKey, weddingDate, ... }
```

### 🎁 Presentes

#### 📖 Get All Gifts
```
GET /api/gifts
Response: [{ id, name, description, price, status, ... }, ...]
```

#### 🔍 Get Gift
```
GET /api/gifts/{id}
Response: { id, name, description, price, status, ... }
```

#### ➕ Create Gift
```
POST /api/gifts
Headers: Authorization: Bearer {token}
Body: {
  "name": "Jogo de cozinha",
  "description": "Descrição do presente",
  "category": "Cozinha",
  "price": 150.00,
  "priority": 1,
  "imageUrl": "https://...",
  "url": "https://..."
}
Response: { id, name, ... }
```

#### 📝 Update Gift
```
PUT /api/gifts/{id}
Headers: Authorization: Bearer {token}
Body: { name, description, category, price, status, ... }
Response: { id, name, ... }
```

#### 🗑️ Delete Gift
```
DELETE /api/gifts/{id}
Headers: Authorization: Bearer {token}
Response: { message: "Gift deleted" }
```

#### 🎫 Reserve Gift
```
POST /api/gifts/{id}/reserve
Body: { "name": "Nome de quem vai presentear" }
Response: { id, name, status: "reserved", reservedBy, ... }
```

#### ✅ Mark Gift as Selected/Purchased
```
POST /api/gifts/{id}/select
Response: { id, name, status: "purchased", isSelected: true, ... }
```

## ✅ Health Check

```
GET /api/health
Response: { status: "ok" }
```

## 🗄️ Banco de Dados

- **Tipo**: SQLite
- **Arquivo**: `gifts_registry.db` (criado automaticamente)
- **Localização**: `/backend/gifts_registry.db`

### Tabelas
- **couples** - Informações dos casais/admins
- **gifts** - Lista de presentes

## 🔧 Variáveis de Ambiente

```
FLASK_ENV=development              # Ambiente: development, production, testing
FLASK_DEBUG=True                  # Debug mode
SECRET_KEY=...                    # Chave secreta para sessões
JWT_SECRET_KEY=...                # Chave secreta para JWT tokens
DATABASE_URL=sqlite:///gifts_registry.db  # URL do banco de dados
CORS_ORIGINS=http://localhost:5173,http://localhost:8080  # Origens permitidas
```

## 📦 Dependências

- **Flask** - Framework web
- **Flask-SQLAlchemy** - ORM para banco de dados
- **Flask-JWT-Extended** - Autenticação com JWT
- **Flask-CORS** - Suporte CORS
- **Werkzeug** - Utilitários WSGI
- **python-dotenv** - Carregamento de variáveis de ambiente

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'flask'"
```bash
pip install -r requirements.txt
```

### Banco de dados corrompido
```bash
rm gifts_registry.db
python seed.py
```

### Erro de CORS
Verifique se a origem do frontend está em `CORS_ORIGINS` no `.env`
