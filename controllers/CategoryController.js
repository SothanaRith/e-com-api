
const {successResponse, failResponse} = require("../utils/baseResponse");
const error = require("multer/lib/multer-error");
const { Category, Product, Review, Variant , VariantAttribute} = require('../models');
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    
    // Construct public image URL if file uploaded
    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;
    
    // Create new category
    const category = await Category.create({
      name,
      description,
      imageUrl,
    });
    
    return res.status(201).json({
      message: "Category created successfully",
      category, // this will now include imageUrl like http://localhost:6000/uploads/xxxxx.png
    });
    
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
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
exports.updateCategory = async (req, res) => {
  try {
    const {id} = req.params;
    const { name, description, imageUrl } = req.body;
    const category = await Category.findOne(id)
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }else {
        // Update category fields if they exist in the request
      if (name) category.name = name;
      if (description) category.description = description;
      if (imageUrl) category.imageUrl = imageUrl;
      // Save the updated category
      await category.save();
      return res.status(200).json({
        message: "Category updated successfully",
        category,
      });
    }
    
  }catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Find category by ID
    const category = await Category.findByPk(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Optionally: remove the image file from uploads directory if needed
    // using fs module
    // if (category.imageUrl) {
    //   const fs = require("fs");
    //   const imagePath = path.join(__dirname, "..", "uploads", path.basename(category.imageUrl));
    //   fs.unlinkSync(imagePath);
    // }
    
    // Delete the category
    await category.destroy();
    
    return res.status(200).json({
      message: "Category deleted successfully",
    });
    
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getProductByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    console.log("Received categoryId:", categoryId);
    
    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json(failResponse("Invalid category ID"));
    }
    
    const category = await Category.findByPk(categoryId);
    
    if (!category) {
      return res.status(404).json(failResponse("Category not found"));
    }
    
    const products = await Product.findAll({
      where: { categoryId },
      include: [
        {
          model: Variant,
          include: {
            model: VariantAttribute,
            attributes: ['name', 'value']
          }
        },
        {
          model: Review,
          attributes: ['id', 'rating', 'comment'],
          required: false
        },
        {
          model: Product,
          as: 'RelatedProducts', // ensure this alias matches your belongsToMany association
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    
    return res.status(200).json(successResponse("Products fetched successfully", products));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};



