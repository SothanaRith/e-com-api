
const Category = require("../models/Category");
const Review = require("../models/Review")
const Order = require('../models/Order')
const User = require('../models/User')
const Variant = require('../models/VariantModel')
const OrderProduct = require('../models/OrderProduct')
const VariantAttribute = require('../models/VariantAttributeModel')
const RelatedProduct = require('../models/RelatedProduct')
const Cart = require("../models/Cart");
const path = require("path");
const upload = require("../controllers/uploadController");
const { Wishlist, Product } = require('../models');
const { Op, fn, col, where: sequelizeWhere } = require('sequelize');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt, generateTokens } = require('../utils/crypto');

const JWT_SECRET = process.env.JWT_SECRET;

exports.createProduct = async (req, res) => {
    try {
        const {
            categoryId,
            review,
            name,
            description,
            price,
            variants,
            relatedProductIds,
        } = req.body;
        let totalStock = 0;
        
        const imageArray = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        
        if (!categoryId || !name) {
            return res.status(400).json({ message: "Category ID and Product Name are required" });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const product = await Product.create({
            categoryId,
            name,
            description,
            price,
            imageUrl: imageArray,
            totalStock: 0,
        });

        if (review && review.rating && review.userId) {
            const user = await User.findByPk(review.userId);
            if (user) {
                await Review.create({
                    productId: product.id,
                    userId: user.id,
                    rating: review.rating,
                    comment: review.comment,
                });
            }
        }

        if (variants && Array.isArray(variants)) {
            for (const variantData of variants) {
                const { sku, price, stock, attributes } = variantData;
                if (await Variant.findOne({ where: { sku } })) {
                    return res.status(400).json({ error: `SKU '${sku}' already exists.` });
                }

                const variant = await Variant.create({ productId: product.id, sku, price, stock });
                totalStock += stock;

                if (attributes && Array.isArray(attributes)) {
                    await Promise.all(attributes.map(attr =>
                        VariantAttribute.create({
                            variantId: variant.id,
                            name: attr.name,
                            value: attr.value,
                        })
                    ));
                }
            }
        }

        await Product.update({ totalStock }, { where: { id: product.id } });

        if (relatedProductIds && Array.isArray(relatedProductIds)) {
            for (const relatedId of relatedProductIds) {
                const exists = await Product.findByPk(relatedId);
                if (exists) {
                    await RelatedProduct.create({
                        productId: product.id,
                        relatedProductId: relatedId
                    });
                }
            }
        }
        
        const updatedProduct = await Product.findByPk(product.id, {
            include: [
                { model: Category, attributes: ["id"] },
                {
                    model: Variant,
                    attributes: ["id", "productId", "sku", "price", "stock"],
                    include: { model: VariantAttribute, attributes: ["name", "value"] }
                },
                { model: Review, attributes: ["id", "rating", "comment", "userId"], required: false },
                { model: Product, as: 'RelatedProducts', attributes: ['id'], through: { attributes: [] } },
            ]
        });
        
        if (typeof updatedProduct.imageUrl === 'string') {
            updatedProduct.imageUrl = JSON.parse(updatedProduct.imageUrl);
        }
        
        return res.status(201).json({
            message: "Product created successfully",
            updatedProduct
        });
        
        
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { userId } = req.params;

        // Pagination input with defaults
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const offset = (page - 1) * size;
        const limit = size;

        // Count total products (for pagination metadata)
        const totalProducts = await Product.count();

        const products = await Product.findAll({
            include: [
                { model: Category, attributes: ['id', 'name'] },
                ...(userId ? [{
                    model: Wishlist,
                    as: 'Wishlists',
                    where: { userId },
                    required: false,
                    attributes: ['id']
                }] : [])
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit,
        });

        const processedProducts = products.map(product => {
            const prod = product.toJSON();

            // Flatten category
            prod.categoryId = prod.Category?.id || null;
            delete prod.Category;

            // Parse imageUrl if needed
            if (typeof prod.imageUrl === 'string') {
                try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
            }

            // Add isInWishlist flag
            prod.isInWishlist = userId ? prod.Wishlists?.length > 0 : false;
            delete prod.Wishlists;

            return prod;
        });

        return res.status(200).json({
            data: processedProducts,
            pagination: {
                currentPage: page,
                pageSize: size,
                totalItems: totalProducts,
                totalPages: Math.ceil(totalProducts / size),
            },
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            name,
            description,
            price,
            stock,
            imageUrl,
            relatedProductIds,
            categoryId // add categoryId here
        } = req.body;
        
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // Update main product info including categoryId
        await product.update({
            name: name ?? product.name,
            description: description ?? product.description,
            price: price ?? product.price,
            stock: stock ?? product.stock,
            imageUrl: imageUrl ?? product.imageUrl,
            categoryId: categoryId ?? product.categoryId, // update categoryId here
        });
        
        // Handle related products
        if (relatedProductIds && Array.isArray(relatedProductIds)) {
            // Remove existing related products
            await product.setRelatedProducts([]);
            
            // Re-add new related products if any
            const validRelatedProducts = await Product.findAll({
                where: { id: relatedProductIds }
            });
            
            await product.addRelatedProducts(validRelatedProducts);
        }
        
        // Reload updated product including related products and category
        const updatedProduct = await Product.findByPk(productId, {
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name']
                },
                {
                    model: Product,
                    as: 'RelatedProducts',
                    attributes: ['id', 'name']
                }
            ]
        });
        
        const prodJson = updatedProduct.toJSON();
        
        // Flatten category to categoryId
        prodJson.categoryId = prodJson.Category?.id || null;
        delete prodJson.Category;
        
        // Parse imageUrl if string
        if (typeof prodJson.imageUrl === 'string') {
            try {
                prodJson.imageUrl = JSON.parse(prodJson.imageUrl);
            } catch {
                // ignore parse errors
            }
        }
        
        return res.status(200).json({
            message: "Product updated successfully",
            product: prodJson
        });
        
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const product = await Product.findByPk(id, {
            include: [
                { model: Category, attributes: ['id', 'name'] },
                {
                    model: Variant,
                    attributes: ['id', 'productId', 'sku', 'price', 'stock'],
                    include: [{ model: VariantAttribute, attributes: ['name', 'value'] }]
                },
                {
                    model: Review,
                    attributes: ['id', 'rating', 'comment', 'userId', 'imageUrl'],
                    required: false,
                    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
                },
                {
                    model: Product,
                    as: 'RelatedProducts',
                    attributes: ['id', 'name', 'price'],
                    through: { attributes: [] }
                },
                ...(userId ? [{
                    model: Wishlist,
                    as: 'Wishlists',
                    where: { userId },
                    attributes: ['id'],
                    required: false
                }] : [])
            ]
        });

        if (!product) return res.status(404).json({ message: "Product not found" });

        const prod = product.toJSON();

        prod.categoryId = prod.Category?.id || null;
        delete prod.Category;

        if (typeof prod.imageUrl === 'string') {
            try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch { prod.imageUrl = []; }
        }

        prod.isInWishlist = userId ? prod.Wishlists?.length > 0 : false;
        delete prod.Wishlists;

        return res.status(200).json(prod);

    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.placeOrder = async (req, res) => {
    const { userId, items, paymentType } = req.body;

    if (!userId || !items || !paymentType || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    const transaction = await sequelize.transaction(); // Start transaction

    try {
        let totalAmount = 0;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const productUpdates = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (!product) throw new Error(`Product ID ${item.productId} not found`);

            if (product.stock < item.quantity) {
                throw new Error(`Unavailable stock for ${product.name}`);
            }

            totalAmount += product.price * item.quantity;

            productUpdates.push({
                product,
                newStock: product.stock - item.quantity,
                quantity: item.quantity,
                price: product.price
            });
        }

        const order = await Order.create({ userId, totalAmount, paymentType }, { transaction });

        for (const update of productUpdates) {
            await update.product.update({ stock: update.newStock }, { transaction });

            await OrderProduct.create({
                orderId: order.id,
                productId: update.product.id,
                quantity: update.quantity,
                price: update.price
            }, { transaction });
        }

        await transaction.commit();

        return res.status(201).json({
            message: "Order placed successfully",
            orderId: order.id,
            order
        });

    } catch (error) {
        await transaction.rollback(); // Revert changes on failure
        console.error("Error placing order:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
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

        // Check if variant exists for the product
        const variant = await Variant.findOne({ where: { id: variantId, productId } });
        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }

        // Check stock availability for the variant
        if (quantity > variant.stock) {
            return res.status(400).json({ message: `Not enough stock. Available: ${variant.stock}` });
        }

        // Calculate total amount (rounded to 2 decimal places)
        const totalAmount = (variant.price * quantity).toFixed(2);

        // Create the order (without reducing stock yet)
        const order = await Order.create({
            userId,
            productId,
            variantId,
            quantity,
            totalAmount,
            paymentType,  // Include paymentType
        });

        // Deduct stock after the order is created
        variant.stock -= quantity;
        await variant.save();

        // Return success response with order details
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
        console.error("Error in buying product:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Step 1: Get all variants for the product
        const variants = await Variant.findAll({ where: { productId } });
        const variantIds = variants.map(v => v.id);

        // Step 2: Delete variant attributes first
        if (variantIds.length > 0) {
            await VariantAttribute.destroy({ where: { variantId: variantIds } });
        }

        // Step 3: Delete variants
        await Variant.destroy({ where: { productId } });

        // Step 4: Delete related products links
        await RelatedProduct.destroy({ where: { productId } });
        await RelatedProduct.destroy({ where: { relatedProductId: productId } });

        // Step 5: Delete the product
        await product.destroy();

        return res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { productId, userId, rating, comment } = req.body;

        // Parse uploaded files if any
        const imageArray = req.files && req.files.length > 0
            ? req.files.map(file => `/uploads/${file.filename}`)
            : null;

        // Validate required fields
        if (!productId || !userId || !rating) {
            return res.status(400).json({ message: "productId, userId, and rating are required" });
        }

        // Check if product and user exist
        const [product, user] = await Promise.all([
            Product.findByPk(productId),
            User.findByPk(userId),
        ]);

        if (!product) return res.status(404).json({ message: "Product not found" });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check for existing review
        const existingReview = await Review.findOne({ where: { productId, userId } });
        if (existingReview) {
            return res.status(409).json({ message: "User already reviewed this product" });
        }

        // Create review
        const review = await Review.create({
            productId,
            userId,
            rating,
            comment,
            imageUrl: imageArray,
        });

        return res.status(201).json({ message: "Review added", review });

    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.findAll({ where: { productId: id } });
        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            query,
            categoryIds,       // comma-separated list
            minPrice,
            maxPrice,
            variantSku,        // comma-separated list of SKUs
            availableOnly,     // boolean string 'true' or 'false'
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            page = 1,
            size = 10,
        } = req.query;

        const limit = Math.min(parseInt(size, 10) || 10, 100); // max 100 per page
        const offset = (parseInt(page, 10) - 1) * limit;

        // Build product filters
        const productWhere = {};

        if (query) {
            productWhere[Op.or] = [
                { name: { [Op.iLike]: `%${query}%` } },              // case-insensitive LIKE (Postgres)
                { description: { [Op.iLike]: `%${query}%` } },       // full text on description too
            ];
        }

        if (categoryIds) {
            const ids = categoryIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
            if (ids.length > 0) productWhere.categoryId = { [Op.in]: ids };
        }

        if (minPrice || maxPrice) {
            productWhere.price = {};
            if (minPrice) productWhere.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) productWhere.price[Op.lte] = parseFloat(maxPrice);
        }

        if (availableOnly === 'true') {
            productWhere.stockQuantity = { [Op.gt]: 0 }; // assuming stockQuantity field exists
        }

        // Base query options
        const queryOptions = {
            where: productWhere,
            include: [
                { model: Category, attributes: ['id', 'name'] },
                ...(userId ? [{
                    model: Wishlist,
                    as: 'Wishlists',
                    where: { userId },
                    required: false,
                    attributes: ['id'],
                }] : [])
            ],
            order: [[sortBy, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
            limit,
            offset,
        };

        // Include variant SKU filtering if Variant model exists and variantSku provided
        if (variantSku) {
            const skus = variantSku.split(',').map(sku => sku.trim()).filter(Boolean);
            if (skus.length) {
                queryOptions.include.push({
                    model: Variant,
                    as: 'Variants',
                    where: {
                        sku: { [Op.in]: skus }
                    },
                    required: true,
                    attributes: [],
                });
            }
        }

        // Get total count with same filters
        const totalItems = await Product.count({
            where: productWhere,
            include: queryOptions.include.filter(i => !['Wishlists', 'Variants'].includes(i.as) ? true : i.required),
            distinct: true,
            col: 'Product.id',
        });

        const products = await Product.findAll(queryOptions);

        const formatted = products.map(product => {
            const prod = product.toJSON();

            prod.categoryId = prod.Category?.id || null;
            delete prod.Category;

            if (typeof prod.imageUrl === 'string') {
                try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
            }

            prod.isInWishlist = userId ? prod.Wishlists?.length > 0 : false;
            delete prod.Wishlists;

            return prod;
        });

        return res.status(200).json({
            data: formatted,
            pagination: {
                currentPage: parseInt(page, 10),
                pageSize: limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
            },
        });

    } catch (error) {
        console.error('Error in searchProducts:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        const { sku, price, stock, attributes } = req.body;

        const variant = await Variant.create({ productId, sku, price, stock });

        if (attributes && Array.isArray(attributes)) {
            for (const attr of attributes) {
                await VariantAttribute.create({
                    variantId: variant.id,
                    name: attr.name,
                    value: attr.value
                });
            }
        }

        return res.status(201).json({ message: 'Variant added', variant });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        const { sku, price, stock } = req.body;

        const variant = await Variant.findByPk(variantId);
        if (!variant) return res.status(404).json({ message: 'Variant not found' });

        await variant.update({ sku, price, stock });
        return res.status(200).json({ message: 'Variant updated', variant });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteVariant = async (req, res) => {
    try {
        const { variantId } = req.params;

        // Delete related VariantAttribute entries first
        await VariantAttribute.destroy({ where: { variantId } });

        // Then delete the Variant
        await Variant.destroy({ where: { id: variantId } });

        return res.status(200).json({ message: 'Variant deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, priceAtPurchase } = req.body;

        const cartItem = await Cart.create({ userId, productId, quantity, priceAtPurchase });

        return res.status(201).json({ message: 'Added to cart', cartItem });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findAll({ where: { userId } });
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        await Cart.destroy({ where: { userId, productId } });
        return res.status(200).json({ message: 'Removed from cart' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.findAll({
            where: { userId },
            include: [{ model: OrderProduct }, { model: Product }]
        });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const exists = await Wishlist.findOne({ where: { userId, productId } });
        if (exists) return res.status(409).json({ message: 'Product already in wishlist' });

        const wishlist = await Wishlist.create({ userId, productId });
        return res.status(201).json({ message: 'Added to wishlist', wishlist });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Get wishlist for user
exports.getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch the wishlist for the user
        const wishlist = await Wishlist.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'imageUrl'],
                }
            ],

        });

        // Process the wishlist data as needed
        return res.status(200).json(wishlist);
    } catch (error) {
        console.error('Wishlist error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        await Wishlist.destroy({ where: { userId, productId } });

        return res.status(200).json({ message: 'Removed from wishlist' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};