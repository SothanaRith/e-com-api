// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");
// const Category = require("./Category");
// Review = require("./Review"); // ✅ Import Review model
//
// const Product = sequelize.define("Product", {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   categoryId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: { model: "Categories", key: "id" }
//   },
//   reviewId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: { model: "Reviews", key: "id" },
//   },
//   name: { type: DataTypes.STRING, allowNull: false },
//   description: { type: DataTypes.STRING },
//   price: { type: DataTypes.DECIMAL(10, 2) },
//   totalStock: { type: DataTypes.INTEGER },
//   imageUrl: { type: DataTypes.TEXT },
// }, {
//   timestamps: true,
// });
// // Product.hasMany(Review, { foreignKey: "productId", onDelete: "CASCADE" });
// // // ✅ Define relationships correctly
// // Product.belongsTo(Category, { foreignKey: "categoryId", onDelete: "CASCADE" });
//
//
// module.exports = Product;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");

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
    type: DataTypes.JSON, // Store images as an array of URLs in JSON format
    allowNull: true,
    defaultValue: [] // Default is an empty array
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  timestamps: true,
});

// Product.belongsTo(Category, { foreignKey: "categoryId", onDelete: "CASCADE" });

module.exports = Product;