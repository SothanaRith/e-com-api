const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./Order");

const OrderTracking = sequelize.define("OrderTracking", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Orders", key: "id" },
    onDelete: "CASCADE"
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "OrderTracking",
  timestamps: false
});

// Association (if you want)
Order.hasMany(OrderTracking, { foreignKey: "orderId", as: "trackingSteps" });
OrderTracking.belongsTo(Order, { foreignKey: "orderId", as: "order" });

module.exports = OrderTracking;
