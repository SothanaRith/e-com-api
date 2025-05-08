const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");
const Review = require("./Review");
const Variant = require("./VariantModel");
const RelatedProduct = require("./RelatedProduct");

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Category, key: "id" }
  },
  reviewId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 2) },
  totalStock: { type: DataTypes.INTEGER },
  imageUrl: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  timestamps: true,
});

// Relationships
Product.belongsTo(Category, {
  foreignKey: "categoryId",
  onDelete: "CASCADE"
});

Product.hasMany(Review, {
  foreignKey: "productId",
  onDelete: "CASCADE"
});

Product.hasMany(Variant, {
  foreignKey: "productId",
  onDelete: "CASCADE"
});

Product.belongsToMany(Product, {
  as: 'RelatedProducts',
  through: RelatedProduct,
  foreignKey: 'productId',
  otherKey: 'relatedProductId'
});

module.exports = Product;
