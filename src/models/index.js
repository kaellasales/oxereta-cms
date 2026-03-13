const isTest = process.env.NODE_ENV === 'test';
const sequelize = isTest
  ? require('../config/db.test')
  : require('../config/db');

const User     = require('./User')(sequelize);
const Article  = require('./Article')(sequelize);
const Category = require('./Category')(sequelize);
const Tag      = require('./Tag')(sequelize);

const ArticleTag = sequelize.define('ArticleTag', {}, { timestamps: false });

Article.belongsTo(User,     { as: 'author', foreignKey: 'authorId' });
Article.belongsTo(Category, { foreignKey: 'categoryId' });
Article.belongsToMany(Tag,  { through: ArticleTag });
Tag.belongsToMany(Article,  { through: ArticleTag });

module.exports = { sequelize, User, Article, Category, Tag };