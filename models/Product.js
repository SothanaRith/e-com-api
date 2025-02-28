const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");
const Review = require("./Review"); // ✅ Import Review model

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  categoryId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { model: "Categories", key: "id" }
  },
  reviewId: {  // ✅ Add reviewId to link with Review model
    type: DataTypes.INTEGER,
    allowNull: true, // ✅ Allow NULL because reviews come after product creation
    references: { model: "Reviews", key: "id" },
  },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 2) },
  stock: { type: DataTypes.INTEGER },
  imageUrl: { type: DataTypes.TEXT },
}, {
  timestamps: true,
});

// ✅ Define relationships correctly
Product.belongsTo(Category, { foreignKey: "categoryId", onDelete: "CASCADE" });
// Product.hasMany(Review, { foreignKey: "productId", onDelete: "CASCADE" });

module.exports = Product;
