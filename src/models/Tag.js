const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Tag extends Model {}
  Tag.init({
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, { sequelize, modelName: 'Tag' });
  return Tag;
};