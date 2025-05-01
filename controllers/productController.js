const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review")
const Order = require('../models/Order')
const User = require('../models/User')
const Variant = require('../models/VariantModel')
const OrderProduct = require('../models/OrderProduct')
const VariantAttribute = require('../models/VariantAttributeModel')
const Cart = require("../models/Cart");
const path = require("path");
const upload = require("../controllers/uploadController");
exports.createProduct = async (req, res) => {
    try {
        const { categoryId, reviewId, name, description, price, imageUrl,  variants, review} = req.body;
        let totalStock = 0;
        // Get file paths from uploaded files
        const imageArray = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        // Validate required fields
        if (!categoryId || !name) {
            return res.status(400).json({ message: "Category ID and Product Name are required" });
        }

        // Check if category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Create product (✅ Review ID is optional)
        const product = await Product.create({
            categoryId,
            reviewId: reviewId || null, 
            name,
            description,
            price,
            imageUrl: imageArray,
            totalStock : 0
        });

        let createdReview = null;
        if (review && review.rating) {
            createdReview = await Review.create({
                productId: product.id,
                rating: review.rating,
                comment: review.comment,
            });
        }

        if (variants && Array.isArray(variants) && variants.length > 0) {
            const createdVariants = [];
            for (const variantData of variants) {
                const { sku, price, stock, attributes } = variantData;

                const existingVariant = await Variant.findOne({ where: { sku } });
                if (existingVariant) {
                    return res.status(400).json({ error: `SKU '${sku}' already exists.` });
                }

                const variant = await Variant.create({
                    productId: product.id,
                    sku,
                    price,
                    stock,
                });
                totalStock += stock;
                if (attributes && Array.isArray(attributes) && attributes.length > 0) {
                    await Promise.all(
                        attributes.map((attribute) =>
                            VariantAttribute.create({
                                variantId: variant.id,
                                name: attribute.name,
                                value: attribute.value,
                            })
                        )
                    );
                    variant.dataValues.attributes = attributes;
                }

                createdVariants.push(variant);
            }
            product.dataValues.variants = createdVariants;
        }
        const updatedProduct = await Product.findByPk(product.id, {
            include: [
                {
                    model: Category,
                    attributes: ['id'],
                },
                {
                    model: Variant,
                    attributes: ['id', 'productId', 'sku', 'price', 'stock'],
                    include: {
                        model: VariantAttribute,
                        attributes: ['name', 'value']
                    }
                },
                {
                    model: Review,
                    attributes: ['id','rating', 'comment'],
                    required: false,
                }
            ],
        });

        await Product.update({ totalStock }, { where: { id: product.id } });

        const reviews = updatedProduct.Reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment
        }));

        const productVariant = updatedProduct.Variants.map(variant => ({
            id: variant.id,
            productId: variant.productId,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            attributes: variant.VariantAttributes.map(attribute => ({ // include Attributes
                name: attribute.name,
                value: attribute.value
            }))
        }));


        const response = {
            product : {
                productId: updatedProduct.productId,
                name: updatedProduct.name,
                description: updatedProduct.description,
                price: updatedProduct.price,
                stock: updatedProduct.stock,
                imageUrl: imageArray,
                categoryId: updatedProduct.categoryId,
                reviews: reviews.length > 0 ? reviews : [],
                variants: productVariant.length > 0 ? productVariant : []
            }
        }
        return res.status(201).json({ message: "Product created successfully", product: response });

    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
// exports.createProduct = async (req, res) => {
//     try {
//
//         const { categoryId, name, description, price, stock, ...productData } = req.body;
//
//         if (!categoryId || !name) {
//             return res.status(400).json({ message: "Category ID and Product Name are required" });
//         }
//
//         const parsedCategoryId = parseInt(categoryId, 10);
//         if (isNaN(parsedCategoryId)) {
//             return res.status(400).json({ message: "Invalid category ID format" });
//         }
//
//         const category = await Category.findByPk(parsedCategoryId);
//         if (!category) return res.status(404).json({ message: "Category not found" });
//
//         let imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;
//
//         const product = await Product.create({
//             categoryId: parsedCategoryId,
//             name,
//             description,
//             price,
//             stock,
//             imageUrl,
//         });
//
//         return res.status(201).json({ message: "Product created successfully", product });
//     } catch (error) {
//         console.error("Error creating product:", error);
//         res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// };
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        return res.status(200).json(products);
    }catch (e) {
        console.error(e);
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
                    model: Variant,
                    attributes: ['id', 'productId', 'sku', 'price', 'stock'],
                    include: { // Include VariantAttribute
                        model: VariantAttribute,
                        attributes: ['name', 'value']
                    }
                },
                {
                    model: Review,
                    attributes: ['id', 'rating', 'comment'], // Include review details you need
                    required: false, // Ensure it doesn't throw an error if no reviews are found
                }
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const reviews = product.Reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment // Assuming 'comment' is the field in your Review model
        }));
        const variants = product.Variants.map(variant => ({
            id: variant.id,
            productId: variant.productId,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            attributes: variant.VariantAttributes.map(attribute => ({ // include Attributes
                name: attribute.name,
                value: attribute.value
            }))
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
                variants: variants.length > 0 ? variants : [],
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
exports.buyProduct = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, variantId, quantity, paymentType } = req.body;  // Include paymentType
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Check if variant exists
    const variant = await Variant.findOne({ where: { id: variantId, productId } });
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    
    // Check stock availability
    if (quantity > variant.stock) {
      return res.status(400).json({ message: `Not enough stock. Available: ${variant.stock}` });
    }
    
    // Calculate total amount
    const totalAmount = (variant.price * quantity).toFixed(2);
    
    // Deduct stock only if the order is successful
    const order = await Order.create({
      userId,
      productId,
      variantId,
      quantity,
      totalAmount,
      paymentType,  // Include paymentType
    });
    
    // Now deduct stock since order is successful
    variant.stock -= quantity;
    await variant.save();
    
    res.json({
      message: "Purchase successful!",
      order: {
        orderId: order.id,
        userId,
        product: {
          id: product.id,
          name: product.name,
          variantId: variant.id,
          quantityPurchased: quantity,
          remainingStock: variant.stock,
        },
        totalAmount,
        paymentType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


