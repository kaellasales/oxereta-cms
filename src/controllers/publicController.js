const { Article, Category, Tag, User } = require('../models');
const { Op } = require('sequelize');

exports.home = async (req, res) => {
  try {
    const { search, category, tag, order, page = 1, dateFrom, dateTo } = req.query;
    const limit = 10;
    const where = { status: 'published' };

    if (search) where.title = { [Op.iLike]: `%${search}%` };
    if (category) where.categoryId = category;
    if (dateFrom || dateTo) {
      where.publishedAt = {};
      if (dateFrom) where.publishedAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.publishedAt[Op.lte] = new Date(dateTo);
    }

    const includeTag = tag
      ? { model: Tag, where: { id: tag }, required: true }
      : { model: Tag };

    const orderBy = order === 'views' ? [['views', 'DESC']] : [['publishedAt', 'DESC']];

    const { rows: articles, count } = await Article.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author' },
        { model: Category },
        includeTag,
      ],
      order: orderBy,
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    const categories = await Category.findAll();
    const tags = await Tag.findAll();
    const featured = await Article.findAll({
      where: { status: 'published' },
      include: [{ model: Category }],
      order: [['views', 'DESC']],
      limit: 4,
    });

    res.render('home', {
      articles, search, page: Number(page),
      totalPages: Math.ceil(count / limit),
      totalCount: count, categories, tags, featured,
      selectedCategory: category, selectedTag: tag,
      order, dateFrom, dateTo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno');
  }
};

exports.articleDetail = async (req, res) => {
  try {
    const article = await Article.findOne({
      where: { slug: req.params.slug, status: 'published' },
      include: [
        { model: User, as: 'author' },
        { model: Category },
        { model: Tag },
      ],
    });
    if (!article) return res.status(404).send('Artigo não encontrado');

    setImmediate(() => article.increment('views'));

    const categories = await Category.findAll(); // <- adicionado

    const featured = await Article.findAll({
      where: { status: 'published' },
      include: [{ model: Category }],
      order: [['views', 'DESC']],
      limit: 4,
    });

    res.render('article', { article, featured, categories }); // <- categories passado
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno');
  }
};