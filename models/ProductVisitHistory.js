const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");  // Assuming you have a User model
const Product = require("./Product");

const ProductVisitHistory = sequelize.define("ProductVisitHistory", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Product, key: "id" },
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
});

ProductVisitHistory.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

ProductVisitHistory.belongsTo(Product, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});

module.exports = ProductVisitHistory;
