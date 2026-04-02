# 🚀 Deploy na Vercel

Guia completo para fazer deploy do backend Flask na Vercel.

## ✅ Pré-requisitos

- Repositório no GitHub: https://github.com/reginaldo-builds/happy-couple-registry-backend
- Conta na Vercel: https://vercel.com
- GitHub conectado na Vercel

## 📝 Passo 1: Conectar no Vercel

### Opção 1: Via Dashboard Vercel (Recomendado)

1. Acesse https://vercel.com/dashboard
2. Clique em **"New Project"** (Novo Projeto)
3. Clique em **"Import Git Repository"**
4. Cole a URL: `https://github.com/reginaldo-builds/happy-couple-registry-backend`
5. Autorize o Vercel a acessar seus repositórios GitHub
6. Selecione o repositório

### Opção 2: Conectar Existente

1. Se já tem um projeto no Vercel, vá para **Settings** → **Git**
2. Clique em **Connect Git Repository**
3. Selecione `happy-couple-registry-backend`

## 🔧 Passo 2: Configurar Variáveis de Ambiente

1. No Dashboard do Vercel, acesse seu projeto
2. Vá para **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `SECRET_KEY` | `seu-valor-secreto-aqui` | Chave secreta para Flask |
| `JWT_SECRET_KEY` | `seu-jwt-secret-aqui` | Chave secreta para JWT |
| `FLASK_ENV` | `production` | Ambiente de produção |
| `DATABASE_URL` | `sqlite:///gifts_registry.db` | URL do banco (SQLite) |
| `CORS_ORIGINS` | `https://seu-frontend.vercel.app,https://seu-dominio.com` | Origens permitidas |

**⚠️ Importante:** Gere valores seguros para `SECRET_KEY` e `JWT_SECRET_KEY`. Exemplo:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 📤 Passo 3: Deploy

### Deployment Automático

- Qualquer push para `main` branch será automaticamente deployado
- Você receberá emails de status do deploy

### Deployment Manual

1. Clique em **Deploy** no Dashboard do Vercel
2. Ou via CLI Vercel:

```bash
npm install -g vercel
vercel
```

## 🔍 Passo 4: Verificar URL de Produção

Após o deploy bem-sucedido:

1. Vá para **Deployments** no Dashboard Vercel
2. Copie a URL de produção, por exemplo: `https://happy-couple-registry-backend.vercel.app`
3. Teste um endpoint:

```bash
curl https://happy-couple-registry-backend.vercel.app/api/health
```

Resposta esperada:
```json
{"status": "ok"}
```

## 🔗 Passo 5: Atualizar Frontend

No frontend (React), atualize a URL da API:

### Arquivo: `src/services/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  'https://seu-dominio-vercel.vercel.app/api';
```

### Arquivo: `.env` (Frontend)

```env
VITE_API_URL=https://happy-couple-registry-backend.vercel.app/api
```

## 📊 Testando Endpoints em Produção

```bash
# Health check
curl https://seu-backend.vercel.app/api/health

# Login
curl -X POST https://seu-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"casal@email.com","password":"senha123"}'

# Listar presentes
curl https://seu-backend.vercel.app/api/gifts
```

## ⚡ Performance e Limites

### Limites Vercel

- **Timeout**: 60 segundos por função serverless
- **Memória**: 1GB por função
- **Armazenamento**: Temporário (SQLite será limpo entre deploys)

### Nota sobre Banco de Dados

⚠️ **Importante**: SQLite em Vercel é temporário!

Para produção, recomenda-se:
- Usar um banco de dados externo (PostgreSQL, MongoDB, etc.)
- Integrar com Vercel KV (Redis)
- Usar Supabase PostgreSQL

#### Opção 1: Migrar para PostgreSQL com Supabase

1. Crie conta em https://supabase.com
2. Crie um novo projeto
3. Copie a string de conexão PostgreSQL
4. Atualize no Vercel:
   - Variável: `DATABASE_URL`
   - Valor: `postgresql://...`
5. Atualize `config.py`:

```python
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///gifts_registry.db')
```

#### Opção 2: Usar Vercel KV para Cache

1. No Dashboard Vercel, vá para **Storage** → **KV**
2. Crie um novo KV store
3. Use na aplicação para cache temporário

## 🐛 Troubleshooting

### Erro 500 em Produção

1. Verifique os logs no Vercel:
   - Dashboard → Deployments → Clique no deployment → View Function Logs

2. Verifique variáveis de ambiente

3. Teste localmente: `npm run dev`

### CORS Error

- Atualize `CORS_ORIGINS` no Vercel para incluir sua URL de frontend
- Acesse: Settings → Environment Variables

### Database Connection Error

- Se usar SQLite: Será recriado a cada deploy
- Se usar PostgreSQL: Verifique `DATABASE_URL`

### Função serverless timeout

- Otimize queries de banco de dados
- Use cache quando possível
- Aumente timeout no `vercel.json` (máximo: 60s em plano gratuito)

## 📱 Integração com Frontend

### `.env` do Frontend

```env
VITE_API_URL=https://happy-couple-registry-backend.vercel.app/api
```

### `src/services/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

## 🔐 Segurança em Produção

1. ✅ Senhas seguras para `SECRET_KEY` e `JWT_SECRET_KEY`
2. ✅ CORS configurado apenas para domínios confiáveis
3. ✅ JWT tokens com expiração
4. ✅ HTTPS automático (Vercel fornece SSL)
5. ✅ Rate limiting (considere adicionar)
6. ✅ Input validation (já implementado)

## 📈 Monitoramento

Vercel fornece ferramentas de monitoramento:

1. **Deployments**: Histórico de deploys e status
2. **Function Logs**: Logs em tempo real das funções
3. **Analytics**: Dados de uso e performance
4. **Alerts**: Notificações de erros

Acesse via Dashboard → Analytics

## ✅ Checklist Final

- [ ] Repositório GitHub configurado
- [ ] Vercel conectado ao GitHub
- [ ] Variáveis de ambiente definidas
- [ ] Deploy bem-sucedido
- [ ] Health check funcionando
- [ ] Endpoints testados
- [ ] Frontend atualizado com URL da API
- [ ] CORS configurado corretamente
- [ ] Credenciais padrão alteradas em produção
- [ ] Logs verificados

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: Dashboard → Deployments → Function Logs
2. Teste localmente: `python app.py`
3. Abra uma issue no GitHub

---

**Deploy bem-sucedido! 🎉**
