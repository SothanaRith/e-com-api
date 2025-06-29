
const {successResponse, failResponse} = require("../utils/baseResponse");
const error = require("multer/lib/multer-error");
const { Category, Product, Review, Variant , VariantAttribute, Cart, Wishlist} = require('../models');
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    let imageUrl = '';

    if (process.env.NODE_ENV === 'development') {
      imageUrl = req.file
          ? `/uploads/${req.file.filename}`
          : null;
    } else {
      console.log(req.file)
      imageUrl = req.file.location;
    }
    
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

exports.getCategoryById = async (req, res) => {
  try {
    const {id} = req.params;
    const category = await Category.findByPk(id); // Or .find() if you're using Mongoose

    return res.status(200).json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.updateCategory = async (req, res) => {
  try {
    const {id} = req.params;
    const { name, description } = req.body;
    const category = await Category.findByPk(id)

    let imageUrl = '';

    if (process.env.NODE_ENV === 'development') {
      imageUrl = req.file
          ? `/uploads/${req.file.filename}`
          : null;
    } else {
      imageUrl = req.file.location;
    }

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    } else {
      await category.update({
        name: name ?? category.name,
        description: description ?? category.description,
        imageUrl: imageUrl ?? category.imageUrl,
      });

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

exports.getProductByCategory = async (req, res) => {
  try {
    const { categoryId, userId } = req.params;
    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json(failResponse("Invalid category ID"));
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json(failResponse("Category not found"));
    }

    // Fetch all products in the category
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
          as: 'RelatedProducts',
          attributes: ['id', 'name', 'imageUrl', 'totalStock'],
          through: { attributes: [] }
        },
        ...(userId ? [{
          model: Cart,
          where: { userId },
          required: false,
          attributes: ['quantity']
        }] : [])
      ]
    });

    // Fetch user's wishlist if userId is provided
    let wishlistItems = [];
    if (userId) {
      wishlistItems = await Wishlist.findAll({
        where: { userId },
        attributes: ['productId'] // Get only the productId from the wishlist
      });
      wishlistItems = wishlistItems.map(item => item.productId); // Extract the productId array
    }

    // Process the products to include cart and wishlist information
    const processedProducts = products.map(product => {
      const prod = product.toJSON();

      // Flatten category
      prod.categoryId = prod.Category?.id || null;
      delete prod.Category;

      // Parse imageUrl if needed
      if (typeof prod.imageUrl === 'string') {
        try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
      }

      // Cart flags
      if (userId) {
        if (prod.Carts && prod.Carts.length > 0) {
          prod.isInCart = true;
          prod.cartQuantity = prod.Carts[0].quantity;
        } else {
          prod.isInCart = false;
          prod.cartQuantity = 0;
        }
        delete prod.Carts;
      }

      // Wishlist flag
      prod.isInWishlist = userId ? wishlistItems.includes(prod.id) : false;

      return prod;
    });

    return res.status(200).json(successResponse("Products fetched successfully", processedProducts));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};
