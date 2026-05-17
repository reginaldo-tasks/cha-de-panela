# 🚨 AÇÃO URGENTE: Configurar Banco de Dados no Vercel

**STATUS**: ✅ Código atualizado e enviado  
**PRÓXIMO PASSO**: Configurar variáveis de ambiente no Vercel

## O Problema (Confirmado nos Logs)

Seu backend está falhando com:
- ❌ **`sqlite3.OperationalError: unable to open database file`** - Django usando SQLite (não funciona em Vercel)
- ❌ **SSL connection errors** - Quando tenta PostgreSQL, conexão fechada inesperadamente

**Causa-raiz**: `DATABASE_URL` não está configurado no Vercel

---

## ⚡ Ação Necessária (10 minutos)

### PASSO 1: Ir para o Vercel

1. Acesse: **https://vercel.com/dashboard**
2. Selecione projeto: **cha-de-panela-api**
3. Click em **Settings** (topo da página)
4. Click em **Environment Variables**

### PASSO 2: Limpar Variáveis Antigas

**DELETE estas variáveis** se existirem:
- `SUPABASE_*` (todos começados com SUPABASE)
- `S3_ENDPOINT`, `S3_BUCKET`, `SUPABASE_*`
- `DATABASE_URL` antigo (se houver)

### PASSO 3: Adicionar Variáveis OBRIGATÓRIAS (CRITICAL!)

**Selecione `production` no menu** antes de adicionar!

Adicione estas variáveis uma por uma:

| Variável | Valor |
|----------|-------|
| `DEBUG` | `False` |
| `DATABASE_URL` | `postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DBNAME]?sslmode=require` |
| `SECRET_KEY` | Seu valor único (não altere se já existe) |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_SECRET_KEY` | Seu valor único |
| `ALLOWED_HOSTS` | `cha-de-panela-api.vercel.app,.vercel.app,localhost` |
| `CORS_ORIGINS` | `https://cha-de-panela-web.vercel.app` |

### PASSO 4: Encontrar Credenciais Corretas

#### Para DATABASE_URL (PostgreSQL Render)

1. Vá para: https://render.com/dashboard
2. Clique no seu banco PostgreSQL
3. Vá para **Info** ou **Connections**
4. Copie a URL que começa com `postgresql://`
5. **Certifique-se que tem `?sslmode=require` no final**

**Exemplo completo:**
```
postgresql://postgres:minhasenha123@dpg-d770ol9aae7s73dilprg-a.oregon-postgres.render.com:5432/cha_de_panela?sslmode=require
```

#### Para S3_READ_WRITE_TOKEN (Vercel Blob - OPCIONAL)

1. Vá para: https://vercel.com/dashboard/storage
2. Selecione seu **Blob** 
3. Vá para **Settings** → **Tokens**
4. Crie novo token com permissões **read/write**
5. Copie o token

### PASSO 5: Fazer Deploy

1. Acesse **Deployments** → veja a lista
2. Clique no deploy mais recente (aquele que acabou de subir)
3. Clique nos **3 pontinhos** (...) → **Redeploy**

Aguarde 2-3 minutos.

---

## ✅ Verificar se Funcionou

Abra seu navegador e teste:

```
https://cha-de-panela-api.vercel.app/api/gifts/
```

**Se funcionar**, você verá:
- ✅ JSON com lista de presentes (pode estar vazia: `{"results": []}`)
- ✅ Status `200 OK`

**Se ainda der erro**:
- ❌ `500 Internal Server Error` → DATABASE_URL ainda não correto
- ❌ `Unauthorized 401` → Problema de autenticação (normal, acesse seu login primeiro)

---

## 🔍 Se Ainda Tiver Erro

### Verificação de DEBUG

Verifi se `DEBUG=False` está salvo:
1. Volte para Settings → Environment Variables
2. Procure por `DEBUG`
3. Confirme que é `False` (não True)
4. Se foi True antes, delete e adicione como False

### Verificação de DATABASE_URL

1. Render Dashboard → seu PostgreSQL
2. Copie **EXATAMENTE** a URL
3. Adicione `?sslmode=require` no final se não tiver
4. Salve no Vercel
5. Redeploy novamente

### Se conectar mas volta erro de SSL

Tente uma dessas:
- Use `.internal` em vez de `.oregon-postgres.render.com`
- Exemplo: `postgresql://...@dpg-xxx-a.internal:5432/...?sslmode=require`

---

## 📋 Checklist Final

- [ ] `DEBUG=False` configurado
- [ ] `DATABASE_URL` com credenciais Render completas
- [ ] URL tem `?sslmode=require`
- [ ] Todas variáveis salvas em **production** environment
- [ ] Redeploy executado
- [ ] GET `/api/gifts/` retorna 200 (não 500)

---

**Precisa de ajuda?** Compartilhe:
- Screenshot do error após seguir esses passos
- URL exata de DATABASE_URL (sem senha!)
