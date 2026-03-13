# Ôxereta — Mini CMS de Notícias

Sistema de gerenciamento de conteúdo (CMS) para blogs de notícias, desenvolvido com Node.js, Express, PostgreSQL e EJS.

## Tecnologias

- Node.js 18+ + Express
- PostgreSQL + Sequelize
- EJS (templates)
- JWT (autenticação via cookie httpOnly)
- bcryptjs (hash de senhas)
- multer (upload de imagens)
- express-validator (validação de campos)
- morgan (logs de requisições)

## Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL instalado e rodando

### Passo a passo

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/oxereta.git
cd oxereta
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o banco de dados no PostgreSQL:
```bash
psql -U postgres -c "CREATE DATABASE news_cms;"
```

4. Copie o arquivo de exemplo e configure o `.env`:
```bash
cp .env.example .env
```

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_cms
DB_USER=postgres
DB_PASS=sua_senha
JWT_SECRET=sua_chave_secreta
SEED_EMAIL=joao@exemplo.com
SEED_PASSWORD=sua-senha-forte
```

> ⚠️ Nunca commite o arquivo `.env`. Ele já está no `.gitignore`.

5. Crie a pasta de uploads:
```bash
mkdir -p public/uploads
```

6. Popule o banco com dados iniciais:
```bash
npm run seed
```

7. Inicie o servidor:
```bash
npm run dev
```

8. Acesse em: `http://localhost:3000`

## Estrutura do projeto

```
oxereta/
├── public/
│   └── uploads/        # Imagens enviadas pelos jornalistas
├── src/
│   ├── config/         # Configuração do banco (PostgreSQL e SQLite para testes)
│   ├── controllers/    # Lógica de negócio
│   ├── jobs/           # Tarefas assíncronas
│   ├── middlewares/    # Autenticação, autorização, validação e upload
│   ├── models/         # Models Sequelize
│   ├── routes/         # Rotas da aplicação
│   ├── tests/          # Testes automatizados
│   └── views/          # Templates EJS
├── seeds/              # Dados iniciais
├── .env.example        # Exemplo de variáveis de ambiente
├── app.js
├── server.js
├── API.md
└── README.md
```

## Rotas públicas

| Método | Rota          | Descrição                |
|--------|---------------|--------------------------|
| GET    | /             | Lista artigos publicados |
| GET    | /artigo/:slug | Detalhe de um artigo     |
| GET    | /auth/login   | Página de login          |
| POST   | /auth/login   | Realiza login            |
| GET    | /auth/logout  | Realiza logout           |

## Rotas admin (requer login)

| Método | Rota                       | Descrição            |
|--------|----------------------------|----------------------|
| GET    | /admin/articles            | Lista meus artigos   |
| GET    | /admin/articles/new        | Formulário de criar  |
| POST   | /admin/articles            | Cria artigo          |
| GET    | /admin/articles/:id/edit   | Formulário de editar |
| POST   | /admin/articles/:id        | Atualiza artigo      |
| POST   | /admin/articles/:id/delete | Remove artigo        |

## API REST

Consulte o arquivo [API.md](./API.md) para a documentação completa com exemplos de requisição e resposta.

| Método | Rota              | Auth         | Descrição                |
|--------|-------------------|--------------|--------------------------|
| GET    | /api/articles     | Não          | Lista artigos publicados |
| GET    | /api/articles/:id | Não          | Retorna artigo por ID    |
| POST   | /api/articles     | Sim          | Cria novo artigo         |
| PUT    | /api/articles/:id | Sim          | Atualiza artigo          |
| DELETE | /api/articles/:id | Sim          | Remove artigo            |
| GET    | /api/articles/all | Sim (editor) | Lista todos os artigos   |

## Tarefas assíncronas

- **Publicação automática**: artigos com `status: scheduled` e data de publicação no passado são publicados automaticamente a cada 1 minuto.
- **Contagem de visualizações**: ao abrir um artigo, o contador é incrementado de forma assíncrona sem bloquear a resposta ao usuário.

## Testes

Os testes usam SQLite em memória e não afetam o banco de produção.

```bash
npm test
```

Cobertura atual:
- Autenticação: login válido, senha incorreta, e-mail inexistente
- Artigos: criar, listar, buscar por ID, atualizar, remover, acesso sem autenticação, 404

## Segurança

- Senhas armazenadas com hash bcrypt
- Autenticação via JWT em cookie `httpOnly`
- Jornalista só gerencia os próprios artigos
- Variáveis sensíveis isoladas no `.env`
- Upload restrito a imagens (JPG, PNG, WEBP, GIF) com limite de 5MB
- Validação e sanitização de campos com express-validator
