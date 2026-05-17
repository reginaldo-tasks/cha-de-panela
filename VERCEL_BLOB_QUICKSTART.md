# 🚀 Vercel Blob Storage - Quick Start

## ⚡ 5 Passos para Começar

### 1️⃣ Habilitar Blob Storage na Vercel (2 min)
```bash
# Opção A: Dashboard (mais fácil)
vercel.com 
→ seu projeto cha-de-panela-api
→ Settings 
→ Storage 
→ Create new 
→ Select "Blob"
→ Click create

# Opção B: CLI (mais rápido)
vercel storage create --kind blob
```

**O que acontece?**  
✅ Token `S3_READ_WRITE_TOKEN` criado automaticamente  
✅ Disponível como environment variable  

### 2️⃣ Deploy (1 min)
```bash
# Seu código já está pronto!
git push origin main

# Vercel detecta mudanças e faz deploy automático
# Com S3_READ_WRITE_TOKEN disponível
```

### 3️⃣ Verificar Logs (1 min)
```bash
vercel logs --follow

# Procure por:
# [BLOB] Using Vercel Blob Storage ✅
# [BLOB] Upload success: gifts/...    ✅
```

### 4️⃣ Testar Upload (2 min)
- Vá para https://seu-projeto-web.vercel.app
- Faça login
- Crie/edite um presente
- Upload de imagem → deve funcionar! 📸

### 5️⃣ Validar (1 min)
- Imagem aparece no present? ✅
- URL é pública? Tente abrá-la em outra aba ✅

---

## 📋 Checklist

```
[ ] 1. Blob Storage criado na Vercel
[ ] 2. Deploy executado
[ ] 3. Logs mostram [BLOB] Using Vercel Blob Storage
[ ] 4. Upload de imagem funciona
[ ] 5. Imagem é pública e acessível
```

---

## 🆘 Se Algo Deu Errado

### ❌ Erro: "BLOB_NOT_CONFIGURED"
```
→ Blob Storage ainda não foi habilitado
→ Solução: Fazer Passo 1 novamente
→ Espere 1-2 min após criar
→ Faça novo deploy
```

### ❌ Upload falha com 401
```
→ Token inválido ou expirado  
→ Solução: Regenerar Blob Storage
→ Apagar current → Create new
→ Fazer novo deploy
```

### ❌ Nenhum erro, mas imagem não salva
```
→ Pode estar usando fallback Supabase S3
→ Verificar variáveis: vercel env list
→ Deve mostrar S3_READ_WRITE_TOKEN com valor
```

---

## ✅ Como Saber que Funcionou

### ✅ Sinal 1: Logs
```
[BLOB] Using Vercel Blob Storage
[BLOB] Upload success: gifts/uuid/filename.jpg
```

### ✅ Sinal 2: Imagem Pública
```
URL parecida com:
https://blob.vercelusercontent.com/a1b2c3.../...jpg
```

### ✅ Sinal 3: Sem Erros
```
Upload completa sem exceções
Presente salvo com image_url
```

---

## 📚 Documentação Completa

Precisa de mais detalhes?

- **Migração**: [VERCEL_BLOB_MIGRATION.md](VERCEL_BLOB_MIGRATION.md)
- **Guia Completo**: [VERCEL_BLOB_COMPLETE_GUIDE.md](VERCEL_BLOB_COMPLETE_GUIDE.md)
- **Resumo**: [VERCEL_BLOB_SETUP_SUMMARY.md](VERCEL_BLOB_SETUP_SUMMARY.md)

---

## 🎯 Resumo

| O Que | Antes | Agora |
|------|-------|-------|
| **Storage** | Supabase S3 / MinIO | ✅ Vercel Blob |
| **Setup** | Complexo (credenciais) | ✅ Automático (1-click) |
| **Segurança** | Token em .env | ✅ Gerenciado pelo Vercel |
| **Custo** | Mais caro | ✅ Mais barato |
| **Performance** | Bom | ✅ Melhor (CDN) |

---

## 🚀 Pronto!

Seu projeto está 100% preparado. Basta seguir os 5 passos acima.

**Tempo total**: ~10 minutos ⏱️

---

**Perguntas?** Ver documentação completa ou verificar logs da Vercel 📊
