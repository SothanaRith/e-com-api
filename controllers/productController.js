const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review")
const Order = require('../models/Order')
const User = require('../models/User')
const OrderProduct = require('../models/OrderProduct')
const path = require("path");
const upload = require("../controllers/uploadController");
// exports.createProduct = async (req, res) => {
//   try {
//     const { categoryId, reviewId, name, description, price, stock, imageUrl } = req.body;
//
//     // Validate required fields
//     if (!categoryId || !name) {
//       return res.status(400).json({ message: "Category ID and Product Name are required" });
//     }
//
//     // Check if category exists
//     const category = await Category.findByPk(categoryId);
//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }
//
//     // Create product (✅ Review ID is optional)
//     const product = await Product.create({
//       categoryId,
//       reviewId: reviewId || null, // ✅ If no reviewId provided, set to null
//       name,
//       description,
//       price,
//       stock,
//       imageUrl,
//     });
//
//     return res.status(201).json({ message: "Product created successfully", product });
//
//   } catch (error) {
//     console.error("Error creating product:", error);
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };
// 🔹 Create Product with Image Upload
exports.createProduct = async (req, res) => {
    try {
        console.log("Received Body:", req.body); // Debugging
        console.log("Received File:", req.file); // Debugging

        const { categoryId, name, description, price, stock } = req.body;

        if (!categoryId || !name) {
            return res.status(400).json({ message: "Category ID and Product Name are required" });
        }

        const parsedCategoryId = parseInt(categoryId, 10);
        if (isNaN(parsedCategoryId)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }

        const category = await Category.findByPk(parsedCategoryId);
        if (!category) return res.status(404).json({ message: "Category not found" });

        let imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

        const product = await Product.create({
            categoryId: parsedCategoryId,
            name,
            description,
            price,
            stock,
            imageUrl,
        });

        return res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;  // Make sure this matches your route
        const { name, description, price, stock, imageUrl } = req.body;

        // Find the product by ID
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update product details
        await product.update({
            name: name || product.name,
            price: price || product.price,
            stock: stock || product.stock,
            description: description || product.description,
            imageUrl: imageUrl || product.imageUrl
        });

        // Send a response after updating
        return res.status(200).json({ message: "Product updated successfully", product });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


exports.getProductById = async (req, res) =>{
    try {
        const { id } = req.params; // Get id from URL parameters
        console.log(req.params);
        console.log("product id: ",id);
        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    attributes: ['id'], // Only select the category id
                },
                {
                    model: Review,
                    attributes: ['id', 'comment'], // Include review details you need
                    required: false, // Ensure it doesn't throw an error if no reviews are found
                }
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const reviews = product.Reviews.map(review => ({
            id: review.id,
            comment: review.comment // Assuming 'comment' is the field in your Review model
        }));
        // Get categoryId and reviews (empty list if no reviews)
        const response = {
            product: {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                imageUrl: product.imageUrl,
                categoryId: product.categoryId,
                reviews: reviews.length > 0 ? reviews : [], 
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.placeOrder = async (req, res) =>{
    const { userId, items, paymentType } = req.body;
  // Check for missing fields
  if (!userId || !items || !paymentType) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let totalAmount = 0;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate stock and calculate total price
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) return res.status(404).json({ message: `Product ID ${item.productId} not found` });

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Unavailable stock for ${product.name}` });
      }

      totalAmount += product.price * item.quantity;
    }

    // Create the Order
    const order = await Order.create({ userId, totalAmount, paymentType });

    // Deduct stock and create OrderProducts (not OrderItems)
    for (const item of items) {
      const product = await Product.findByPk(item.productId);

      // Deduct stock from product
      await product.update({ stock: product.stock - item.quantity });

      // Create an OrderProduct (NOT OrderItem)
      await OrderProduct.create({
        orderId: order.id,
        productId: item.productId,     // Ensure productId is passed
        quantity: item.quantity,       // Ensure quantity is passed
        price: product.price,          // Store the price in the order product
      });
    }

    return res.status(201).json({
        message: "Order placed successfully",
        orderId: order.id,
        order: [order]
    });

  } catch (error) {
    console.error("Error placing order:", error); // Log detailed error
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
