const request = require('supertest');
const app = require('../../app');
const { sequelize, User, Category, Article } = require('../models');
const jwt = require('jsonwebtoken');

let token;
let categoryId;
let articleId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const user = await User.create({
    name: 'Jornalista Teste',
    email: 'jornalista@cms.com',
    password: '123456',
    role: 'journalist',
  });

  const cat = await Category.create({ name: 'Tecnologia', slug: 'tecnologia' });
  categoryId = cat.id;

  token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
});

afterAll(async () => {
  await sequelize.close();
});

describe('CRUD de Artigos', () => {
  it('deve criar um artigo', async () => {
    const res = await request(app)
      .post('/api/articles')
      .set('Cookie', `token=${token}`)
      .send({
        title: 'Artigo de Teste',
        subtitle: 'Subtítulo teste',
        content: 'Conteúdo do artigo de teste',
        status: 'draft',
        categoryId,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.slug).toBe('artigo-de-teste');
    articleId = res.body.id;
  });

  it('deve listar artigos publicados', async () => {
    const res = await request(app).get('/api/articles');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('articles');
    expect(Array.isArray(res.body.articles)).toBe(true);
  });

  it('deve retornar um artigo por ID', async () => {
    const res = await request(app).get(`/api/articles/${articleId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(articleId);
  });

  it('deve atualizar um artigo', async () => {
    const res = await request(app)
      .put(`/api/articles/${articleId}`)
      .set('Cookie', `token=${token}`)
      .send({ title: 'Artigo Atualizado', status: 'published' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Artigo Atualizado');
  });

  it('deve recusar criação sem autenticação', async () => {
    const res = await request(app)
      .post('/api/articles')
      .send({ title: 'Sem auth', content: 'teste' });
    expect(res.statusCode).toBe(401);
  });

  it('deve remover um artigo', async () => {
    const res = await request(app)
      .delete(`/api/articles/${articleId}`)
      .set('Cookie', `token=${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Artigo removido');
  });

  it('deve retornar 404 para artigo inexistente', async () => {
    const res = await request(app).get('/api/articles/99999');
    expect(res.statusCode).toBe(404);
  });
});