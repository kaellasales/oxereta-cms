# Documentação da API — Ôxereta

Base URL: `http://localhost:3000/api`

Rotas autenticadas exigem o token JWT no cookie `token` (obtido via login).

---

## Autenticação

### POST /auth/login
Realiza login. Se a requisição vier do navegador, redireciona para `/admin/articles`. Se vier de um cliente de API, retorna o token JSON.

**Body:**
```json
{
  "email": "joao@cms.com",
  "password": "sua-senha"
}
```

**Resposta (200):**
```json
{
  "message": "Login realizado",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta (401):**
```json
{
  "error": "E-mail ou senha incorretos."
}
```

---

### GET /auth/logout
Realiza logout e redireciona para a home.

---

## Artigos

### GET /api/articles
Lista artigos publicados. Suporta filtros via query string.

**Parâmetros opcionais:**
| Parâmetro | Tipo   | Descrição                              |
|-----------|--------|----------------------------------------|
| search    | string | Busca por título                       |
| category  | number | Filtra por ID de categoria             |
| tag       | number | Filtra por ID de tag                   |
| order     | string | `recent` (padrão) ou `views`           |
| page      | number | Página (padrão: 1)                     |
| dateFrom  | date   | Filtra artigos a partir desta data     |
| dateTo    | date   | Filtra artigos até esta data           |

**Exemplos de requisição:**
```
GET /api/articles?search=tecnologia&page=1&order=views
GET /api/articles?category=1&tag=2
GET /api/articles?dateFrom=2026-01-01&dateTo=2026-03-31
```

**Resposta (200):**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Node.js com PostgreSQL é poderoso",
      "slug": "nodejs-com-postgresql-e-poderoso",
      "subtitle": "Aprenda a usar Node com PG",
      "content": "Conteúdo do artigo...",
      "coverImage": "/uploads/1234567890-imagem.jpg",
      "status": "published",
      "publishedAt": "2026-03-12T14:00:00.000Z",
      "views": 42,
      "author": { "id": 1, "name": "João Silva" },
      "Category": { "id": 1, "name": "Tecnologia" },
      "Tags": [{ "id": 1, "name": "JavaScript" }]
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

---

### GET /api/articles/:id
Retorna um artigo específico pelo ID.

**Exemplo de requisição:**
```
GET /api/articles/1
```

**Resposta (200):**
```json
{
  "id": 1,
  "title": "Node.js com PostgreSQL é poderoso",
  "slug": "nodejs-com-postgresql-e-poderoso",
  "subtitle": "Aprenda a usar Node com PG",
  "content": "Conteúdo do artigo...",
  "coverImage": "/uploads/1234567890-imagem.jpg",
  "status": "published",
  "publishedAt": "2026-03-12T14:00:00.000Z",
  "views": 42,
  "author": { "id": 1, "name": "João Silva" },
  "Category": { "id": 1, "name": "Tecnologia" },
  "Tags": [{ "id": 1, "name": "JavaScript" }]
}
```

**Resposta (404):**
```json
{
  "error": "Não encontrado"
}
```

---

### POST /api/articles
Cria um novo artigo. **Requer autenticação.**

O corpo da requisição deve ser enviado como `multipart/form-data` para suportar upload de imagem.

**Campos:**
| Campo       | Tipo   | Obrigatório | Descrição                                      |
|-------------|--------|-------------|------------------------------------------------|
| title       | string | ✅          | Título do artigo                               |
| content     | string | ✅          | Conteúdo do artigo                             |
| subtitle    | string | ❌          | Subtítulo                                      |
| coverImage  | file   | ❌          | Imagem de capa (JPG, PNG, WEBP, GIF — máx 5MB)|
| status      | string | ✅          | `draft`, `scheduled` ou `published`            |
| publishedAt | string | ✅ se agendado | Data/hora no formato ISO 8601 (deve ser futura)|
| categoryId  | number | ❌          | ID da categoria                                |
| tags        | array  | ❌          | Lista de IDs de tags                           |

**Resposta (201):**
```json
{
  "id": 2,
  "title": "Meu novo artigo",
  "slug": "meu-novo-artigo",
  "status": "draft",
  "authorId": 1,
  "categoryId": 1,
  "createdAt": "2026-03-12T15:00:00.000Z",
  "updatedAt": "2026-03-12T15:00:00.000Z"
}
```

**Resposta (400):**
```json
{
  "error": "O título é obrigatório."
}
```

**Resposta (401):**
```json
{
  "error": "Não autenticado"
}
```

---

### PUT /api/articles/:id
Atualiza um artigo existente. **Requer autenticação.**

Jornalista só pode editar os próprios artigos. Editor pode editar qualquer artigo.

O corpo deve ser enviado como `multipart/form-data`.

**Campos:** mesmos do POST — todos opcionais, exceto `title` e `content`.

Se uma nova imagem for enviada, substitui a anterior. Se não for enviada, mantém a imagem atual.

**Resposta (200):**
```json
{
  "id": 2,
  "title": "Título atualizado",
  "slug": "titulo-atualizado",
  "status": "published",
  "updatedAt": "2026-03-12T16:00:00.000Z"
}
```

**Resposta (403):**
```json
{
  "error": "Sem permissão"
}
```

---

### DELETE /api/articles/:id
Remove um artigo permanentemente. **Requer autenticação.**

Jornalista só pode remover os próprios artigos. Editor pode remover qualquer artigo.

**Exemplo de requisição:**
```
DELETE /api/articles/2
```

**Resposta (200):**
```json
{
  "message": "Artigo removido"
}
```

**Resposta (403):**
```json
{
  "error": "Sem permissão"
}
```

---

### GET /api/articles/all
Lista todos os artigos incluindo rascunhos e agendados. **Requer autenticação como editor.**

**Resposta (200):**
```json
[
  {
    "id": 1,
    "title": "Artigo publicado",
    "status": "published",
    "author": { "id": 1, "name": "João Silva" }
  },
  {
    "id": 2,
    "title": "Rascunho secreto",
    "status": "draft",
    "author": { "id": 1, "name": "João Silva" }
  },
  {
    "id": 3,
    "title": "Artigo agendado",
    "status": "scheduled",
    "publishedAt": "2026-04-01T10:00:00.000Z",
    "author": { "id": 1, "name": "João Silva" }
  }
]
```

**Resposta (403):**
```json
{
  "error": "Sem permissão"
}
```

---

## Tarefas assíncronas

### Publicação automática
Artigos com `status: "scheduled"` e `publishedAt` no passado são publicados automaticamente a cada **1 minuto**. O servidor registra no terminal cada publicação automática realizada.

### Contagem de visualizações
Ao acessar um artigo público (`GET /artigo/:slug`), o contador de visualizações é incrementado de forma assíncrona sem bloquear a resposta ao usuário.

---

## Códigos de status

| Código | Descrição                        |
|--------|----------------------------------|
| 200    | Sucesso                          |
| 201    | Criado com sucesso               |
| 400    | Dados inválidos ou erro de validação |
| 401    | Não autenticado                  |
| 403    | Sem permissão                    |
| 404    | Não encontrado                   |
| 500    | Erro interno do servidor         |
