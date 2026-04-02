# Configuração PostgreSQL (Render) no Vercel

## Credenciais do Banco de Dados (Render)

Dados da conexão PostgreSQL no Render:

```
Host: dpg-d770ol9aae7s73dilprg-a.oregon-postgres.render.com
Porta: 5432
Banco: chapanela
Usuário: chapanela_user
Senha: 0IYYYDFVS4CKmd8sL0VZCU7Fi9xeDRJC
```

## Variáveis de Ambiente no Vercel

Acesse: https://vercel.com → Projeto `cha-de-panela-api` → Settings → Environment Variables

Adicione as seguintes variáveis:

### 1. Banco de Dados (PostgreSQL)
```
DB_NAME=chapanela
DB_USER=chapanela_user
DB_PASSWORD=0IYYYDFVS4CKmd8sL0VZCU7Fi9xeDRJC
DB_HOST=dpg-d770ol9aae7s73dilprg-a.oregon-postgres.render.com
DB_PORT=5432
```

### 2. Segurança & Configuração
```
SECRET_KEY=<sua-chave-secreta-aqui>
JWT_SECRET_KEY=<sua-chave-jwt-aqui>
DEBUG=False
```

### 3. Hosts Permitidos
```
ALLOWED_HOSTS=cha-de-panela-api.vercel.app,.vercel.app
```

### 4. CORS (Frontend)
```
CORS_ORIGINS=https://cha-de-panela-web.vercel.app,https://localhost:3000
```

## Alternativa: Usar DATABASE_URL (Conexão Interna do Render)

Se preferir usar a URL completa de conexão do Render:

```
DATABASE_URL=postgresql://chapanela_user:0IYYYDFVS4CKmd8sL0VZCU7Fi9xeDRJC@dpg-d770ol9aae7s73dilprg-a/chapanela
```

Nesse caso, o Django automaticamente detectará e usará a URL ao invés das variáveis individuais.

## Testar a Conexão

Após configurar, faça um redeploy no Vercel e teste:

```bash
# Registrar novo usuário
curl -X POST https://cha-de-panela-api.vercel.app/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email":"teste@example.com",
    "password":"senha123",
    "couple_name":"Teste Casal"
  }'

# Expected: 201 Created com JWT token
```

## Migração de SQLite → PostgreSQL

Os dados existentes no SQLite **não** serão transferidos automaticamente.

Para migrar dados historicamente criados:

1. **Fazer backup do SQLite**:
   ```bash
   cp db.sqlite3 db.backup.sqlite3
   ```

2. **Exportar dados** (se necessário):
   ```bash
   # Criar dump do SQLite
   sqlite3 db.sqlite3 .dump > backup.sql
   ```

3. **Rodar migrações no novo banco**:
   ```bash
   python manage.py migrate --database=default
   ```

O Vercel rodará automaticamente `python manage.py migrate` no build.

## Troubleshooting

### Erro: "unable to open database file"
- Verifique se as variáveis de ambiente estão configuradas no Vercel
- Confirme que o host PostgreSQL é acessível

### Erro: "FATAL: password authentication failed"
- Verifique a senha em `DB_PASSWORD`
- Confira o usuário em `DB_USER`

### Erro: "database does not exist"
- Verifique que o banco `chapanela` existe no Render
- Confirme o valor de `DB_NAME`
