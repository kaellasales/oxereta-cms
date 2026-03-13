const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  'news_cms_test',
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;