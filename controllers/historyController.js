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
    // userId from params or query
    const rawUserId = req.params.userId ?? req.query.userId ?? null;
    const userId = rawUserId && /^\d+$/.test(String(rawUserId)) ? Number(rawUserId) : null;

    if (!userId) return res.status(400).json({ success: false, message: "Invalid user ID" });

    // Fetch all product visit history for the user
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
            }
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform data like getProductById
    const result = history.map(h => {
      if (!h.Product) return null;
      const prod = h.Product.toJSON();

      // Category
      prod.category = prod.Category || null;
      delete prod.Category;

      // Wishlist flag
      prod.isInWishlist = prod.Wishlists?.length > 0;
      delete prod.Wishlists;

      // Cart info
      if (prod.Carts) {
        prod.isInCart = prod.Carts.length > 0;
        prod.cartQuantity = prod.Carts.length > 0 ? prod.Carts[0].quantity : 0;
        delete prod.Carts;
      }

      // Parse imageUrl if string
      if (typeof prod.imageUrl === 'string') {
        try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch { prod.imageUrl = []; }
      }

      return { ...h.toJSON(), Product: prod };
    }).filter(Boolean);

    return res.status(200).json({ success: true, history: result });
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
