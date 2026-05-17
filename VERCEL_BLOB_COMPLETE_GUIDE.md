# Vercel Blob Storage - Guia Completo

## 🎯 Duas Abordagens

### Opção 1: Upload via Backend (✅ Recomendado - Já Configurado)
Backend faz o upload para Vercel Blob Storage.  
**Status**: ✅ Pronto para usar

### Opção 2: Upload Direto do Frontend (Alternativo)
Frontend faz upload direto para Vercel Blob Storage.  
**Status**: ℹ️ Para implementação futura

---

## ✅ Opção 1: Backend (Atual - Recomendada)

### Como Funciona
```
Frontend → Backend Django → Vercel Blob Storage
```

### Frontend (Sem mudanças necessárias)
```typescript
// frontend/src/components/ImageUploadDialog.tsx
const updatedGift = await api.upload.uploadGiftImage(gift.id, file);
```

### Backend
- Serviço: [backend/gifts/blob_service.py](backend/gifts/blob_service.py)
- View: [backend/gifts/views.py](backend/gifts/views.py#L506)
- Endpoint: `POST /api/gifts/{id}/upload-image/`

### Configuração
```bash
# Vercel Dashboard > Settings > Storage > Create > Blob
# Token gerado automaticamente em S3_READ_WRITE_TOKEN
```

### Vantagens
✅ Mais seguro (token não exposto no frontend)  
✅ Validação de arquivo no backend  
✅ Já implementado  
✅ Funciona com fallback Supabase S3  

---

## ℹ️ Opção 2: Frontend (Opcional)

### Quando Usar
- Fazer upload direto sem passar pelo backend
- Reduzir latência
- Gerenciar uploads de forma descentralizada

### Instalação
```bash
cd frontend
bun add @vercel/blob
# ou npm
npm install @vercel/blob
```

### Exemplo de Uso
```typescript
// frontend/src/services/blobUpload.ts
import { put, del } from '@vercel/blob';

export async function uploadImageToBlob(file: File, giftId: string): Promise<string> {
  try {
    const { url } = await put(
      `gifts/${giftId}/${file.name}`,
      file,
      {
        access: 'public',
        token: process.env.VITE_BLOB_READ_WRITE_TOKEN,
      }
    );
    return url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

export async function deleteImageFromBlob(url: string): Promise<void> {
  try {
    await del(url, {
      token: process.env.VITE_BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}
```

### Usar no Componente
```typescript
// frontend/src/components/ImageUploadDialog.tsx
import { uploadImageToBlob } from '@/services/blobUpload';

const handleUpload = async () => {
  try {
    setIsUploading(true);
    const imageUrl = await uploadImageToBlob(file, gift.id);
    
    // Atualizar gift com URL do Blob
    const updatedGift = { ...gift, image_url: imageUrl };
    onUploadSuccess(updatedGift);
  } catch (error) {
    toast({
      title: 'Erro no upload',
      description: error.message,
      variant: 'destructive',
    });
  }
};
```

### Variáveis de Ambiente (Frontend)
```env
# .env (frontend)
VITE_BLOB_READ_WRITE_TOKEN=sua-token-aqui
```

### Em Vercel
```bash
# Settings > Environment Variables (Frontend project)
VITE_BLOB_READ_WRITE_TOKEN = [seu-token]
```

### Vantagens
✅ Sem passar pelo backend  
✅ Upload mais rápido  
✅ Melhor para grandes arquivos  
✅ Usa `@vercel/blob` nativa  

### Desvantagens
⚠️ Token exposto no frontend  
⚠️ Sem validação server-side  
⚠️ CORS pode ser necessário  

---

## 🔄 Migrar de uma Opção para Outra

### De Backend para Frontend
1. Instalar `@vercel/blob` no frontend
2. Criar serviço `blobUpload.ts`
3. Atualizar `ImageUploadDialog.tsx`
4. Remover `blob_service.py` do backend (opcional)

### De Frontend para Backend
1. Usar implementação atual ([blob_service.py](backend/gifts/blob_service.py))
2. Remover `@vercel/blob` do frontend
3. Manter chamada para backend: `api.upload.uploadGiftImage()`

---

## 🔒 Segurança: Qual Escolher?

### Se Sensível com Segurança
→ **Use Backend (Opção 1)**
- Token não exposto no cliente
- Validação server-side
- Mais controle

### Se Prioriza Performance
→ **Use Frontend (Opção 2)**
- Upload direto
- Menos latência
- Mas cuide do token

---

## 🚀 Status Atual

✅ **Backend**: Totalmente configurado e pronto  
⏳ **Frontend**: Use via backend ou implemente Opção 2 conforme necessário

---

## 📋 Próximos Passos

### Opção 1 (Recomendada - Agora)
- [ ] Habilitar Blob Storage na Vercel
- [ ] Deploy
- [ ] Testar upload

### Opção 2 (Futura - Se Necessário)
- [ ] Instalar `@vercel/blob`
- [ ] Criar `blobUpload.ts`
- [ ] Atualizar componente
- [ ] Testar upload direto

---

## 📚 Referências

- **Vercel Blob**: https://vercel.com/docs/storage/vercel-blob
- **@vercel/blob**: https://github.com/vercel/storage/tree/main/packages/blob
- **Vercel SDK**: https://vercel.com/docs/storage/vercel-blob/sdk
- **Backend Blob Service**: [blob_service.py](backend/gifts/blob_service.py)

---

**Escolha a opção que melhor se adequa ao seu projeto! 🚀**
