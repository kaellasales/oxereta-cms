const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Article extends Model {}
  Article.init({
    title:       { type: DataTypes.STRING, allowNull: false },
    slug:        { type: DataTypes.STRING, allowNull: false, unique: true },
    subtitle:    { type: DataTypes.STRING },
    content:     { type: DataTypes.TEXT },
    coverImage:  { type: DataTypes.STRING },
    status:      { type: DataTypes.ENUM('draft', 'scheduled', 'published'), defaultValue: 'draft' },
    publishedAt: { type: DataTypes.DATE },
    views:       { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { sequelize, modelName: 'Article' });
  return Article;
};