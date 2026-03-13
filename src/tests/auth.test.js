const request = require('supertest');
const app = require('../../app');
const { sequelize, User } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await User.create({
    name: 'Teste',
    email: 'teste@cms.com',
    password: '123456',
    role: 'journalist',
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Autenticação', () => {
  it('deve fazer login com credenciais válidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'teste@cms.com', password: '123456' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('deve recusar senha inválida', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'teste@cms.com', password: 'errada' });
    expect(res.statusCode).toBe(401);
  });

  it('deve recusar email inexistente', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'naoexiste@cms.com', password: '123456' });
    expect(res.statusCode).toBe(401);
  });
});