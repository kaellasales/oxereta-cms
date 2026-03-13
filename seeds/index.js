require('dotenv').config();
const { sequelize, User, Category, Tag, Article } = require('../src/models');
const slugify = require('slugify');

async function seed() {
  // sync sem force: true — não apaga dados existentes
  await sequelize.sync();

  // Evita duplicar dados se rodar seed mais de uma vez
  const [journalist] = await User.findOrCreate({
    where: { email: process.env.SEED_EMAIL || 'joao@cms.com' },
    defaults: {
      name: 'Jounalista Seed',
      password: process.env.SEED_PASSWORD || 'troque-esta-senha',
      role: 'journalist',
    },
  });

  const [tech]          = await Category.findOrCreate({ where: { slug: 'tecnologia' },    defaults: { name: 'Tecnologia' } });
  const [sports]        = await Category.findOrCreate({ where: { slug: 'esportes' },      defaults: { name: 'Esportes' } });
  const [politics]      = await Category.findOrCreate({ where: { slug: 'politica' },      defaults: { name: 'Política' } });
  const [health]        = await Category.findOrCreate({ where: { slug: 'saude' },         defaults: { name: 'Saúde' } });
  const [entertainment] = await Category.findOrCreate({ where: { slug: 'entretenimento'},  defaults: { name: 'Entretenimento' } });
  const [business]      = await Category.findOrCreate({ where: { slug: 'negocios' },      defaults: { name: 'Negócios' } });

  const [tagJS]   = await Tag.findOrCreate({ where: { slug: 'javascript' },  defaults: { name: 'JavaScript' } });
  const [tagNode] = await Tag.findOrCreate({ where: { slug: 'nodejs' },      defaults: { name: 'Node.js' } });
  const [tagAPI]  = await Tag.findOrCreate({ where: { slug: 'api' },         defaults: { name: 'API' } });

  const title = 'Node.js com PostgreSQL é poderoso';
  const slug = slugify(title, { lower: true, strict: true });

  const [article] = await Article.findOrCreate({
    where: { slug },
    defaults: {
      title,
      subtitle: 'Aprenda a usar Node com PG',
      content: 'Conteúdo completo do artigo aqui...',
      status: 'published',
      publishedAt: new Date(),
      authorId: journalist.id,
      categoryId: tech.id,
    },
  });
  await article.addTags([tagJS, tagNode, tagAPI]);

  console.log('Seed concluído!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Erro no seed:', err.message);
  process.exit(1);
});