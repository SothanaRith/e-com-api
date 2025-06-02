
const Category = require("../models/Category");
const Review = require("../models/Review")
const Order = require('../models/Order')
const User = require('../models/User')
const Variant = require('../models/VariantModel')
const OrderProduct = require('../models/OrderProduct')
const VariantAttribute = require('../models/VariantAttributeModel')
const RelatedProduct = require('../models/RelatedProduct')
const Cart = require("../models/Cart");
const Transaction = require("../models/Transaction")
const path = require("path");
const upload = require("../controllers/uploadController");
const { Wishlist, Product } = require('../models');
const { Op, fn, col, where: sequelizeWhere } = require('sequelize');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt, generateTokens } = require('../utils/crypto');
const sequelize = require('../config/db');

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
                }] : []),
                ...(userId ? [{
                    model: Cart,
                    where: { userId },
                    required: false,
                    attributes: ['quantity']
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

            // Wishlist flag
            prod.isInWishlist = userId ? prod.Wishlists?.length > 0 : false;
            delete prod.Wishlists;

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
        return res.status(500).json({ message: 'Internal server error', error: error.message });
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
                    attributes: ['id', 'name', 'price', 'imageUrl'],
                    through: { attributes: [] }
                },
                ...(userId ? [{
                    model: Wishlist,
                    as: 'Wishlists',
                    where: { userId },
                    attributes: ['id'],
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

        if (!product) return res.status(404).json({ message: "Product not found" });

        const prod = product.toJSON();

        prod.categoryId = prod.Category?.id || null;
        delete prod.Category;

        // Parse imageUrl of main product
        if (typeof prod.imageUrl === 'string') {
            try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch { prod.imageUrl = []; }
        }

        // Wishlist flag
        prod.isInWishlist = userId ? prod.Wishlists?.length > 0 : false;
        delete prod.Wishlists;

        // Cart info
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

        // Parse imageUrl for related products
        if (prod.RelatedProducts && Array.isArray(prod.RelatedProducts)) {
            prod.RelatedProducts = prod.RelatedProducts.map(relProd => {
                if (typeof relProd.imageUrl === 'string') {
                    try {
                        relProd.imageUrl = JSON.parse(relProd.imageUrl);
                    } catch {
                        relProd.imageUrl = [];
                    }
                }
                return relProd;
            });
        }

        return res.status(200).json(prod);

    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.placeOrder = async (req, res) => {
    const { userId, items, paymentType } = req.body;

    if (
        !userId ||
        !items ||
        !paymentType ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    const transaction = await sequelize.transaction();

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: "User not found" });
        }

        let totalAmount = 0;

        // Validate stock and calculate total amount
        for (const item of items) {
            const { productId, variantId, quantity } = item;

            if (!productId || !quantity || quantity <= 0) {
                throw new Error("Invalid item data");
            }

            const product = await Product.findByPk(productId, { transaction });
            if (!product) throw new Error(`Product ID ${productId} not found`);

            let stockAvailable;
            let price;

            if (variantId) {
                const variant = await Variant.findOne({ where: { id: variantId, productId }, transaction });
                if (!variant) throw new Error(`Variant not found for product ID ${productId}`);
                stockAvailable = variant.stock;
                price = variant.price;

                if (quantity > stockAvailable) {
                    throw new Error(`Insufficient stock for variant ${variant.sku}`);
                }
            } else {
                stockAvailable = product.totalStock;
                price = product.price;

                if (quantity > stockAvailable) {
                    throw new Error(`Insufficient stock for product ${product.name}`);
                }
            }

            totalAmount += price * quantity;
        }

        // Create Order
        const order = await Order.create({
            userId,
            totalAmount,
            paymentType,
            status: "pending",
        }, { transaction });

        // Create OrderProducts and reduce stock
        for (const item of items) {
            const { productId, variantId, quantity } = item;

            let price;

            if (variantId) {
                const variant = await Variant.findOne({ where: { id: variantId, productId }, transaction });
                price = variant.price;
                await variant.decrement("stock", { by: quantity, transaction });
            } else {
                const product = await Product.findByPk(productId, { transaction });
                price = product.price;
                // Use totalStock here
                await product.decrement("totalStock", { by: quantity, transaction });
            }

            await OrderProduct.create({
                orderId: order.id,
                productId,
                variantId: variantId || null,
                quantity,
                price,
            }, { transaction });
        }

        await Cart.destroy({
            where: { userId },
            transaction
        });

        // Create Transaction record
        await Transaction.create({
            orderId: order.id,
            paymentType,
            amount: totalAmount,
            status: "pending",
        }, { transaction });

        await transaction.commit();

        return res.status(201).json({
            message: "Order placed successfully",
            orderId: order.id,
            totalAmount,
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error placing order:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getTransactionsByUser = async (req, res) => {
    try {
        const { userId, status } = req.params;

        const transactions = await Transaction.findAll({
            where: { status },
            include: [
                {
                    model: Order,
                    where: { userId },
                    include: [
                        {
                            model: OrderProduct,
                            as: 'orderItems',  // <--- add this alias
                            include: [
                                { model: Product, attributes: ['id', 'name', 'price'] }
                            ]
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    const { id } = req.params;

    const transaction = await sequelize.transaction();
    try {
        const order = await Order.findByPk(id, {
            include: [Product, { model: Transaction }],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Prevent duplicate cancel
        if (order.status === 'cancelled') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Order already cancelled' });
        }

        // 1. Mark order as cancelled
        order.status = 'cancelled';
        await order.save({ transaction });

        // 2. Optional: Mark transaction as cancelled
        if (order.Transaction) {
            order.Transaction.status = 'cancelled';
            await order.Transaction.save({ transaction });
        }

        // 3. Optional: Restock products (simplified)
        const orderItems = await OrderProduct.findAll({ where: { orderId: order.id }, transaction });
        for (const item of orderItems) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (product) {
                product.stock += item.quantity;
                await product.save({ transaction });
            }
        }

        await transaction.commit();

        return res.status(200).json({ message: 'Order and transaction cancelled successfully' });

    } catch (error) {
        await transaction.rollback();
        console.error('Cancel order error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
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
            categoryId,
            minPrice,
            maxPrice,
            variantSku,
            minRating,
            page = 1,
            size = 10,
        } = req.query;

        const limit = parseInt(size, 10);
        const offset = (parseInt(page, 10) - 1) * limit;

        const productWhere = {};

        if (query && query.trim()) {
            productWhere.name = { [Op.like]: `%${query.trim()}%` };
        }

        if (categoryId) {
            const categoryIds = categoryId.split(',').map(id => parseInt(id.trim(), 10));
            productWhere.categoryId = { [Op.in]: categoryIds };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            productWhere.price = {};
            if (minPrice !== undefined && minPrice !== '') {
                productWhere.price[Op.gte] = parseFloat(minPrice);
            }
            if (maxPrice !== undefined && maxPrice !== '') {
                productWhere.price[Op.lte] = parseFloat(maxPrice);
            }
        }

        // Base includes for all queries, includes Cart if userId provided
        const includeModels = [
            { model: Category, attributes: ['id', 'name'] },
            ...(userId ? [{
                model: Wishlist,
                as: 'Wishlists',
                where: { userId },
                required: false,
                attributes: ['id']
            }] : []),
            ...(userId ? [{
                model: Cart,
                where: { userId },
                required: false,
                attributes: ['quantity']
            }] : [])
        ];

        let totalItems = 0;
        let products;

        if (minRating !== undefined && minRating !== '') {
            const minRatingFloat = parseFloat(minRating);

            // Count total items with avg rating filter
            const productsWithAvgRating = await Product.findAll({
                where: productWhere,
                include: [
                    {
                        model: Review,
                        attributes: []
                    }
                ],
                attributes: [
                    'id',
                    [fn('AVG', col('Reviews.rating')), 'avgRating']
                ],
                group: ['Product.id'],
                having: sequelizeWhere(fn('AVG', col('Reviews.rating')), { [Op.gte]: minRatingFloat }),
            });

            totalItems = productsWithAvgRating.length;

            // Query products with avg rating filter plus Wishlist and Cart includes if userId
            products = await Product.findAll({
                where: productWhere,
                include: [
                    { model: Category, attributes: ['id', 'name'] },
                    ...(userId ? [{
                        model: Wishlist,
                        as: 'Wishlists',
                        where: { userId },
                        required: false,
                        attributes: ['id']
                    }] : []),
                    ...(userId ? [{
                        model: Cart,
                        where: { userId },
                        required: false,
                        attributes: ['quantity']
                    }] : []),
                    {
                        model: Review,
                        attributes: [],
                        required: true,
                    }
                ],
                attributes: {
                    include: [
                        [fn('AVG', col('Reviews.rating')), 'avgRating']
                    ]
                },
                group: ['Product.id', 'Category.id', ...(userId ? ['Wishlists.id', 'Carts.id'] : [])],
                having: sequelizeWhere(fn('AVG', col('Reviews.rating')), { [Op.gte]: minRatingFloat }),
                order: [['createdAt', 'DESC']],
                limit,
                offset,
                subQuery: false // Important for pagination with grouping
            });

        } else {
            // Without rating filter, count total items normally
            totalItems = await Product.count({
                where: productWhere,
                include: [
                    ...(userId ? [{
                        model: Wishlist,
                        as: 'Wishlists',
                        where: { userId },
                        required: false,
                        attributes: [],
                    }] : [])
                ],
                distinct: true,
                col: 'id',
            });

            // Query products without rating filter
            products = await Product.findAll({
                where: productWhere,
                include: includeModels,
                order: [['createdAt', 'DESC']],
                limit,
                offset,
            });
        }

        const formatted = products.map(product => {
            const prod = product.toJSON();

            prod.categoryId = prod.Category?.id || null;
            delete prod.Category;

            if (typeof prod.imageUrl === 'string') {
                try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
            }

            prod.isInWishlist = userId ? prod.Wishlists?.length > 0 : false;
            delete prod.Wishlists;

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

            if (prod.avgRating !== undefined) {
                prod.avgRating = parseFloat(prod.avgRating).toFixed(2);
            }

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

exports.addOrUpdateCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cartItem = await Cart.findOne({ where: { userId, productId } });

        if (cartItem) {
            cartItem.quantity = quantity;
            await cartItem.save();
            return res.status(200).json({ message: 'Cart updated', cartItem });
        } else {
            cartItem = await Cart.create({
                userId,
                productId,
                quantity,
                priceAtPurchase: product.price
            });
            return res.status(201).json({ message: 'Added to cart', cartItem });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'imageUrl']
                }
            ]
        });

        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const cartItem = await Cart.findOne({ where: { userId, productId } });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        await cartItem.destroy();
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

        const wishlist = await Wishlist.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'imageUrl'],
                    include: [
                        {
                            model: Cart,
                            where: { userId },
                            required: false,
                            attributes: ['quantity']
                        }
                    ]
                }
            ],
        });

        const formatted = wishlist.map(item => {
            const prod = item.product.toJSON();

            // Parse imageUrl if needed
            if (typeof prod.imageUrl === 'string') {
                try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
            }

            // Include cart status
            prod.isInCart = prod.Carts && prod.Carts.length > 0;
            prod.cartQuantity = prod.isInCart ? prod.Carts[0].quantity : 0;
            delete prod.Carts;

            return {
                id: item.id,
                product: prod,
            };
        });

        return res.status(200).json(formatted);
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