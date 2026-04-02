# Deploy no Vercel - Guia Completo

Este guia explica como fazer o deploy da aplicação "Chá de Panela" no Vercel.

## Estrutura do Projeto

O projeto está dividido em:
- **Backend**: Django API (pasta `backend/`)
- **Frontend**: React/Vite (pasta `frontend/`)

## Pré-requisitos

1. **Conta Vercel**: Crie em [vercel.com](https://vercel.com)
2. **Git Repository**: Código enviado para GitHub
3. **Variáveis de Ambiente**: Configurar em ambos os ambientes

## Deploy Backend (Django API)

### Opção 1: Deploy Separado (Recomendado)

#### 1. Criar novo projeto no Vercel
```bash
nvm use 18
npm i -g vercel
vercel login
cd backend
vercel
```

#### 2. Configurar Variáveis de Ambiente
No dashboard Vercel → Settings → Environment Variables:

```
ALLOWED_HOSTS=seu-backend-dominio.vercel.app
DEBUG=False
SECRET_KEY=sua-chave-secreta-longa-e-complexa
CORS_ALLOWED_ORIGINS=https://seu-frontend-dominio.vercel.app
DATABASE_URL=postgresql://user:pass@host/db  # Se usar banco externo
```

#### 3. Arquivo vercel.json (Backend)
```json
{
  "builds": [
    {
      "src": "core/wsgi.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "15mb",
        "runtime": "python3.11"
      }
    }
  ],
  "env": {
    "PYTHONUNBUFFERED": "1"
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "core/wsgi.py"
    }
  ]
}
```

### Opção 2: Deploy Monorepo

Coloque ambos os projetos na raiz com:

```json
{
  "projects": {
    "backend": {
      "rootDirectory": "backend"
    },
    "frontend": {
      "rootDirectory": "frontend"
    }
  }
}
```

---

## Deploy Frontend (React/Vite)

### 1. Criar novo projeto no Vercel
```bash
cd frontend
vercel
```

Ou conecte seu repositório GitHub direto no dashboard.

### 2. Configurar Variáveis de Ambiente
No dashboard Vercel → Settings → Environment Variables:

```
VITE_API_URL=https://seu-backend-dominio.vercel.app/api
```

### 3. Arquivo vercel.json (Frontend)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://seu-backend-dominio.vercel.app/api"
  },
  "rewrites": [
    {
      "source": "/:path((?!assets|public).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Variáveis de Ambiente Importantes

### Backend (Django)

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `ALLOWED_HOSTS` | seu-backend.vercel.app | Hosts permitidos |
| `DEBUG` | False | Desabilitar modo debug |
| `SECRET_KEY` | chave-longa-complexa | Chave secreta Django |
| `CORS_ALLOWED_ORIGINS` | https://seu-frontend.vercel.app | CORS frontend |
| `DATABASE_URL` | postgresql://... | URL do banco externo |

### Frontend (React)

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `VITE_API_URL` | https://seu-backend.vercel.app/api | URL API backend |

---

## Configurações Importantes

### Backend Settings (core/settings.py)

```python
# Production settings
if not DEBUG:
    ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')
    CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
```

### Frontend Environment

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

---

## Passo a Passo para Deploy

### 1. Backend

```bash
cd backend
git add .
git commit -m "Preparar para Vercel"
git push

# No dashboard Vercel:
# - New Project
# - Connect GitHub
# - Selecionar repositório
# - Root Directory: backend
# - Framework: Django
# - Build Command: (deixar vazio, vai usar padrão)
# - Output Directory: (Django não usa)
# - Adicionar variáveis de ambiente
```

### 2. Frontend

```bash
cd frontend
git add .
git commit -m "Preparar para Vercel"
git push

# No dashboard Vercel:
# - New Project
# - Connect GitHub
# - Selecionar repositório
# - Root Directory: frontend
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist
# - Adicionar variáveis de ambiente (VITE_API_URL)
```

### 3. Testar Localmente

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000

# Frontend (em outro terminal)
cd frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

---

## Troubleshooting

### Erro: "ModuleNotFoundError"
```bash
# Verificar requirements.txt no backend
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements"
git push
```

### Erro: "CORS Error"
```python
# Em core/settings.py
if not DEBUG:
    CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
    print(f"CORS Origins: {CORS_ALLOWED_ORIGINS}")
```

### Erro: "Static files not found"
```bash
# Backend não serve arquivos estáticos
# Use CDN para imagens ou serve via S3/Cloudinary
```

### Erro: "Database Connection"
```bash
# Use banco externo (PostgreSQL na Vercel)
# Configure DATABASE_URL nas variáveis
```

---

## Monitoramento

### Logs
- **Backend**: Vercel Dashboard → Deployments → Logs
- **Frontend**: Vercel Dashboard → Deployments → Logs

### Performance
- Usar Vercel Analytics
- Monitorar Core Web Vitals
- Verificar bundle size

### Atualizações
```bash
# Push automático ao fazer merge em main
git push origin main
# Vercel fará deploy automaticamente
```

---

## Domínio Customizado

1. Vercel Dashboard → Settings → Domains
2. Adicionar domínio customizado
3. Configurar registros DNS:
   - A: aponta para IP Vercel
   - CNAME: aponta para *.vercel.app

---

## Segurança em Produção

- ✅ DEBUG = False
- ✅ SECRET_KEY aleatória
- ✅ HTTPS obrigatório
- ✅ CSRF tokens habilitados
- ✅ Validação de CORS
- ✅ Banco de dados externo
- ✅ Variáveis secretas não no git

---

## Referências

- [Vercel Python Runtime](https://vercel.com/docs/functions/python)
- [Vercel Frontend Deployment](https://vercel.com/docs/concepts/deployments/overview)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
