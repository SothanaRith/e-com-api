const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./Order");
const Product = require("./Product");
const Variant = require("./VariantModel");

const OrderProduct = sequelize.define("OrderProduct", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Order, key: "id" },
    onDelete: "CASCADE",
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Product, key: "id" },
  },
  variantId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Variant, key: "id" },
    onDelete: "SET NULL",
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {  // price per unit at purchase time
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: "OrderProducts",
  timestamps: false,
});

OrderProduct.belongsTo(Order, { foreignKey: "orderId" });
OrderProduct.belongsTo(Product, { foreignKey: "productId" });
OrderProduct.belongsTo(Variant, { foreignKey: "variantId" });

module.exports = OrderProduct;
