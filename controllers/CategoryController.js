const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Create new category
    const category = await Category.create({
      name,
      description,
      imageUrl,
    });

    return res.status(201).json({ message: "Category created successfully", category });

  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll(); // Or .find() if you're using Mongoose

    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
