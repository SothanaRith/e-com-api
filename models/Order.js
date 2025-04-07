// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");
//
// const Order = sequelize.define("Order", {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   userId: { type: DataTypes.INTEGER, allowNull: false },
//   totalAmount: { type: DataTypes.FLOAT, allowNull: false },
//   paymentType: { type: DataTypes.STRING, allowNull: false }, // Make sure it's defined
// });
//
// module.exports = Order;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Product = require("./Product");
const Variant = require("./VariantModel");

const Order = sequelize.define("Order", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  variantId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Variant,
      key: "id",
    },
    onDelete: "SET NULL",
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalAmount: {  // 🛠 Make sure totalAmount exists
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentType: {  // 🛠 Make sure paymentType exists
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Completed",
  },
});

// Associations
Order.belongsTo(User, { foreignKey: "userId" });
Order.belongsTo(Product, { foreignKey: "productId" });
Order.belongsTo(Variant, { foreignKey: "variantId" });

module.exports = Order;
