const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");

const Review = sequelize.define("Review", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  productId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" } },
  comment: { type: DataTypes.TEXT },
  rating: { type: DataTypes.DECIMAL(10, 7) },
  createAt: { type: DataTypes.DATE },
  updateAt: { type: DataTypes.DATE },
});

Review.belongsTo(User, { foreignKey: "userId" });
Review.belongsTo(Product, { foreignKey: "productId" });
module.exports = Review;
