# Vercel Blob Storage - Migração do Projeto

## 📦 O que mudou?

O projeto foi atualizado para usar **Vercel Blob Storage** em vez de S3/MinIO/Supabase.

| Aspecto | Antes | Agora |
|--------|-------|-------|
| **Storage** | Supabase S3 / MinIO | Vercel Blob Storage |
| **Credenciais** | `SUPABASE_S3_ENDPOINT`, `SUPABASE_ACCESS_KEY`, `SUPABASE_SECRET_KEY` | `S3_READ_WRITE_TOKEN` |
| **Biblioteca** | `boto3` | `requests` (API REST) + fallback `boto3` |
| **Serviço Python** | `minio_service.py` | `blob_service.py` |

## ✅ Mudanças Realizadas

### 1. **Backend - Python (Django)**
- ✅ Criado novo serviço: [blob_service.py](backend/gifts/blob_service.py)
- ✅ Atualizado [views.py](backend/gifts/views.py) para usar `blob_service`
- ✅ Adicionado `requests>=2.31.0` ao [requirements.txt](backend/requirements.txt)
- ✅ Atualizado [.env.example](backend/.env.example) - usa `S3_READ_WRITE_TOKEN`
- ✅ Atualizado [.env.production](backend/.env.production) - pronto para Vercel

### 2. **Suporte a Fallback**
Se `S3_READ_WRITE_TOKEN` não estiver configurado, o projeto automaticamente fallback para Supabase S3.

```python
# blob_service.py - Ordem de prioridade:
1. Vercel Blob Storage (S3_READ_WRITE_TOKEN) ← RECOMENDADO
2. Supabase S3 (fallback)
```

## 🚀 Como Configurar

### Passo 1: Habilitar Blob Storage na Vercel

```bash
# Opção 1: Via Dashboard
vercel.com > seu-projeto > Settings > Storage > Create new > Blob

# Opção 2: Via CLI
vercel storage create --kind blob
```

### Passo 2: Token será gerado automaticamente
Vercel gera `S3_READ_WRITE_TOKEN` automaticamente como environment variable.

### Passo 3: Deploy
```bash
# Novo push automático detecta S3_READ_WRITE_TOKEN
git push origin main

# Ou force redeploy
vercel deploy --prod
```

## 🔍 Verificar Configuração

### No Terminal (localmente)
```bash
# Se S3_READ_WRITE_TOKEN está em .env
python manage.py shell

from gifts.blob_service import get_blob_service
service = get_blob_service()
# Deve imprimir: "[BLOB] Using Vercel Blob Storage"
```

### Nos Logs do Vercel
```bash
vercel logs --follow

# Procure por:
# [BLOB] Using Vercel Blob Storage
# [BLOB] Upload success: gifts/...
```

## 📚 API do Serviço

```python
from gifts.blob_service import get_blob_service

service = get_blob_service()

# Upload
url, filepath = service.upload_image(image_file, gift_id=uuid)

# Delete
success = service.delete_image(filepath)
```

## 🔒 Segurança

✅ **Token automático do Vercel**
- Vercel fornece `S3_READ_WRITE_TOKEN` automaticamente
- Nunca exponha em commits ou logs
- Apenas para uploads em `gifts/*`

## 🔄 Migração de Dados Existentes

Se tem imagens antigas no Supabase S3:

```bash
# As imagens continuam acessíveis em Supabase
# Novas uploads vão para Vercel Blob Storage

# Para migrar (opcional):
# 1. Download imagens do Supabase
# 2. Upload para Vercel Blob via API
# 3. Atualizar URLs no banco de dados
```

## 💡 Vantagens do Vercel Blob Storage

✅ Integrado com Vercel (sem configuração extra)  
✅ Mais barato que Supabase S3  
✅ Melhor performance (CDN global)  
✅ Menos dependências (`@vercel/blob` vs `boto3`)  
✅ Sem credenciais para gerenciar  

## 📋 Checklist

- [ ] Habilitar Blob Storage na Vercel
- [ ] Fazer novo deploy
- [ ] Testar upload de imagem
- [ ] Verificar logs no Vercel
- [ ] Validar URLs das imagens

## 🆘 Troubleshooting

### Erro: "BLOB_NOT_CONFIGURED"
```
→ S3_READ_WRITE_TOKEN não está configurado na Vercel
→ Solução: Habilitar Blob Storage no dashboard
```

### Erro: "Upload failed: 401"
```
→ Token inválido ou expirado
→ Solução: Regenerar token na Vercel
```

### Imagens antigas não aparecem
```
→ Se estavam em Supabase, URLs continuam funcionando
→ Apenas novas uploads vão para Vercel Blob
```

## 📖 Referências

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [API REST](https://vercel.com/docs/storage/vercel-blob/api-reference)
- [Cliente Python (requests)](https://docs.python-requests.org/)

---

**Seu projeto está pronto para Vercel Blob Storage! 🎉**
