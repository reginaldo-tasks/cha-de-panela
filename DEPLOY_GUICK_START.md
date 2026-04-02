# 🚀 Quick Deploy Guide - Chá de Panela

## Estrutura do Projeto

```
cha-de-panela/
├── backend/          # Django API
├── frontend/         # React/Vite SPA
├── vercel.json       # Monorepo config (opcional)
└── README_VERCEL.md  # Guia completo de deploy
```

## Deploy Rápido no Vercel

### 1️⃣ Backend (Django API)

```bash
# Opção A: Deploy Separado
cd backend
vercel

# Opção B: Monorepo (recomendado)
vercel --name seu-projeto-api --root backend
```

**Variáveis de Ambiente:**
- `ALLOWED_HOSTS`: seu-backend.vercel.app
- `DEBUG`: False
- `SECRET_KEY`: Gerar aleatória
- `CORS_ALLOWED_ORIGINS`: https://seu-frontend.vercel.app

### 2️⃣ Frontend (React/Vite)

```bash
cd frontend
vercel --name seu-projeto-web

# Ou conectar GitHub direto no dashboard Vercel
```

**Variáveis de Ambiente:**
- `VITE_API_URL`: https://seu-backend.vercel.app/api

### 3️⃣ Conectar Frontend + Backend

Após deploy, atualizar no dashboard Vercel:

```
Frontend Environment Variables:
VITE_API_URL=https://seu-backend.vercel.app/api

Backend Environment Variables:
CORS_ALLOWED_ORIGINS=https://seu-frontend.vercel.app
```

---

## Checklist de Deploy

- [ ] Git repository criado e sincronizado
- [ ] Conta Vercel criada
- [ ] Variáveis de ambiente configuradas
- [ ] Backend deployado
- [ ] Frontend deployado
- [ ] CORS configurado
- [ ] Testes realizados

---

## Arquivos Importantes

| Arquivo | Função |
|---------|--------|
| `backend/vercel.json` | Config deploy backend |
| `frontend/vercel.json` | Config deploy frontend |
| `README_VERCEL.md` | Guia completo |
| `backend/.env.example` | Template env backend |
| `frontend/.env.example` | Template env frontend |

---

## Troubleshooting Rápido

### CORS Error
```json
// Em backend/core/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://seu-frontend.vercel.app"
]
```

### API não encontrada
```bash
# Frontend (.env)
VITE_API_URL=https://seu-backend.vercel.app/api
```

### Banco de dados
```bash
# Usar PostgreSQL externo em produção
# Configure DATABASE_URL nas env vars
```

---

## Links Úteis

- 📖 [Guia Completo](./README_VERCEL.md)
- 🔗 [Vercel Dashboard](https://vercel.com/dashboard)
- 🐙 [GitHub Integration](https://vercel.com/github)
- 📚 [Django Deployment](https://docs.djangoproject.com/en/4.2/howto/deployment/)

---

**💡 Dica:** Use o GitHub Actions para CI/CD automático!
