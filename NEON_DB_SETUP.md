# Configuração do Neon DB na Vercel

## 📋 Requisitos
- Projeto Django configurado com `dj-database-url` ✅ (já instalado)
- Conta no Neon DB (https://neon.tech)
- Projeto deployed na Vercel

## 🚀 Passos de Configuração

### 1️⃣ Obter Connection String do Neon DB

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Selecione seu projeto
3. Vá para **Connection details**
4. Copie a **Connection string** (formato: `postgresql://user:password@host/database?sslmode=require`)

### 2️⃣ Configurar Environment Variables na Vercel

1. Acesse seu projeto no Vercel (https://vercel.com)
2. Vá para **Settings > Environment Variables**
3. Adicione as seguintes variáveis:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_bg0jWcrhY7Vp@ep-rapid-smoke-aqiesb1y-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

> **⚠️ IMPORTANTE**: Nunca commite o `DATABASE_URL` no repositório!

4. Configure também:
   - `SECRET_KEY` - seu Django secret key
   - `JWT_SECRET_KEY` - seu JWT secret key
   - Outras variáveis necessárias

### 3️⃣ Variáveis Disponíveis do Neon DB

O Neon DB fornece várias connection strings. No seu `vercel.json` ou Vercel dashboard, você pode usar qualquer uma:

| Variável | Uso | Exemplo |
|----------|-----|---------|
| `DATABASE_URL` | **Recomendado para Vercel** com pgbouncer (pooling) | `postgresql://...@ep-...-pooler.c-8.us-east-1.aws.neon.tech/neondb?...` |
| `DATABASE_URL_UNPOOLED` | Sem pgbouncer (se for necessário) | `postgresql://...@ep-...-c-8.us-east-1.aws.neon.tech/neondb?...` |
| `POSTGRES_URL` | Compatibilidade Vercel Postgres | Igual ao `DATABASE_URL` |
| `POSTGRES_URL_NON_POOLING` | Sem pooling | Igual ao `DATABASE_URL_UNPOOLED` |

### 4️⃣ Configuração Django (Já Feita ✅)

O arquivo [core/settings.py](backend/core/settings.py) está configurado para:

1. **Priorizar `DATABASE_URL`** - Ideal para Neon DB
2. **Fallback para variáveis individuais** - Se necessário
3. **SQLite local** - Para desenvolvimento

```python
# Prioridade de configuração:
# 1. DATABASE_URL (Neon DB) ← Use isso!
# 2. DB_ENGINE + DB_NAME + DB_USER + etc
# 3. SQLite local
```

### 5️⃣ Redeploy na Vercel

Após configurar as variáveis de ambiente:

1. Vá para **Deployments** no Vercel
2. Clique em **Redeploy** na última deployment
3. Ou simplesmente faça um novo push para o repositório

### 6️⃣ Verificar Conexão

Para testar a conexão (localmente):

```bash
# Com DATABASE_URL configurado em .env
python manage.py shell
```

```python
from django.db import connection
connection.ensure_connection()
print("Conectado ao banco de dados!")
```

## 📝 Exemplo de .env.production

```bash
DEBUG=False
DB_ENGINE=postgresql

# Vercel fornecerá DATABASE_URL automaticamente via environment variables
# Nunca configure aqui, use o dashboard do Vercel!

ALLOWED_HOSTS=cha-de-panela-api.vercel.app,*.vercel.app
CORS_ORIGINS=https://cha-de-panela-web.vercel.app,https://*.vercel.app
```

## 🔒 Segurança

✅ **O que fazer:**
- Usar variáveis de ambiente no Vercel dashboard
- Usar `DATABASE_URL` completo (inclui credenciais)
- Ativar SSL/TLS (Neon usa `sslmode=require` por padrão)

❌ **O que NÃO fazer:**
- ❌ Commitar DATABASE_URL no .env
- ❌ Compartilhar connection strings
- ❌ Usar credenciais hardcoded

## 📚 Referências

- [Neon Documentation](https://neon.tech/docs)
- [dj-database-url](https://github.com/jazzband/dj-database-url)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Django Database Configuration](https://docs.djangoproject.com/en/stable/ref/settings/#databases)

## ✅ Checklist Final

- [ ] Criar projeto no Neon DB
- [ ] Obter DATABASE_URL do Neon
- [ ] Configurar `DATABASE_URL` no Vercel dashboard
- [ ] Configurar `SECRET_KEY` no Vercel
- [ ] Configurar `JWT_SECRET_KEY` no Vercel
- [ ] Fazer redeploy na Vercel
- [ ] Verificar logs da aplicação
- [ ] Testar endpoints da API

---

**Pronto! Seu Django agora está usando Neon DB na Vercel com segurança.** 🎉
