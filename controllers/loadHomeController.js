const { Category, Product, Wishlist, Cart, Slide } = require("../models");
const { successResponse, failResponse } = require("../utils/baseResponse");
const Notification = require('../models/Notification');

exports.loadHome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;
    const limit = size;
    const { userId } = req.query;

    // Fetch categories
    const categories = await Category.findAll();

    // Fetch products, with conditional inclusion of Wishlist and Cart for user
    const products = await Product.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        ...(userId ? [{
          model: Wishlist,
          as: 'Wishlists',
          attributes: ['id'],
          where: { userId },
          required: false
        }] : []),
        ...(userId ? [{
          model: Cart,
          where: { userId },
          attributes: ['quantity'],
          required: false
        }] : [])
      ]
    });

    // Process products to add necessary fields like 'isInWishlist' and 'isInCart'
    const processedProducts = products.map(product => {
      const prod = product.toJSON();

      // Parse imageUrl
      if (typeof prod.imageUrl === 'string') {
        try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
      }

      // Set isInWishlist
      prod.isInWishlist = userId ? prod.Wishlists?.length > 0 : false;
      delete prod.Wishlists;

      // Set cart info
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

        // Fetch the total unread notifications for the user
    let unreadNotificationsCount = 0;
    if (userId) {
      unreadNotificationsCount = await Notification.count({
        where: {
          userId,
          status: 'unread', // Assuming the status of unread notifications is stored as 'unread'
        }
      });
    }

    // Fetch active slides
    const slides = await Slide.findAll({ where: { isActive: true }, order: [["order", "ASC"]] });

    // Return categories, products, and slides in the response
    return res.status(200).json(successResponse("Home data fetched successfully", {
      categories,
      products: processedProducts,
      unreadNotificationsCount,
      slides, // Include slides in the response
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