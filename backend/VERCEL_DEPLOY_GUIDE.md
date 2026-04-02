# Guia de Deploy no Vercel - Backend Django

## Arquitetura

- **Backend**: Django 4.2 + DRF 3.14 → Vercel Serverless
- **Database**: PostgreSQL (Render.com) 
- **Frontend**: React + Vite → Vercel (em diretório separado)

## Preparação Vercel

### 1. Criar Projeto Separado para Backend

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Clique em "Add New..." → "Project"
3. Selecione o repositório GitHub `cha-de-panela`
4. **IMPORTANTE**: 
   - "Root Directory": `backend/`
   -Framework Preset: "Other"
   - Override "Build Command": deixe em branco (usará vercel.json)
   - Override "Output Directory": deixe em branco

### 2. Configurar Environment Variables

No Vercel, vá a Settings → Environment Variables e adicione:

```
DB_NAME=chapanela
DB_USER=chapanela_user
DB_PASSWORD=0IYYYDFVS4CKmd8sL0VZCU7Fi9xeDRJC
DB_HOST=dpg-d770ol9aae7s73dilprg-a.oregon-postgres.render.com
DB_PORT=5432

SECRET_KEY=<gere-uma-chave-aleatária-forte>
JWT_SECRET_KEY=<gere-outra-chave-aleatória-forte>

DEBUG=False
ALLOWED_HOSTS=cha-de-panela-api.vercel.app,.vercel.app
CORS_ORIGINS=https://cha-de-panela-web.vercel.app,http://localhost:3000

PYTHON_VERSION=3.11
```

**OPCIONAL**: Para usar DATABASE_URL do Render (conexão interna privada):
```
DATABASE_URL=postgresql://chapanela_user:0IYYYDFVS4CKmd8sL0VZCU7Fi9xeDRJC@dpg-d770ol9aae7s73dilprg-a/chapanela
```

### 3. Gerar Secret Keys Fortes

```bash
# No terminal local:
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(50))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(50))"
```

Copie os valores para Vercel Environment Variables.

## Arquivo vercel.json

```json
{
  "buildCommand": "pip install -r requirements.txt && python manage.py migrate --noinput || true",
  "devCommand": "python manage.py runserver",
  "env": {
    "PYTHONUNBUFFERED": "1"
  },
  "builds": [
    {
      "src": "core/wsgi.py",
      "use": "@vercel/python@3.8.16",
      "config": {
        "maxLambdaSize": "50mb",
        "runtime": "python3.11"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "core/wsgi.py"
    }
  ]
}
```

### O que acontece no build:

1. **pip install** - Instala dependências de requirements.txt
2. **migrate --noinput** - Roda migrações no banco PostgreSQL (silencioso)
3**|| true** - Ignora erros de migração já aplicadas (importante!)
4. Vercel cria a função serverless com core/wsgi.py

## Deploy Pipeline

1. **Commit & Push** para main no GitHub
   ```bash
   git add .
   git commit -m "your message"
   git push origin main
   ```

2. **Vercel detecta** alterações automaticamente
3. **Build rodado**:
   - pip install requirements.txt
   - python manage.py migrate --noinput
   - Empacota Django para serverless
4. **Deploy para production** quando passar

## Testando o Deploy

### CURL
```bash
# Health check
curl https://cha-de-panela-api.vercel.app/api/

# Register
curl -X POST https://cha-de-panela-api.vercel.app/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email":"teste@example.com",
    "password":"senha123",
    "couple_name":"Casal Teste"
  }'

# Expected: 201 Created com JWT token
```

### Frontend
Certifique-se que frontend tem:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
// Em produção: https://cha-de-panela-api.vercel.app/api
```

## Estrutura de Diretórios

```
cha-de-panela/
├── backend/
│   ├── vercel.json          ← Configuração Vercel
│   ├── requirements.txt      ← PIP packages
│   ├── manage.py
│   ├── core/
│   │   ├── settings.py       ← (lê env vars)
│   │   ├── wsgi.py           ← (simples, sem auto-migrate)
│   │   ├── urls.py
│   │   └── asgi.py
│   ├── gifts/
│   └── ...
├── frontend/
│   ├── vercel.json          ← Configuração Vercel frontend
│   ├── package.json
│   ├── src/
│   └── ...
└── .gitignore
```

## Environment Variables - Referência Completa

### Banco de Dados (PostgreSQL)
| Variável | Valor | Obrigatório |
|----------|-------|------------|
| `DB_NAME` | `chapanela` | ✅ Sim |
| `DB_USER` | `chapanela_user` | ✅ Sim |
| `DB_PASSWORD` | Senha Render DB | ✅ Sim |
| `DB_HOST` | Host Render | ✅ Sim |
| `DB_PORT` | `5432` | ✅ Sim |

### Ou Use URL (Alternativa)
| Variável | Valor | Obrigatório |
|----------|-------|------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | ⚠️ Opcional |

### Django Security
| Variável | Valor | Obrigatório |
|----------|-------|------------|
| `SECRET_KEY` | Chave aleatória | ✅ Sim |
| `JWT_SECRET_KEY` | Chave aleatória para JWT | ✅ Sim |
| `DEBUG` | `False` | ✅ Sim |

### Hosts & CORS
| Variável | Valor | Obrigatório |
|----------|-------|------------|
| `ALLOWED_HOSTS` | `cha-de-panela-api.vercel.app,.vercel.app` | ✅ Sim |
| `CORS_ORIGINS` | `https://cha-de-panela-web.vercel.app` | ✅ Sim |

## Troubleshooting

### Erro: "duplicate key value violates unique constraint"
- **Causa**: Migrations rodadas múltiplas vezes
- **Solução**: `|| true` no vercel.json ignora erros
- **Manual**: Deletar banco e recriar (perdendo dados)

### Erro: "Unable to connect to database"
- **Verificar**:
  - URL database está correta?
  - Credentials (user/password) estão corretos?
  - Host Render está acessível?
  - Environment variables estão setadas no Vercel?

### Erro: "/api/ returns 404"
- **Verificar**:
  - Routes em `core/urls.py` configuram `/api/`?
  - Frontend usa `VITE_API_URL` correto?
  - CORS está habilitado?

### Erro: "Function code size exceeded maximum"
- **Solução**: Aumentar `maxLambdaSize` de 15mb → 50mb (já feito)

## Rollback

Se deploy quebrou:

1. No Vercel Dashboard, clique em "Deployments"
2. Encontre o deployment anterior que funcionava
3. Clique nos 3 pontos → "Restore"
4. Escolha versão anterior

## Próximos Passos

1. ✅ Configurar Backend no Vercel
2. ⏳ Configurar Frontend no Vercel (separadamente)
3. ⏳ Apontar domínios customizados (se tiver)
4. ⏳ Configurar CI/CD pipeline
5. ⏳ Monitorar logs em produção

## Referências

- [Vercel + Django](https://vercel.com/docs/frameworks/django)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [PostgreSQL on Render](https://render.com/docs/postgresql)
- [Django on Serverless](https://docs.djangoproject.com/en/4.2/howto/deployment/)
