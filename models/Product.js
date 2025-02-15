const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Review = require("./Review");

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reviewId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Review, key: "id" } },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 7) },
  stock: { type: DataTypes.INTEGER },
  imageUrl: { type: DataTypes.TEXT },
  createAt: { type: DataTypes.DATE },
  updateAt: { type: DataTypes.DATE },
});

Product.belongsTo(Review, { foreignKey: "reviewId" });
module.exports = Product;