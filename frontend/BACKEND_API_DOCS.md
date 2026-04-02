# Documentação da API - Lista de Presentes de Casamento

Este documento descreve os endpoints que seu backend deve implementar para integrar com este frontend.

## Configuração

Configure a URL do seu backend na variável de ambiente:
```
VITE_API_URL=https://seu-backend.com/api
```

---

## Esquema do Banco de Dados (PostgreSQL)

### Tabela: `couples` (Casais/Admins)
```sql
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  couple_name VARCHAR(255) NOT NULL,
  list_title VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  pix_key VARCHAR(255) NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `gifts` (Presentes)
```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT FALSE,
  selected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Endpoints da API

### Autenticação

#### POST /api/auth/login
Login do casal (admin).

**Request:**
```json
{
  "email": "casal@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "couple": {
    "id": "uuid",
    "email": "casal@email.com",
    "coupleName": "Iara & Ramon",
    "listTitle": "Chá de Panela da Iara e do Ramon",
    "whatsapp": "5511999999999",
    "pixKey": "iara.ramon@email.com",
    "qrCodeUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/auth/me
Retorna dados do usuário autenticado.

**Headers:** `Authorization: Bearer {token}`

**Response (200):** Objeto `Couple`

---

### Casal (Couple)

#### GET /api/couple/public
Retorna dados públicos do casal (sem autenticação).

**Response (200):** Objeto `Couple` (sem email)

#### PUT /api/couple
Atualiza dados do casal.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "coupleName": "Iara & Ramon",
  "listTitle": "Chá de Panela",
  "whatsapp": "5511999999999",
  "pixKey": "chave@pix.com",
  "qrCodeUrl": "https://..."
}
```

**Response (200):** Objeto `Couple` atualizado

---

### Presentes (Gifts)

#### GET /api/gifts
Lista todos os presentes (público).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "coupleId": "uuid",
    "title": "Jogo de Panelas",
    "description": "Conjunto completo...",
    "price": 350.00,
    "imageUrl": "https://...",
    "isSelected": false,
    "selectedAt": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/gifts/:id
Retorna um presente específico.

**Response (200):** Objeto `Gift`

#### POST /api/gifts
Cria novo presente.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "title": "Jogo de Panelas",
  "description": "Conjunto completo...",
  "price": 350.00,
  "imageUrl": "https://..."
}
```

**Response (201):** Objeto `Gift` criado

#### PUT /api/gifts/:id
Atualiza um presente.

**Headers:** `Authorization: Bearer {token}`

**Request:** Campos parciais do presente

**Response (200):** Objeto `Gift` atualizado

#### DELETE /api/gifts/:id
Remove um presente.

**Headers:** `Authorization: Bearer {token}`

**Response (204):** No content

#### POST /api/gifts/:id/select
Marca presente como selecionado (presenteado).

**Response (200):** Objeto `Gift` atualizado

---

### Upload de Imagens

#### POST /api/upload/image
Upload de imagem (QR Code ou foto do presente).

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Body:** FormData com campo `image`

**Response (200):**
```json
{
  "url": "https://seu-storage.com/imagem.jpg"
}
```

---

## Códigos de Erro

- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (token inválido/expirado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error

**Formato de erro:**
```json
{
  "message": "Descrição do erro",
  "statusCode": 400
}
```

---

## Notas de Implementação

1. **Autenticação:** Use JWT tokens com expiração de 7-30 dias
2. **Senhas:** Use bcrypt com salt rounds >= 10
3. **CORS:** Configure para aceitar requests do frontend
4. **Validação:** Valide todos os inputs no backend
5. **Imagens:** Recomendamos usar serviço de storage externo (S3, Cloudinary, etc.)

---

## Exemplo de Stack para Backend

- **Node.js + Express** ou **Fastify**
- **PostgreSQL** com **Prisma** ou **Knex**
- **JWT** para autenticação
- **Multer** + **Cloudinary/S3** para uploads
