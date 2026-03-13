require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Banco sincronizado');

  require('./src/jobs/publishScheduled');

  app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
}).catch(err => {
  console.error('Erro ao conectar no banco:', err.message);
});