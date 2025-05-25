const { Category, Product, Wishlist, Cart } = require("../models");
const { successResponse, failResponse } = require("../utils/baseResponse");

exports.loadHome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;
    const limit = size;
    const { userId } = req.query; // expect userId as query param

    const categories = await Category.findAll();

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

    return res.status(200).json(successResponse("Home data fetched successfully", {
      categories,
      products: processedProducts,
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
