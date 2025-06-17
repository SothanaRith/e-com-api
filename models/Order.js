const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const DeliveryAddress = require("./DeliveryAddress");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" },
    onDelete: "CASCADE",
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in progress', 'delivery', 'delivered', 'cancelled', 'completed'),
    defaultValue: "pending",
  },
  billingNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deliveryAddressId: { // Foreign Key to DeliveryAddress
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: 'SET NULL',  // If the address is deleted, set this field to null
    },
}, {
  tableName: "Orders",
  timestamps: true,
});

Order.belongsTo(DeliveryAddress, { foreignKey: 'deliveryAddressId', as: 'address' });
Order.belongsTo(User, { foreignKey: "userId" });

module.exports = Order;
