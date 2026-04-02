# Contribuindo para Happy Couple Registry Backend

Obrigado por considerar contribuir para o projeto cha de panela! Queremos tornar a contribuição o mais fácil e transparente possível.

## Processo de Desenvolvimento

1. Fork o repositório e crie sua branch a partir de `main`
2. Se você adicionou um código que deve ser testado, adicione testes
3. Garanta que o código segue os padrões do projeto
4. Escreva uma boa mensagem de commit
5. Faça o push para o seu fork
6. Abra um Pull Request

## Commits

Utilizamos o padrão de commits convencionais:

```
<tipo>: <descrição>

[corpo opcional]
[rodapé opcional]
```

### Tipos de Commits

- **feat**: Uma nova feature
- **fix**: Um bug fix
- **docs**: Mudanças na documentação
- **style**: Mudanças que não afetam o código (espaços, formatação, etc.)
- **refactor**: Refatoração de código sem mudar funcionalidade
- **perf**: Melhorias de performance
- **test**: Adição ou atualização de testes
- **chore**: Mudanças em ferramentas, dependências, etc.

### Exemplos

```
feat: add gift selection endpoint
fix: correct CORS configuration
docs: update API documentation
```

## Padrões de Código

### Python
- Seguir PEP 8
- Usar type hints quando possível
- Documentar funções com docstrings

### Exemplo de Função
```python
def create_gift(couple_id: str, gift_data: dict) -> Gift:
    """
    Create a new gift for a couple.
    
    Args:
        couple_id: ID of the couple
        gift_data: Dictionary with gift information
        
    Returns:
        Gift object with created gift data
    """
    # implementation
```

## Relatórios de Bugs

### Reportar um Bug

Reportar bugs é uma forma excelente de contribuir! Abra um [Issue](../../issues) e forneça:

1. **Título descritivo** do bug
2. **Descrição detalhada** do comportamento observado
3. **Passos para reproduzir** o problema
4. **Comportamento esperado**
5. **Seu ambiente** (Python version, OS, etc.)
6. **Logs** se disponíveis

### Exemplo

```
Título: Erro ao criar presente com preço inválido

Descrição:
Ao tentar criar um presente com preço em formato incorreto, o backend retorna um erro genérico.

Passos para reproduzir:
1. POST /api/gifts
2. Body: { "price": "abc" }
3. Resultado: 500 Internal Server Error

Esperado:
400 Bad Request com mensagem clara sobre o formato inválido

Ambiente:
- Python 3.12
- Ubuntu 20.04
```

## Pull Requests

1. Preencha o template de PR com informações completas
2. Siga o padrão de código do projeto
3. Inclua testes relevantes
4. Atualize a documentação se necessário
5. Garanta que os testes passam

### Template de PR

```
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix (mudança não-breaking que corrige um issue)
- [ ] Nova feature (mudança não-breaking que adiciona funcionalidade)
- [ ] Breaking change (mudança que causaria funcionalidade existente quebrar)

## Como foi testado?
Descreva os testes que você executou

## Checklist
- [ ] Meu código segue o style guide do projeto
- [ ] Executei linting e correções de estilo
- [ ] Adicionei testes relevantes
- [ ] Atualizei a documentação
- [ ] Meus commits possuem mensagens descritivas
```

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

## Questões?

Sinta-se livre para abrir uma Issue para fazer perguntas sobre como contribuir.

---

**Obrigado por contribuir! 🎉**
