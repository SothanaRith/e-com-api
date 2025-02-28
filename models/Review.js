const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product"); 

const Review = sequelize.define("Review", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { 
    type: DataTypes.INTEGER, 
    allowNull: true, 
    references: { model: "Products", key: "id" }
  },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT },
}, {
  timestamps: true,
});


module.exports = Review;
