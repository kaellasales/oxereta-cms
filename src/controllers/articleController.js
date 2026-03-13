const { Article, Category, Tag, User } = require('../models');
const slugify = require('slugify');
const { Op } = require('sequelize');

// API: listar artigos publicados
exports.listPublished = async (req, res) => {
  try {
    const { search, category, tag, page = 1, order } = req.query;
    const limit = 10;
    const where = { status: 'published' };
    if (search) where.title = { [Op.iLike]: `%${search}%` };
    if (category) where.categoryId = category;

    const include = [
      { model: User, as: 'author', attributes: ['id', 'name'] },
      { model: Category },
      { model: Tag },
    ];
    if (tag) include[2] = { model: Tag, where: { id: tag } };

    const orderBy = order === 'views' ? [['views', 'DESC']] : [['publishedAt', 'DESC']];

    const { rows, count } = await Article.findAndCountAll({
      where, include, order: orderBy, limit,
      offset: (page - 1) * limit,
    });

    res.json({ articles: rows, total: count, page: Number(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API: listar todos (incluindo rascunhos) — apenas editor
exports.listAll = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }, { model: Category }],
      order: [['createdAt', 'DESC']],
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API: buscar um artigo por ID
exports.getOne = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }, { model: Category }, { model: Tag }],
    });
    if (!article) return res.status(404).json({ error: 'Não encontrado' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API: criar artigo
exports.create = async (req, res) => {
  try {
    const { title, subtitle, content, coverImage, status, publishedAt, categoryId, tags } = req.body;

    let slug = slugify(title, { lower: true, strict: true });
    const exists = await Article.findOne({ where: { slug } });
    if (exists) slug += '-' + Date.now();

    const article = await Article.create({
      title, slug, subtitle, content, coverImage,
      status: status || 'draft',
      publishedAt: status === 'published' ? (publishedAt || new Date()) : publishedAt,
      authorId: req.user.id,
      categoryId,
    });

    if (tags && tags.length > 0) await article.setTags(tags);

    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// API: atualizar artigo
exports.update = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: 'Não encontrado' });

    // Jornalista só edita o próprio
    if (req.user.role !== 'editor' && article.authorId !== req.user.id)
      return res.status(403).json({ error: 'Sem permissão' });

    const { title, subtitle, content, coverImage, status, publishedAt, categoryId, tags } = req.body;

    if (title && title !== article.title) {
      let slug = slugify(title, { lower: true, strict: true });
      const exists = await Article.findOne({ where: { slug, id: { [Op.ne]: article.id } } });
      if (exists) slug += '-' + Date.now();
      article.slug = slug;
    }

    if (title) article.title = title;
    if (subtitle !== undefined) article.subtitle = subtitle;
    if (content !== undefined) article.content = content;
    if (coverImage !== undefined) article.coverImage = coverImage;
    if (status) article.status = status;
    if (publishedAt) article.publishedAt = publishedAt;
    if (categoryId) article.categoryId = categoryId;

    await article.save();
    if (tags) await article.setTags(tags);

    res.json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// API: remover artigo
exports.remove = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: 'Não encontrado' });

    if (req.user.role !== 'editor' && article.authorId !== req.user.id)
      return res.status(403).json({ error: 'Sem permissão' });

    await article.destroy();
    res.json({ message: 'Artigo removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};