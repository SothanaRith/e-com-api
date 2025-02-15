const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./Product");
const User = require("./User");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  productId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" } },
  quantity: { type: DataTypes.INTEGER, allowNull: false,},
  totalPrice: { type: DataTypes.DECIMAL(10, 7) },
  paymentType: { type: DataTypes.ENUM("aba", "ac", "offline"), allowNull: false },
  status: { type: DataTypes.DECIMAL(10, 7) },
  createAt: { type: DataTypes.DATE },
  updateAt: { type: DataTypes.DATE },
});

Order.belongsTo(User, { foreignKey: "userId" });
Order.belongsTo(Product, { foreignKey: "productId" });
module.exports = Order;