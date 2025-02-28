const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Category = sequelize.define("Category", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  imageUrl: { type: DataTypes.TEXT },
} ,{
  timestamps: true, 
});

module.exports = Category;