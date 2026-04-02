# 🚀 Setup Completo - Frontend + Backend

## ✅ Estado Atual

### Backend (Python + Flask)
- **Porta**: `5000`
- **Banco de dados**: SQLite (`gifts_registry.db`)
- **Autenticação**: JWT
- **URL**: `http://localhost:5000/api`

### Frontend (React + Vite)
- **Porta**: `8080`
- **Apontando para**: `http://localhost:5000/api`
- **Configuração**: `.env` com `VITE_API_URL=http://localhost:5000/api`

---

## 🚀 Como Iniciar Tudo

### Terminal 1: Backend (Flask)
```bash
cd /home/builds/happy-couple-registry/backend
source venv/bin/activate
python3.12 app.py
```

Resposta esperada:
```
 * Serving Flask app 'app'
 * Running on http://0.0.0.0:5000
```

### Terminal 2: Frontend (React)
```bash
cd /home/builds/happy-couple-registry
npm run dev
```

Resposta esperada:
```
VITE v5.4.19  ready in 234 ms

➜  Local:   http://localhost:8080/
```

---

## 🔐 Credenciais de Teste

- **Email**: `casal@email.com`
- **Senha**: `senha123`

---

## 🧪 Testar Conexão

### 1. Verificar se Backend está rodando
```bash
curl http://localhost:5000/api/health
```

Resposta esperada:
```json
{"status": "ok"}
```

### 2. Testar Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "casal@email.com", "password": "senha123"}'
```

Resposta esperada:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "couple": {
    "id": "...",
    "email": "casal@email.com",
    "coupleName": "Iara & Ramon",
    ...
  }
}
```

### 3. Acessar Frontend
Abra o navegador em: `http://localhost:8080`

---

## 📝 Configuração de Variáveis de Ambiente

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (`.env`)
```
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-here-change-in-production
DATABASE_URL=sqlite:///gifts_registry.db
CORS_ORIGINS=http://localhost:8080,http://localhost:5173,http://localhost:3000
```

---

## 🔧 Troubleshooting

### Erro: "Failed to load resource: net::ERR_CONNECTION_REFUSED"
**Solução**: Certifique-se de que:
1. ✅ Backend está rodando em `http://localhost:5000`
2. ✅ Variável `VITE_API_URL` está configurada corretamente
3. ✅ Arquivo `.env` existe na raiz do projeto

### Erro: "CORS error"
**Solução**: Adicione a origem do frontend em `backend/.env`:
```
CORS_ORIGINS=http://localhost:8080,http://localhost:5173
```
E reinicie o backend.

### Erro: "401 Unauthorized"
**Solução**: 
1. Verifique se o token está sendo enviado corretamente
2. Tente fazer login novamente com as credenciais corretas
3. Verifique se o token não expirou

### Banco de dados não encontrado
**Solução**: Execute o script de seed
```bash
cd backend
source venv/bin/activate
python3.12 seed.py
```

---

## 📊 Fluxo de Requisições

```
Frontend (React)
     ↓
   [.env] VITE_API_URL=http://localhost:5000/api
     ↓
[src/services/api.ts] fetchWithAuth()
     ↓
http://localhost:5000/api/* (Backend Flask)
     ↓
SQLite Database (gifts_registry.db)
```

---

## 🎯 Próximos Passos

1. ✅ Backend está configurado em `localhost:5000`
2. ✅ Frontend está configurado em `localhost:8080`
3. ✅ Frontend aponta para backend em `.env`
4. 📝 Teste o login com `casal@email.com / senha123`
5. 🎁 Comece a adicionar presentes!

---

## 📚 Mais Informações

- Backend: `backend/README.md`
- Backend Setup: `backend/SETUP_GUIDE.md`
- API Docs: `BACKEND_API_DOCS.md`
