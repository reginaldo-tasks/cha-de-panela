# 🔐 Como Gerar Secret Keys para Produção

## Opção 1: Python (Recomendado para Django)

### Gerar SECRET_KEY do Django

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Saída esperada:**
```
f@#$%^&*()_+1234567890abcdefghijklmnopqrstuvwxyz
```

### Gerar JWT_SECRET_KEY

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

**Saída esperada:**
```
aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890-_aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

---

## Opção 2: Node.js/npm

```bash
# SECRET_KEY (Django)
node -e "console.log(require('crypto').randomBytes(50).toString('hex'))"

# JWT_SECRET_KEY
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## Opção 3: OpenSSL

```bash
# SECRET_KEY (50 caracteres aleatórios)
openssl rand -hex 50

# JWT_SECRET_KEY (64 bytes em base64)
openssl rand -base64 64
```

---

## Opção 4: Online (Último recurso)

- [random.org](https://www.random.org/strings/)
- [uuid.online](https://www.uuidonline.com/)

⚠️ **Não recomendado para chaves críticas**

---

## Passo a Passo Completo

### 1. Gerar as Chaves

```bash
# Terminal 1: Gerar SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print('SECRET_KEY=' + get_random_secret_key())"

# Terminal 2: Gerar JWT_SECRET_KEY
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(50))"
```

### 2. Copiar Saída

```
SECRET_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz5
JWT_SECRET_KEY=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890-_aBcDeFgHiJkLm
```

### 3. Adicionar ao `.env` (Produção)

```bash
# backend/.env.production
DEBUG=False
SECRET_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz5
JWT_SECRET_KEY=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890-_aBcDeFgHiJkLm
ALLOWED_HOSTS=seu-backend.vercel.app
CORS_ALLOWED_ORIGINS=https://seu-frontend.vercel.app
```

### 4. Adicionar ao Vercel (Recomendado)

```bash
# Via CLI
vercel env add SECRET_KEY
# Cole a chave quando pedido

vercel env add JWT_SECRET_KEY
# Cole a chave quando pedido

# Ou via Dashboard:
# Settings → Environment Variables → Add
```

---

## Verificação

Testar se as chaves funcionam:

```bash
cd backend
source venv/bin/activate
python manage.py shell

# Dentro do shell Python
from django.conf import settings
print(settings.SECRET_KEY)
print(settings.JWT_SECRET_KEY)
```

---

## Boas Práticas

✅ **DO:**
- Use chaves diferentes para dev, staging e produção
- Armazene em variáveis de ambiente
- Use pelo menos 50 caracteres
- Gere com funções criptográficas robustas
- Nunca commit no Git

❌ **DON'T:**
- Use chaves hardcoded no código
- Compartilhe as chaves
- Use padrões simples (111111, ABC123, etc)
- Use a mesma chave em múltiplos ambientes
- Salve em arquivos versionados

---

## Script Automático (bash)

Crie arquivo `generate_keys.sh`:

```bash
#!/bin/bash

echo "=== Gerando Secret Keys ==="
echo ""

echo "SECRET_KEY:"
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
echo ""

echo "JWT_SECRET_KEY:"
python -c "import secrets; print(secrets.token_urlsafe(50))"
echo ""

echo "=== Copie as chaves acima e adicione ao .env ==="
```

Execute:
```bash
chmod +x generate_keys.sh
./generate_keys.sh
```

---

## Trocar Chaves em Produção

Se as chaves foram comprometidas:

```bash
# 1. Gerar novas chaves
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# 2. Atualizar .env.production
vi backend/.env.production

# 3. Redeploy no Vercel
git add backend/.env.production
git commit -m "Update secret keys"
git push

# Vercel fará redeploy automaticamente
```

---

## Testes Locais

Testar que as chaves funcionam localmente:

```bash
# Criar .env temporário
cp backend/.env.example backend/.env

# Adicionar as chaves
echo "SECRET_KEY=sua-chave-longa-aqui" >> backend/.env
echo "JWT_SECRET_KEY=sua-jwt-chave-aqui" >> backend/.env

# Testar Django
python manage.py check
python manage.py runserver

# Testar signup (estará usando as novas chaves)
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","couple_name":"Test"}'
```

---

## Variáveis Relacionadas (Optional)

| Variável | Propósito | Padrão |
|----------|-----------|--------|
| `ALGORITHM` | Algoritmo JWT | HS256 |
| `TOKEN_LIFETIME` | Duração token | 30 dias |
| `REFRESH_TOKEN_LIFETIME` | Refresh token | 90 dias |

---

## Referências

- [Django Secret Key Generator](https://docs.djangoproject.com/en/4.2/topics/signing/)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [Python secrets module](https://docs.python.org/3/library/secrets.html)
