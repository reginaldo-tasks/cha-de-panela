# 🚀 Status de Deploy - Vercel

## ⚠️ Problema Identificado

**Erro:** `404 Not Found` ao acessar `https://de-panela.vercel.app/`

**Causa:** Frontend não foi deployado corretamente ou está em projeto separado

---

## ✅ Solução: Deploy Correto

### 1️⃣ Estrutura Esperada

```
cha-de-panela/
├── backend/           # Django API
│   ├── vercel.json
│   └── .env
├── frontend/          # React SPA
│   ├── vercel.json
│   └── .env
└── vercel.json        # Config monorepo (opcional)
```

### 2️⃣ Deploy Frontend (Prioritário)

```bash
cd frontend
vercel --prod
```

**Configurar no dashboard Vercel:**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment: `VITE_API_URL=https://seu-backend.vercel.app/api`

### 3️⃣ Deploy Backend

```bash
cd backend
vercel --prod
```

**Configurar no dashboard Vercel:**
- Root Directory: `backend`
- Build Command: (deixar vazio)
- Environment: 
  - `ALLOWED_HOSTS=seu-backend.vercel.app`
  - `DEBUG=False`
  - `SECRET_KEY=...` (gerar com `python generate_secrets.py`)
  - `JWT_SECRET_KEY=...` (gerar com `python generate_secrets.py`)
  - `CORS_ALLOWED_ORIGINS=https://seu-frontend.vercel.app`

---

## 🔐 Gerar Secret Keys

### Opção A: Script Python (Recomendado)

```bash
cd /home/tasks/projetos/cha-de-panela
python generate_secrets.py
```

### Opção B: Script Bash

```bash
cd /home/tasks/projetos/cha-de-panela
bash generate_secrets.sh
```

### Opção C: Manual

```bash
# Terminal 1
python -c "from django.core.management.utils import get_random_secret_key; print('SECRET_KEY=' + get_random_secret_key())"

# Terminal 2
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(50))"
```

---

## 🔗 Conectar Frontend + Backend

Após ambos os deploys:

1. **Copiar URL do Backend:**
   - Exemplo: `https://seu-backend-1234.vercel.app`

2. **Adicionar ao Frontend (Environment):**
   ```
   VITE_API_URL=https://seu-backend-1234.vercel.app/api
   ```

3. **Adicionar ao Backend (Environment):**
   ```
   CORS_ALLOWED_ORIGINS=https://seu-frontend-5678.vercel.app
   ALLOWED_HOSTS=seu-backend-1234.vercel.app
   ```

4. **Redeploy ambos:**
   ```bash
   git push
   ```

---

## ✅ Checklist

- [ ] Secret keys geradas
- [ ] Backend deployado
- [ ] Frontend deployado
- [ ] CORS configurado
- [ ] Variáveis de ambiente corretas
- [ ] Frontend acessa corretamente a API do Backend
- [ ] Funcionalidades testadas

---

## 📋 Arquivos de Ajuda

| Arquivo | Descrição |
|---------|-----------|
| `GENERATE_SECRETS.md` | Guia detalhado para gerar chaves |
| `generate_secrets.py` | Script Python automático |
| `generate_secrets.sh` | Script Bash automático |
| `README_VERCEL.md` | Guia completo de deploy |
| `DEPLOY_GUICK_START.md` | Guia rápido resumido |

---

## 🆘 Troubleshooting

### Frontend retorna 404
```json
// vercel.json (frontend)
{
  "rewrites": [
    {
      "source": "/:path((?!assets|public).*)",
      "destination": "/index.html"
    }
  ]
}
```

### Backend não conecta
```python
# core/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://seu-frontend.vercel.app"
]
```

### Chaves não carregam
```bash
# Verificar variáveis
vercel env pull

# Redeploy
vercel --prod --force
```

---

## 📞 Próximos Passos

1. Execute `python generate_secrets.py`
2. Copie as chaves geradas
3. Adicione ao Vercel Dashboard
4. Faça push para GitHub
5. Vercel fará redeploy automático

**Time estimate:** 10 minutos

