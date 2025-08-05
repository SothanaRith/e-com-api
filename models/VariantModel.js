// models/variant.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product"); // Assuming Product model is in Product.js

const Variant = sequelize.define("Variant", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Products", key: "id" },
    },
    discountType: {
        type: DataTypes.ENUM('fixed', 'percent'), // 'fixed' = $ amount, 'percent' = percentage
        defaultValue: null,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    discountValue: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    isPromotion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    title: { type: DataTypes.STRING },
    sku: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    imageUrl: { type: DataTypes.TEXT },
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['productId', 'sku'],  // Composite unique index
        }
    ],
});



module.exports = Variant;