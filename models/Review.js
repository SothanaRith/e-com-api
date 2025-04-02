// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");
// // const {Product} = require("./index");
// Product = require("./Product");
//
// const Review = sequelize.define("Review", {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   productId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: { model: "Products", key: "id" }
//   },
//   rating: { type: DataTypes.INTEGER, allowNull: false },
//   comment: { type: DataTypes.TEXT },
// }, {
//   timestamps: true,
// });
//   // Review.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });
// // Review.associate = (models) => {
// //   Review.belongsTo(models, { foreignKey: "productId", as: "product", onDelete: "CASCADE" });
// // };
//
// module.exports = Review;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Review = sequelize.define("Review", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT },
}, {
  timestamps: true,
});

module.exports = Review;