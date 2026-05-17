# 🚨 URGENT: Corrigir Banco de Dados em Produção

## Problema Identificado

Seu backend está recebendo **500 Internal Server Error** porque:

❌ **SQLite não funciona em Vercel** (serverless filesystem)  
❌ **PostgreSQL (Render) conexão falhando** - SSL issue  
❌ **DATABASE_URL não configurado** na Vercel

## ✅ Solução Rápida (5 minutos)

### Passo 1: Verificar Credenciais do Render PostgreSQL

No Render Dashboard:
1. Acesse seu projeto PostgreSQL
2. Copie a **Internal Database URL** (não External)
3. Exemplo: `postgresql://user:password@dpg-xxx-a.oregon-postgres.render.com:5432/dbname`

⚠️ **Importante**: Use `render.internal` se disponível (mais rápido):
```
postgresql://user:password@dpg-xxx-a.internal:5432/dbname
```

### Passo 2: Configurar no Vercel

1. Vá para: **Vercel Dashboard → Seu Projeto → Settings → Environment Variables**

2. **Remova qualquer `DEBUG` antigo** se existir

3. **Adicione ou atualize**:

```env
DEBUG=False

DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DBNAME]?sslmode=require
```

**Substitua**:
- `[USER]` - usuário PostgreSQL (ex: `postgres`)
- `[PASSWORD]` - senha do banco
- `[HOST]` - host do Render (use `.internal` se possível)
- `[DBNAME]` - nome do banco (padrão: nome do projeto)

### Passo 3: Verificar Outras Variáveis

Certifique-se que está **Production** environment:

✅ `SECRET_KEY` - presente
✅ `JWT_ALGORITHM` - está como `HS256` (não vazio!)
✅ `ALLOWED_HOSTS` - contém seu domínio Vercel
✅ `CORS_ORIGINS` - contém `https://cha-de-panela-web.vercel.app`

### Passo 4: Deploy

```bash
# Forçar redeploy com novas variáveis
git push origin main

# Ou manualmente na Vercel Dashboard:
# Deployments → Redeploy
```

### Passo 5: Testar

```bash
# Verificar se banco funciona
curl https://cha-de-panela-api.vercel.app/api/gifts/

# Deve retornar JSON, não 500
```

## 🔍 Troubleshooting

### Se ainda receber `sqlite3.OperationalError`
```
→ DATABASE_URL não foi detectado
→ Verifique: `DEBUG` ainda é True?
→ Solução: Defina `DEBUG=False` explicitamente
```

### Se receber `SSL connection closed unexpectedly`
```
→ Host do Render está rejeitando SSL
→ Tente: postgresql://...@host**:5432**/... (com porta explícita)
→ Ou: Use .internal se disponível
→ Ou: Adicione `?sslmode=require` ao final
```

### Se receber `connection refused`
```
→ Host/Porta incorretos
→ Solução: Copiar novamente da Render Dashboard
→ Verifique: Render está na mesma região? (oregão = oregon)
```

## 📋 Exemplo Final (Production)

```env
DEBUG=False
SECRET_KEY=sua-chave-secret-aqui
JWT_ALGORITHM=HS256
JWT_SECRET_KEY=sua-chave-jwt-aqui
ALLOWED_HOSTS=cha-de-panela-api.vercel.app,*.vercel.app,localhost
CORS_ORIGINS=https://cha-de-panela-web.vercel.app
DATABASE_URL=postgresql://postgres:password@dpg-abc123-a.internal:5432/cha_de_panela?sslmode=require
```

## ✨ Confirmação

Após fazer isso, você deve ver:

✅ `POST /api/auth/register/` → 201 Created (não 401)  
✅ `GET /api/gifts/` → 200 OK com JSON (não 500)  
✅ Logs da Vercel → sem `sqlite3` ou SSL errors  

---

**Precisa de ajuda?** Compartilhe o erro exato de novo após fazer essas mudanças!
