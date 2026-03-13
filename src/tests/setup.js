const { sequelize } = require('../models');

beforeAll(async () => {
  await sequelize.query('DROP SCHEMA public CASCADE');
  await sequelize.query('CREATE SCHEMA public');
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});