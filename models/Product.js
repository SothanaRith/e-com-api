const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 7) },
  stock: { type: DataTypes.INTEGER },
  imageUrl: { type: DataTypes.TEXT },
  createAt: { type: DataTypes.DATE },
  updateAt: { type: DataTypes.DATE },
});

module.exports = Product;