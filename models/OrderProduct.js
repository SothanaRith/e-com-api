const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./Order");
const Product = require("./Product");

const OrderProduct = sequelize.define("OrderProduct", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false }, 
  quantity: { type: DataTypes.INTEGER, allowNull: false }, 
  price: { type: DataTypes.FLOAT, allowNull: false },
});

OrderProduct.belongsTo(Order, { foreignKey: "orderId" });
OrderProduct.belongsTo(Product, { foreignKey: "productId" });

module.exports = OrderProduct;
