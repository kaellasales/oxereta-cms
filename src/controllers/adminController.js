const { Article, Category, Tag } = require('../models');
const slugify = require('slugify');
const { Op } = require('sequelize');

exports.listArticles = async (req, res) => {
  try {
    const where = req.user.role === 'editor' ? {} : { authorId: req.user.id };
    const articles = await Article.findAll({
      where,
      include: [{ model: Category }],
      order: [['createdAt', 'DESC']],
    });
    res.render('admin/articles', { articles, user: req.user });
  } catch (err) {
    res.status(500).send('Erro interno');
  }
};

exports.showCreate = async (req, res) => {
  const categories = await Category.findAll();
  const tags = await Tag.findAll();
  res.render('admin/form', { article: null, categories, tags, user: req.user, error: null });
};

exports.create = async (req, res) => {
  try {
    const { title, subtitle, content, status, publishedAt, categoryId, tags } = req.body;
    const coverImage = req.file ? '/uploads/' + req.file.filename : null;

    if (!title) throw new Error('O título é obrigatório.');
    if (!content) throw new Error('O conteúdo é obrigatório.');
    if (status === 'scheduled' && !publishedAt)
      throw new Error('Selecione uma data para o agendamento.');
    if (status === 'scheduled' && new Date(publishedAt) <= new Date())
      throw new Error('A data de agendamento deve ser no futuro.');

    let slug = slugify(title, { lower: true, strict: true });
    const exists = await Article.findOne({ where: { slug } });
    if (exists) slug += '-' + Date.now();

    const article = await Article.create({
      title, slug, subtitle, content, coverImage,
      status: status || 'draft',
      publishedAt: status === 'published' ? (publishedAt || new Date()) : publishedAt || null,
      authorId: req.user.id,
      categoryId,
    });

    if (tags) await article.setTags(Array.isArray(tags) ? tags : [tags]);

    res.redirect('/admin/articles');
  } catch (err) {
    const categories = await Category.findAll();
    const allTags = await Tag.findAll();
    res.render('admin/form', {
      article: null,
      categories,
      tags: allTags,
      user: req.user,
      error: err.message,
    });
  }
};

exports.showEdit = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, { include: [{ model: Tag }] });
    if (!article) return res.status(404).send('Não encontrado');
    if (req.user.role !== 'editor' && article.authorId !== req.user.id)
      return res.status(403).send('Sem permissão');
    const categories = await Category.findAll();
    const tags = await Tag.findAll();
    res.render('admin/form', { article, categories, tags, user: req.user, error: null });
  } catch (err) {
    res.status(500).send('Erro interno');
  }
};

exports.update = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).send('Não encontrado');
    if (req.user.role !== 'editor' && article.authorId !== req.user.id)
      return res.status(403).send('Sem permissão');

    const { title, subtitle, content, status, publishedAt, categoryId, tags } = req.body;
    const coverImage = req.file ? '/uploads/' + req.file.filename : article.coverImage;

    if (!title) throw new Error('O título é obrigatório.');
    if (!content) throw new Error('O conteúdo é obrigatório.');
    if (status === 'scheduled' && !publishedAt)
      throw new Error('Selecione uma data para o agendamento.');
    if (status === 'scheduled' && new Date(publishedAt) <= new Date())
      throw new Error('A data de agendamento deve ser no futuro.');

    if (title && title !== article.title) {
      let slug = slugify(title, { lower: true, strict: true });
      const exists = await Article.findOne({ where: { slug, id: { [Op.ne]: article.id } } });
      if (exists) slug += '-' + Date.now();
      article.slug = slug;
    }

    article.title = title;
    article.subtitle = subtitle;
    article.content = content;
    article.coverImage = coverImage;
    article.status = status;
    article.publishedAt = status === 'published' && !publishedAt ? new Date() : publishedAt || null;
    article.categoryId = categoryId;
    await article.save();
    if (tags) await article.setTags(Array.isArray(tags) ? tags : [tags]);
    else await article.setTags([]);

    res.redirect('/admin/articles');
  } catch (err) {
    const categories = await Category.findAll();
    const allTags = await Tag.findAll();
    const article = await Article.findByPk(req.params.id, { include: [{ model: Tag }] });
    res.render('admin/form', {
      article,
      categories,
      tags: allTags,
      user: req.user,
      error: err.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).send('Não encontrado');
    if (req.user.role !== 'editor' && article.authorId !== req.user.id)
      return res.status(403).send('Sem permissão');
    await article.destroy();
    res.redirect('/admin/articles');
  } catch (err) {
    res.status(500).send('Erro interno');
  }
};