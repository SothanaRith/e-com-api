
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
    const { categoryId } = req.params;

    // accept userId from params OR query; optional
    const rawUserId = req.params.userId ?? req.query.userId ?? null;
    const userId = rawUserId && /^\d+$/.test(String(rawUserId)) ? Number(rawUserId) : null;

    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json(failResponse("Invalid category ID"));
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json(failResponse("Category not found"));
    }

    // Build conditional includes
    const userIncludes = userId
        ? [{
          model: Cart,
          as: 'Carts',            // ensure this matches your association alias
          where: { userId },
          required: false,
          attributes: ['quantity'],
        }]
        : [];

    // Fetch products in the category
    const products = await Product.findAll({
      where: { categoryId },
      include: [
        {                         // you referenced Category later; include it
          model: Category,
          attributes: { exclude: [] },
          required: false,
        },
        {
          model: Variant,
          required: false,
          include: [{
            model: VariantAttribute,
            attributes: ['name', 'value'],
            required: false,
          }],
        },
        {
          model: Review,
          attributes: ['id', 'rating', 'comment'],
          required: false,
        },
        {
          model: Product,
          as: 'RelatedProducts',
          attributes: ['id', 'name', 'imageUrl', 'totalStock'],
          through: { attributes: [] },
          required: false,
        },
        ...userIncludes,
      ],
      order: [['createdAt', 'DESC']],
    });

    // If we have a user, prefetch their wishlist productIds
    let wishlistProductIds = [];
    if (userId) {
      const wl = await Wishlist.findAll({
        where: { userId },
        attributes: ['productId'],
        raw: true,
      });
      wishlistProductIds = wl.map(w => w.productId);
    }

    // Shape output
    const processed = products.map(p => {
      const prod = p.toJSON();

      // Parse imageUrl if it is a JSON string
      if (typeof prod.imageUrl === 'string') {
        try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
      }

      // Category flatten
      prod.categoryId = prod.Category?.id ?? null;
      prod.category = prod.Category ?? null; // keep full category if you like
      delete prod.Category;

      // Cart flags (only if userId provided)
      if (userId) {
        const hasCart = Array.isArray(prod.Carts) && prod.Carts.length > 0;
        prod.isInCart = hasCart;
        prod.cartQuantity = hasCart ? prod.Carts[0].quantity : 0;
        delete prod.Carts;
      }

      // Wishlist flag
      prod.isInWishlist = userId ? wishlistProductIds.includes(prod.id) : false;

      return prod;
    });

    return res
        .status(200)
        .json(successResponse("Products fetched successfully", processed));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};
