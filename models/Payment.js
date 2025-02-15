const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./Product");
const User = require("./User");
const Order = require("./Order");

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  orderId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Order, key: "id" } },
  quantity: { type: DataTypes.INTEGER, allowNull: false,},
  totalPrice: { type: DataTypes.DECIMAL(10, 7) },
  paymentType: { type: DataTypes.ENUM("aba", "ac", "offline"), allowNull: false },
  status: { type: DataTypes.DECIMAL(10, 7) },
  createAt: { type: DataTypes.DATE },
  updateAt: { type: DataTypes.DATE },
});

Payment.belongsTo(User, { foreignKey: "userId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });
module.exports = Payment;