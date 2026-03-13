const { Article } = require('../models');

async function publishScheduled() {
  try {
    const now = new Date();
    const result = await Article.update(
      { status: 'published' },
      {
        where: {
          status: 'scheduled',
          publishedAt: { [require('sequelize').Op.lte]: now },
        },
      }
    );
    if (result[0] > 0) {
      console.log(`[JOB] ${result[0]} artigo(s) publicado(s) automaticamente em ${now.toLocaleString('pt-BR')}`);
    }
  } catch (err) {
    console.error('[JOB] Erro ao publicar agendados:', err.message);
  }
}

// Roda imediatamente ao iniciar e depois a cada 1 minuto
publishScheduled();
setInterval(publishScheduled, 60 * 1000);

module.exports = publishScheduled;