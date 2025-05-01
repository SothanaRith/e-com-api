const { Category, Product } = require("../models");
const { successResponse, failResponse } = require("../utils/baseResponse");

exports.loadHome = async (req, res) => {
  try {
    const categories = await Category.findAll();
    
    // Load first 15 products (latest or featured)
    const products = await Product.findAll({
      limit: 3,
      order: [["createdAt", "DESC"]],
    });
    
    return res.status(200).json(successResponse("Home data fetched successfully", {
      categories,
      products,
    }));
  } catch (error) {
    console.error("Error fetching home data:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};
