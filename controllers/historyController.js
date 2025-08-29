const SearchHistory = require("../models/SearchHistory");
const ProductVisitHistory = require("../models/ProductVisitHistory");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Wishlist = require("../models/WishList");
const Cart = require("../models/Cart");
const Variant = require("../models/VariantModel");
const VariantAttribute = require('../models/VariantAttributeModel')
const Review = require("../models/Review");
const User = require("../models/User");

const saveSearchHistory = async (req, res) => {
  const { userId, query } = req.body;

  try {
    // Create a new search history entry
    const searchHistory = await SearchHistory.create({
      userId,
      query,
    });

    res.status(200).json({ success: true, searchHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSearchHistoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Fetch search history for the user
    const searchHistory = await SearchHistory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],  // Order by most recent search first
    });

    if (!searchHistory.length) {
      return res.status(404).json({ success: false, message: "No search history found" });
    }

    return res.status(200).json({ success: true, searchHistory });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductHistoryByUser = async (req, res) => {
  try {
    const rawUserId = req.params.userId ?? req.query.userId ?? null;
    const userId = rawUserId && /^\d+$/.test(String(rawUserId)) ? Number(rawUserId) : null;
    if (!userId) return res.status(400).json({ success: false, message: "Invalid user ID" });

    const history = await ProductVisitHistory.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          include: [
            { model: Category, attributes: { exclude: [] }, required: false },
            {
              model: Variant,
              attributes: { exclude: [] },
              required: false,
              include: [{ model: VariantAttribute, attributes: ['name', 'value'], required: false }],
            },
            {
              model: Review,
              attributes: ['id', 'rating', 'comment', 'userId', 'imageUrl'],
              required: false,
              include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'], required: false }],
            },
            {
              model: Product,
              as: 'RelatedProducts',
              attributes: ['id', 'name', 'price', 'imageUrl', 'totalStock'],
              through: { attributes: [] },
              required: false,
            },
            {
              model: Wishlist,
              as: 'Wishlists',
              where: { userId },
              attributes: ['id'],
              required: false,
            },
            {
              model: Cart,
              as: 'Carts',
              where: { userId },
              attributes: ['quantity'],
              required: false,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform like getProductById — but expose "product" (lowercase) in response
    const transformed = history
      .map(h => {
        if (!h.Product) return null;
        const prod = h.Product.toJSON();

        // normalize fields
        prod.category = prod.Category || null;
        delete prod.Category;

        prod.isInWishlist = !!(prod.Wishlists && prod.Wishlists.length);
        delete prod.Wishlists;

        if (prod.Carts) {
          prod.isInCart = prod.Carts.length > 0;
          prod.cartQuantity = prod.Carts.length > 0 ? prod.Carts[0].quantity : 0;
          delete prod.Carts;
        }

        if (typeof prod.imageUrl === 'string') {
          try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch { prod.imageUrl = []; }
        }

        // return with "product" key; strip original "Product" to avoid duplication
        const base = h.toJSON();
        delete base.Product;

        return { ...base, product: prod };
      })
      .filter(Boolean);

    // 🔑 De-duplicate by product.id, keeping the first (latest) visit
    const seen = new Set();
    const uniqueByProduct = transformed.filter(item => {
      const pid = item.product?.id;
      if (!pid) return false;
      if (seen.has(pid)) return false;
      seen.add(pid);
      return true;
    });

    return res.status(200).json({ success: true, history: uniqueByProduct });
  } catch (error) {
    console.error("Error fetching product history:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const saveProductVisitHistory = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // Create a new product visit history entry
    const visitHistory = await ProductVisitHistory.create({
      userId,
      productId,
    });

    res.status(200).json({ success: true, visitHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveSearchHistory,
  saveProductVisitHistory,
  getProductHistoryByUser,
  getSearchHistoryByUser
};
