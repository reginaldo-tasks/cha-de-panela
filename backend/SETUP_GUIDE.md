# 🎁 Guia de Setup - Happy Couple Registry Backend

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- **Python 3.8+**: https://www.python.org/downloads/
- **pip**: Geralmente vem com Python

## Instalação Passo a Passo

### Passo 1: Clonar o repositório
```bash
cd /home/builds/happy-couple-registry
```

### Passo 2: Navegar para o backend
```bash
cd backend
```

### Passo 3: Executar o script de início (Linux/Mac)
```bash
chmod +x start.sh
./start.sh
```

Ou manualmente no Windows:

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Semear banco de dados
python seed.py

# Iniciar servidor
python app.py
```

### Passo 4: Verificar se o servidor está rodando
```bash
curl http://localhost:5000/api/health
```

Resposta esperada:
```json
{"status": "ok"}
```

## 📱 Usando a API

### Fazer Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "casal@email.com", "password": "senha123"}'
```

### Obter Informações Públicas do Casal
```bash
curl http://localhost:5000/api/couple/public
```

### Listar Todos os Presentes
```bash
curl http://localhost:5000/api/gifts
```

### Criar um Presente (requer autenticação)
```bash
curl -X POST http://localhost:5000/api/gifts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Jogo de cozinha",
    "description": "Conjunto completo",
    "category": "Cozinha",
    "price": 150.00,
    "priority": 1
  }'
```

## 🔧 Troubleshooting

### Erro: "command not found: python3"
**Solução**: Instale Python 3 no seu sistema
- **Ubuntu/Debian**: `sudo apt-get install python3 python3-pip`
- **macOS**: `brew install python3`
- **Windows**: Baixe em https://www.python.org/downloads/

### Erro: "No module named 'flask'"
**Solução**: Instale as dependências
```bash
pip install -r requirements.txt
```

### Erro: "Database is locked"
**Solução**: Remova e recrie o banco de dados
```bash
rm gifts_registry.db
python seed.py
```

### Erro: "Address already in use"
**Solução**: A porta 5000 já está em uso. Mude em `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Use 5001 ou outra porta
```

## 📚 Estrutura do Projeto

```
backend/
├── app.py              # Aplicação principal Flask
├── config.py           # Configurações
├── models.py           # Modelos de banco de dados
├── seed.py             # Script para popular BD
├── requirements.txt    # Dependências Python
├── .env                # Variáveis de ambiente
├── .gitignore          # Arquivos ignorados
├── start.sh            # Script de inicialização
├── routes/
│   ├── __init__.py
│   ├── auth.py         # Autenticação
│   ├── couple.py       # Informações do casal
│   └── gifts.py        # Gerenciamento de presentes
└── gifts_registry.db   # Banco de dados SQLite (criado ao rodar seed.py)
```

## 🚀 Próximos Passos

1. ✅ Backend está rodando em `http://localhost:5000`
2. 📝 Configure o frontend para usar `http://localhost:5000` como API_URL
3. 🧪 Teste os endpoints usando Postman ou curl
4. 🔒 Em produção, mude as chaves de segurança no `.env`

## 📞 Suporte

Para dúvidas ou problemas, verifique o README.md principal no backend.
