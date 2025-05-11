const { Category, Product } = require("../models");
const { successResponse, failResponse } = require("../utils/baseResponse");

exports.loadHome = async (req, res) => {
  try {
    // Extract page and size from query parameters, with default values
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    
    // Calculate offset
    const offset = (page - 1) * size;
    const limit = size;
    
    // Fetch categories
    const categories = await Category.findAll();
    
    // Fetch products with pagination
    const products = await Product.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    
    return res.status(200).json(successResponse("Home data fetched successfully", {
      categories,
      products,
      pagination: {
        currentPage: page,
        pageSize: size,
      },
    }));
  } catch (error) {
    console.error("Error fetching home data:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};
