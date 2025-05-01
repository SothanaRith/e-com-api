// models/RelatedProduct.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RelatedProduct = sequelize.define('RelatedProduct', {
    productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    relatedProductId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
}, {
    timestamps: false,
    tableName: 'RelatedProducts' // 👈 Important!
});

module.exports = RelatedProduct;
