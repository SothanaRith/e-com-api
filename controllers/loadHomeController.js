const { Category, Product, Wishlist, Cart, Slide,Poster } = require("../models");
const { successResponse, failResponse } = require("../utils/baseResponse");
const Notification = require('../models/Notification');

exports.loadHome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;
    const limit = size;
    const { userId } = req.query;

    // --- Categories ---
    const categories = await Category.findAll();

    // --- Products ---
    const products = await Product.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Category, attributes: { exclude: [] } },
        ...(userId ? [{
          model: Wishlist,
          as: 'Wishlists',
          attributes: ['id'],
          where: { userId },
          required: false
        }] : []),
        ...(userId ? [{
          model: Cart,
          as: 'Carts',
          attributes: ['quantity'],
          where: { userId },
          required: false
        }] : [])
      ]
    });

    const processedProducts = products.map(p => {
      const prod = p.toJSON();

      // Parse imageUrl
      if (typeof prod.imageUrl === 'string') {
        try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
      }

      // Wishlist
      prod.isInWishlist = userId ? (prod.Wishlists?.length > 0) : false;
      delete prod.Wishlists;

      // Category
      prod.category = prod.Category || null;

      // Cart
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

      return prod;
    });

    // --- Notifications ---
    const unreadNotificationsCount = userId
        ? await Notification.count({
          where: { userId, status: 'unread' }
        })
        : 0;

    // --- Latest Products ---
    const latestProductsRaw = await Product.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Category, attributes: { exclude: [] } },
        ...(userId ? [{
          model: Wishlist,
          as: 'Wishlists',
          attributes: ['id'],
          where: { userId },
          required: false
        }] : []),
        ...(userId ? [{
          model: Cart,
          as: 'Carts',
          attributes: ['quantity'],
          where: { userId },
          required: false
        }] : [])
      ]
    });

    const latestProducts = latestProductsRaw.map(p => {
      const prod = p.toJSON();

      if (typeof prod.imageUrl === 'string') {
        try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
      }

      prod.isInWishlist = userId ? (prod.Wishlists?.length > 0) : false;
      delete prod.Wishlists;

      prod.category = prod.Category || null;

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

      return prod;
    });

    // --- Slides ---
    const slides = await Slide.findAll({
      where: { isActive: true },
      order: [["order", "ASC"]]
    });

    return res.status(200).json(successResponse("Home data fetched successfully", {
      categories,
      products: processedProducts,
      unreadNotificationsCount,
      slides,
      latestProducts,
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

exports.getAllSlides = async (req, res) => {
    try {
      const { activeOnly } = req.query

      const whereCondition = activeOnly === 'true' ? { isActive: true } : {}

      const slides = await Slide.findAll({
        where: whereCondition,
        order: [["order", "ASC"]],
      })

      return res.status(200).json(successResponse("Slides fetched successfully", slides))
    } catch (error) {
      console.error("Error fetching slides:", error)
      
      return res.status(500).json(failResponse("Internal server error", error.message))
    }
  }

// Create Slide
exports.createSlide = async (req, res) => {
  try {
    const { title, description, imageUrl, isActive, order } = req.body;

    // Create slide
    const slide = await Slide.create({
      title,
      description,
      imageUrl,
      isActive,
      order,
    });

    return res.status(201).json(successResponse("Slide created successfully", slide));
  } catch (error) {
    console.error("Error creating slide:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};

// Update Slide
exports.updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, isActive, order } = req.body;

    // Find the slide by ID
    const slide = await Slide.findByPk(id);

    if (!slide) {
      return res.status(404).json(failResponse("Slide not found"));
    }

    // Update slide fields
    slide.title = title || slide.title;
    slide.description = description || slide.description;
    slide.imageUrl = imageUrl || slide.imageUrl;
    slide.isActive = isActive !== undefined ? isActive : slide.isActive;
    slide.order = order || slide.order;

    // Save updated slide
    await slide.save();

    return res.status(200).json(successResponse("Slide updated successfully", slide));
  } catch (error) {
    console.error("Error updating slide:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};

// Delete Slide
exports.deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the slide by ID
    const slide = await Slide.findByPk(id);

    if (!slide) {
      return res.status(404).json(failResponse("Slide not found"));
    }

    // Delete the slide
    await slide.destroy();

    return res.status(200).json(successResponse("Slide deleted successfully"));
  } catch (error) {
    console.error("Error deleting slide:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};

exports.createPoster = async (req, res) => {
  try {
    const { title, description, isActive, order } = req.body;

    let imageUrl = '';

    // Check environment and set imageUrl based on environment
    if (process.env.NODE_ENV === 'development') {
      // In development, use local file storage
      imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    } else {
      // In production, use cloud storage (e.g., AWS S3 or similar)
      imageUrl = req.file?.location || null;
    }

    // Create poster entry in the database
    const poster = await Poster.create({
      title,
      description,
      imageUrl,
      isActive,
      order,
    });

    return res.status(201).json(successResponse("Poster created successfully", poster));
  } catch (error) {
    console.error("Error creating poster:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};

// Update Poster (PUT)
exports.updatePoster = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isActive, order } = req.body;

    let imageUrl = '';

    // Check environment and set imageUrl based on environment
    if (process.env.NODE_ENV === 'development') {
      // In development, use local file storage
      imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    } else {
      // In production, use cloud storage (e.g., AWS S3 or similar)
      imageUrl = req.file?.location || null;
    }

    // Find the poster by ID
    const poster = await Poster.findByPk(id);

    if (!poster) {
      return res.status(404).json(failResponse("Poster not found"));
    }

    // Update poster fields (only fields provided will be updated)
    poster.title = title || poster.title;
    poster.description = description || poster.description;
    poster.imageUrl = imageUrl || poster.imageUrl;
    poster.isActive = isActive !== undefined ? isActive : poster.isActive;
    poster.order = order || poster.order;

    // Save updated poster
    await poster.save();

    return res.status(200).json(successResponse("Poster updated successfully", poster));
  } catch (error) {
    console.error("Error updating poster:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};

// Delete Poster (DELETE)
exports.deletePoster = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the poster by ID
    const poster = await Poster.findByPk(id);

    if (!poster) {
      return res.status(404).json(failResponse("Poster not found"));
    }

    // Delete the poster
    await poster.destroy();

    return res.status(200).json(successResponse("Poster deleted successfully"));
  } catch (error) {
    console.error("Error deleting poster:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};

// Get All Posters (GET)
exports.getAllPosters = async (req, res) => {
  try {
    const { activeOnly } = req.query;

    const whereCondition = activeOnly === 'true' ? { isActive: true } : {};

    const posters = await Poster.findAll({
      where: whereCondition,
      order: [["order", "ASC"]],
    });

    return res.status(200).json(successResponse("Posters fetched successfully", posters));
  } catch (error) {
    console.error("Error fetching posters:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};

exports.getPosterById = async (req, res) => {
  try {
    const { id } = req.params;

    const poster = await Poster.findByPk(id);

    if (!poster) {
      return res.status(404).json(failResponse("Poster not found"));
    }

    return res.status(200).json(successResponse("Poster fetched successfully", poster));
  } catch (error) {
    console.error("Error fetching poster:", error);
    return res.status(500).json(failResponse("Internal server error", error.message));
  }
};
