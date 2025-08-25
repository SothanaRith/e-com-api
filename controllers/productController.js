
const Category = require("../models/Category");
const Review = require("../models/Review")
const Order = require('../models/Order')
const User = require('../models/User')
const Variant = require('../models/VariantModel')
const OrderProduct = require('../models/OrderProduct')
const VariantAttribute = require('../models/VariantAttributeModel')
const RelatedProduct = require('../models/RelatedProduct')
const Cart = require("../models/Cart");
const Wishlist = require("../models/WishList");
const Transaction = require("../models/Transaction")
const DeliveryAddress = require("../models/DeliveryAddress");
const OrderTracking = require("../models/OrderTracking");
const Product = require("../models/Product");
const { Op, fn, col, literal, where: sequelizeWhere } = require('sequelize');
const sequelize = require('../config/db');
const { Sequelize } = require('sequelize');
const Notification = require('../models/Notification');
const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')

function calculateFinalPrice(price, discountType, discountValue, isPromotion) {
    if (!isPromotion || !discountType || discountValue <= 0) return price;

    if (discountType === 'fixed') {
        return Math.max(0, price - discountValue); // Prevent negative price
    }

    if (discountType === 'percent') {
        return parseFloat((price * (1 - discountValue / 100)).toFixed(2));
    }
    return price;
}

// --- Helpers for optional userId + date range ---
function getOptionalUserId(req) {
    // Prefer query.userId, fallback to route param, else null
    return req.query.userId ?? req.params.userId ?? null;
}

function buildCreatedAtRange(start, end) {
    const where = {};
    if (start || end) {
        const range = {};
        if (start) range[Op.gte] = new Date(start);
        if (end) {
            // Inclusive end: use < next day 00:00
            const e = new Date(end);
            const next = new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1, 0, 0, 0);
            range[Op.lt] = next;
        }
        where.createdAt = range;
    }
    return where;
}

exports.createProduct = async (req, res) => {
    try {
        const {
            categoryId,
            review,
            name,
            description,
            relatedProductIds,
        } = req.body;
        let totalStock = 0;
        let imageArray = [];
        if(process.env.NODE_ENV === 'development') {
            imageArray = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        } else {
            imageArray = req.files ? req.files.map(file => file.location) : [];
        }

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
            price: 0,
            imageUrl: imageArray,
            totalStock: totalStock,
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

        // Related products handling
        let relatedIdsArray = [];

        if (typeof relatedProductIds === 'string') {
            relatedIdsArray = relatedProductIds
                .replace(/[\[\]'"]+/g, '')
                .split(',')
                .map(id => parseInt(id.trim()))
                .filter(id => !isNaN(id));
        } else if (Array.isArray(relatedProductIds)) {
            relatedIdsArray = relatedProductIds.map(id => parseInt(id)).filter(id => !isNaN(id));
        }

        for (const relatedId of relatedIdsArray) {
            const exists = await Product.findByPk(relatedId);
            if (exists) {
                await RelatedProduct.create({
                    productId: product.id,
                    relatedProductId: relatedId,
                });
            } else {
                console.warn(`Product ID ${relatedId} not found`);
            }
        }

        const updatedProduct = await Product.findByPk(product.id, {
            include: [
                { model: Category, attributes: ["id"] },
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
        // userId optional: from params OR query
        const rawUserId = req.params.userId ?? req.query.userId ?? null;
        const userId = rawUserId && /^\d+$/.test(String(rawUserId)) ? Number(rawUserId) : null;

        // Pagination with sane defaults
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const size = Math.max(parseInt(req.query.size, 10) || 10, 1);
        const offset = (page - 1) * size;
        const limit = size;

        // Count total products (not affected by wishlist/cart joins)
        const totalProducts = await Product.count();

        // Build conditional user includes
        const userIncludes = userId
            ? [
                {
                    model: Wishlist,
                    as: 'Wishlists',
                    where: { userId },
                    required: false,
                    attributes: ['id'],
                },
                {
                    model: Cart,
                    as: 'Carts', // ensure alias matches your association
                    where: { userId },
                    required: false,
                    attributes: ['quantity'],
                },
            ]
            : [];

        const products = await Product.findAll({
            include: [
                { model: Category, attributes: { exclude: [] }, required: false },
                ...userIncludes,
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit,
        });

        const processedProducts = products.map(p => {
            const prod = p.toJSON();

            // Flatten / keep category
            prod.categoryId = prod.Category?.id ?? null;
            prod.category = prod.Category ?? null;
            delete prod.Category;

            // Parse imageUrl if it's a JSON string
            if (typeof prod.imageUrl === 'string') {
                try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch {}
            }

            // Wishlist flag
            prod.isInWishlist = userId ? (prod.Wishlists?.length > 0) : false;
            delete prod.Wishlists;

            // Cart flags
            if (userId) {
                const hasCart = Array.isArray(prod.Carts) && prod.Carts.length > 0;
                prod.isInCart = hasCart;
                prod.cartQuantity = hasCart ? prod.Carts[0].quantity : 0;
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
        console.error('Error in getAllProducts:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            name,
            description,
            imageUrl,
            relatedProductIds,
            categoryId,
        } = req.body;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let imageArray = [];
        if (process.env.NODE_ENV === 'development') {
            imageArray = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        } else {
            imageArray = req.files ? req.files.map(file => file.location) : [];
        }

        if (imageUrl) {
            const existingImages = imageUrl.split(',').map(image => image.trim());
            imageArray = [...imageArray, ...existingImages];
        }

        // Fetch all variants of the product and calculate the total stock
        const variants = await Variant.findAll({ where: { productId } });
        let totalStock = 0;
        variants.forEach(variant => {
            totalStock += variant.stock;
        });

        // Update the product with the total stock from variants, or use the provided stock if given
        await product.update({
            name: name ?? product.name,
            description: description ?? product.description,
            price: product.price,
            totalStock: totalStock,  // Update with calculated total stock or provided stock
            imageUrl: imageArray,
            categoryId: categoryId ?? product.categoryId,
        });

        // Related products handling
        let relatedIdsArray = [];

        if (typeof relatedProductIds === 'string') {
            relatedIdsArray = relatedProductIds
                .replace(/[\[\]'"]+/g, '')
                .split(',')
                .map(id => parseInt(id.trim()))
                .filter(id => !isNaN(id));
        } else if (Array.isArray(relatedProductIds)) {
            relatedIdsArray = relatedProductIds
                .map(id => parseInt(id))
                .filter(id => !isNaN(id));
        }

        if (relatedIdsArray.length > 0) {
            await product.setRelatedProducts([]);

            const validRelatedProducts = await Product.findAll({
                where: { id: relatedIdsArray }
            });

            await product.addRelatedProducts(validRelatedProducts);
        }

        const updatedProduct = await Product.findByPk(productId, {
            include: [
                { model: Category, attributes: ['id', 'name'] },
                { model: Product, as: 'RelatedProducts', attributes: ['id', 'name'], through: { attributes: [] } }
            ]
        });

        const prodJson = updatedProduct.toJSON();

        prodJson.categoryId = prodJson.Category?.id || null;
        delete prodJson.Category;

        if (typeof prodJson.imageUrl === 'string') {
            try {
                prodJson.imageUrl = JSON.parse(prodJson.imageUrl);
            } catch {
                prodJson.imageUrl = [];
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
        const { id } = req.params;

        // userId is optional: accept from params OR query
        const rawUserId = req.params.userId ?? req.query.userId ?? null;
        const userId = rawUserId && /^\d+$/.test(String(rawUserId)) ? Number(rawUserId) : null;

        if (!id || Number.isNaN(Number(id))) {
            return res.status(400).json(failResponse("Invalid product ID"));
        }

        // Build conditional user includes
        const userIncludes = userId
            ? [
                {
                    model: Wishlist,
                    as: 'Wishlists',
                    where: { userId },
                    attributes: ['id'],
                    required: false,
                },
                {
                    model: Cart,
                    as: 'Carts',              // ensure this matches your association alias
                    where: { userId },
                    attributes: ['quantity'],
                    required: false,
                },
            ]
            : [];

        const product = await Product.findByPk(id, {
            include: [
                { model: Category, attributes: { exclude: [] }, required: false },
                {
                    model: Variant,
                    attributes: { exclude: [] },
                    required: false,
                    include: [
                        { model: VariantAttribute, attributes: ['name', 'value'], required: false },
                    ],
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
                ...userIncludes,
            ],
        });

        if (!product) {
            return res.status(404).json(failResponse("Product not found"));
        }

        const prod = product.toJSON();

        // Category
        prod.category = prod.Category || null;
        delete prod.Category;

        // Parse main product imageUrl if stored as JSON string
        if (typeof prod.imageUrl === 'string') {
            try { prod.imageUrl = JSON.parse(prod.imageUrl); } catch { prod.imageUrl = []; }
        }

        // Wishlist flag
        prod.isInWishlist = userId ? (prod.Wishlists?.length > 0) : false;
        delete prod.Wishlists;

        // Cart info
        if (userId) {
            const hasCart = Array.isArray(prod.Carts) && prod.Carts.length > 0;
            prod.isInCart = hasCart;
            prod.cartQuantity = hasCart ? prod.Carts[0].quantity : 0;
            delete prod.Carts;
        }

        // Parse imageUrl for related products when saved as JSON string
        if (Array.isArray(prod.RelatedProducts)) {
            prod.RelatedProducts = prod.RelatedProducts.map(rp => {
                if (typeof rp.imageUrl === 'string') {
                    try { rp.imageUrl = JSON.parse(rp.imageUrl); } catch { rp.imageUrl = []; }
                }
                return rp;
            });
        }

        return res.status(200).json(successResponse("Product fetched successfully", prod));
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json(failResponse("Internal server error", error.message));
    }
};

exports.placeOrder = async (req, res) => {
    const { userId, items, paymentType, deliveryAddressId, billingNumber } = req.body;

    if (!userId || !items || !paymentType || !Array.isArray(items) || items.length === 0 || !billingNumber || !deliveryAddressId) {
        return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    const transaction = await sequelize.transaction();

    try {
        // 1. Validate user
        const user = await User.findByPk(userId);
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Validate address
        const address = await DeliveryAddress.findByPk(deliveryAddressId);
        if (!address) {
            await transaction.rollback();
            return res.status(404).json({ message: "Address not found" });
        }

        let totalAmount = 0;

        // 3. Validate items and calculate total
        for (const item of items) {
            const { productId, variantId, quantity } = item;

            if (!productId || !variantId || !quantity || quantity <= 0) {
                throw new Error("Invalid item data");
            }

            const product = await Product.findByPk(productId, { transaction });
            if (!product) throw new Error(`Product ID ${productId} not found`);

            const variant = await Variant.findByPk(variantId, { transaction });
            if (!variant || variant.productId !== product.id) {
                throw new Error(`Invalid or mismatched variant for product ID ${productId}`);
            }

            if (quantity > variant.stock) {
                throw new Error(`Insufficient stock for variant ID ${variantId}`);
            }

            const finalPrice = calculateFinalPrice(
                variant.price,
                variant.discountType,
                variant.discountValue,
                variant.isPromotion
            );

            totalAmount += finalPrice * quantity;
        }

        // 4. Create order
        const order = await Order.create({
            userId,
            totalAmount,
            paymentType,
            status: "pending",
            deliveryAddressId,
            billingNumber
        }, { transaction });

        // 5. Track order status
        await OrderTracking.create({
            orderId: order.id,
            status: "pending",
            timestamp: new Date()
        }, { transaction });

        // 6. Add order items and update variant stock
        for (const item of items) {
            const { productId, variantId, quantity } = item;

            const variant = await Variant.findByPk(variantId, { transaction });

            const finalPrice = calculateFinalPrice(
                variant.price,
                variant.discountType,
                variant.discountValue,
                variant.isPromotion
            );

            await OrderProduct.create({
                orderId: order.id,
                productId,
                variantId,
                quantity,
                price: finalPrice
            }, { transaction });

            variant.stock -= quantity;
            await variant.save({ transaction });

            // Update product's total stock
            const variants = await Variant.findAll({ where: { productId }, transaction });
            const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
            const product = await Product.findByPk(productId, { transaction });
            if (product) {
                await product.update({ totalStock }, { transaction });
            }
        }

        // 7. Clear cart
        await Cart.destroy({
            where: {
                userId,
                [Op.or]: items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId
                }))
            },
            transaction
        });

        // 8. Create payment transaction
        await Transaction.create({
            orderId: order.id,
            paymentType,
            amount: totalAmount,
            status: "pending"
        }, { transaction });

        // 9. Get updated variant stocks
        const updatedVariants = await Variant.findAll({
            where: {
                id: items.map(i => i.variantId)
            },
            transaction
        });

        await transaction.commit();

        return res.status(201).json({
            message: "Order placed successfully",
            orderId: order.id,
            totalAmount,
            address,
            updatedStocks: updatedVariants.map(v => ({
                variantId: v.id,
                productId: v.productId,
                stock: v.stock
            }))
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Error placing order:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.updateTransactionByOrderId = async (req, res) => {
    const { orderId } = req.params;
    const { status, paymentType, amount } = req.body;

    const allowedStatuses = ['pending', 'completed', 'failed', 'cancelled'];

    if (status && !allowedStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const transaction = await sequelize.transaction();

    try {
        const tx = await Transaction.findOne({ where: { orderId }, transaction });
        if (!tx) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Transaction not found for this order' });
        }

        if (status) tx.status = status.toLowerCase();
        if (paymentType) tx.paymentType = paymentType;
        if (amount) tx.amount = amount;

        await tx.save({ transaction });

        await transaction.commit();

        return res.status(200).json({ message: 'Transaction updated successfully', transaction: tx });

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating transaction:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
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
                            as: 'orderItems',  // Alias for order items
                            include: [
                                { model: Product, attributes: ['id', 'name', 'price', 'imageUrl'] }
                            ]
                        },
                        {
                            model: DeliveryAddress,  // Include the DeliveryAddress based on deliveryAddressId
                            as: 'address',  // Alias for the address
                            required: false,  // Make it optional if not all orders have an address
                            where: { id: Sequelize.col('Order.deliveryAddressId') },  // Correctly reference the column
                        },
                        {
                        model: OrderTracking,
                        as: 'trackingSteps',
                        attributes: ['status', 'timestamp'],
                        separate: true,
                        order: [['timestamp', 'ASC']]
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

exports.getOrderDetailById = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone', 'coverImage']
                },
                {
                    model: OrderProduct,
                    as: 'orderItems',
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'price', 'imageUrl', 'description'],
                            include: [
                                {
                                    model: Variant,
                                    attributes: { exclude: [] },
                                    include: [{ model: VariantAttribute, attributes: ['name', 'value'] }]
                                },
                            ]
                        }
                    ]
                },
                {
                    model: DeliveryAddress,
                    as: 'address'
                },
                {
                    model: OrderTracking,
                    as: 'trackingSteps',
                    attributes: ['status', 'timestamp'],
                    separate: true,
                    order: [['timestamp', 'ASC']]
                },
                {
                    model: Transaction,
                    attributes: ['id', 'amount', 'status', 'paymentType']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

// ✅ Dynamically calculate totalAmount from variants
        const totalAmount = order.orderItems.reduce((total, item) => {
            const variantId = item.variantId;
            const variants = item.Product.Variants || [];

            // ✅ Match the correct variant
            const variant = variants.find(v => v.id === variantId);

            let price = variant?.price || 0;
            const quantity = item.quantity || 0;

            if (variant?.isPromotion) {
                if (variant.discountType === 'fixed') {
                    price = Math.max(0, price - (variant.discountValue || 0));
                } else if (variant.discountType === 'percent') {
                    price = price * (1 - (variant.discountValue || 0) / 100);
                }
            }

            return total + price * quantity;
        }, 0);

        // Append or override totalAmount
        const orderWithTotal = {
            ...order.toJSON(),
            totalAmount: totalAmount.toFixed(2)
        };

        return res.status(200).json(orderWithTotal);

    } catch (error) {
        console.error('Error fetching order detail:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'delivery', 'delivered', 'cancelled', 'completed'];

    if (!allowedStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const transaction = await sequelize.transaction();

    try {
        const order = await Order.findByPk(orderId, {
            include: [{ model: User, attributes: ['id', 'name'] }],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status.toLowerCase();
        await order.save({ transaction });

        if (status.toLowerCase() === 'cancelled') {
            const orderItems = await OrderProduct.findAll({ where: { orderId }, transaction });

            for (const item of orderItems) {
                const product = await Product.findByPk(item.productId, { transaction });
                if (product) {
                    product.totalStock += item.quantity;
                    await product.save({ transaction });
                }
            }

            const payment = await Transaction.findOne({ where: { orderId }, transaction });
            if (payment) {
                payment.status = 'cancelled';
                await payment.save({ transaction });
            }
        }

        await OrderTracking.create({
            orderId: order.id,
            status: capitalizeWords(status),
            timestamp: new Date()
        }, { transaction });

        // ✅ Create Notification for the user
        await Notification.create({
            userId: order.userId,
            title: `Order #${order.id} Status Updated`,
            body: `Your order status is now: ${capitalizeWords(status)}.`,
            status: 'unread',
            sentAt: new Date()
        }, { transaction });

        await transaction.commit();

        return res.status(200).json({ message: 'Order status updated successfully' });

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating order status:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Capitalize helper
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}
// Helper function
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
        const finalPrice = calculateFinalPrice(variant.price, variant.discountType, variant.discountValue, variant.isPromotion);
        const totalAmount = (finalPrice * quantity).toFixed(2);

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

        let imageArray = [];
        if(process.env.NODE_ENV === 'development') {
            imageArray = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        } else {
            imageArray = req.files ? req.files.map(file => file.location) : [];
        }
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
            { model: Category, attributes: {exclude: []} },
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
            prod.category = prod.Category || null;
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
        const { sku, price, stock, title, discountType, discountValue, isPromotion } = req.body;

        let attributes = [];
        try {
            attributes = JSON.parse(req.body.attributes || '[]');
        } catch (e) {
            console.error('Invalid JSON in attributes:', e.message);
        }

        let imageUrl = '';
        if (process.env.NODE_ENV === 'development') {
            imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        } else {
            imageUrl = req.file?.location;
        }

        const variant = await Variant.create({
            productId,
            sku,
            price,
            stock,
            title,
            imageUrl,
            discountType: discountType || null,
            discountValue: discountValue || 0,
            isPromotion: isPromotion === 'true' || isPromotion === true
        });

        if (attributes && Array.isArray(attributes)) {
            for (const attr of attributes) {
                await VariantAttribute.create({
                    variantId: variant.id,
                    name: attr.name,
                    value: attr.value
                });
            }
        }

        // Update product price if this is the first variant
        const variants = await Variant.findAll({ where: { productId }, order: [['id', 'ASC']] });
        if (variants.length === 1) {
            const product = await Product.findByPk(productId);
            if (product) {
                await product.update({ price: variants[0].price });
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
        const { sku, price, stock, title, discountType, discountValue, isPromotion, isActive } = req.body;

        let attributes = [];
        try {
            attributes = JSON.parse(req.body.attributes || '[]');
        } catch (e) {
            console.error('Invalid JSON in attributes:', e.message);
        }

        let imageUrl = '';
        if (process.env.NODE_ENV === 'development') {
            imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        } else {
            imageUrl = req.file?.location;
        }

        const variant = await Variant.findByPk(variantId);
        if (!variant) return res.status(404).json({ message: 'Variant not found' });

        if (isActive === false) {
            await Cart.destroy({ where: { variantId } });
        }

        await variant.update({
            sku: sku || variant.sku,
            price: price || variant.price,
            stock: stock || variant.stock,
            imageUrl: imageUrl || variant.imageUrl,
            title: title || variant.title,
            discountType: discountType || null,
            discountValue: discountValue || 0,
            isActive: isActive || true,
            isPromotion: isPromotion === 'true' || isPromotion === true
        });

        if (attributes && Array.isArray(attributes)) {
            await VariantAttribute.destroy({ where: { variantId } });
            for (const attr of attributes) {
                await VariantAttribute.create({
                    variantId: variant.id,
                    name: attr.name,
                    value: attr.value
                });
            }
        }

        // Update product price if this variant is the first one
        const variants = await Variant.findAll({
            where: { productId: variant.productId },
            order: [['id', 'ASC']]
        });
        if (variants.length > 0 && variants[0].id === variant.id) {
            const product = await Product.findByPk(variant.productId);
            if (product) {
                await product.update({ price: variant.price });
            }
        }

        return res.status(200).json({ message: 'Variant updated', variant });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteVariant = async (req, res) => {
    try {
        const { variantId } = req.params;

        // Remove variant from all user carts
        await Cart.destroy({ where: { variantId } });

        // Delete related VariantAttribute entries first
        await VariantAttribute.destroy({ where: { variantId } });

        // Then delete the Variant
        await Variant.destroy({ where: { id: variantId } });

        return res.status(200).json({ message: 'Variant deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getVariantsByProductId = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const variants = await Variant.findAll({
            where: { productId },
            include: [
                {
                    model: VariantAttribute,
                    attributes: ['name', 'value']
                }
            ],
            order: [['id', 'ASC']]
        });

        return res.status(200).json({ variants });
    } catch (error) {
        console.error('Error fetching variants:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getTotalItemsInCart = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all items in the cart for the given user
        const cartItems = await Cart.findAll({
            where: { userId },
            attributes: ['quantity'],
        });

        // Calculate the total quantity of items in the cart
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

        return res.status(200).json({ totalItems });
    } catch (error) {
        console.error('Error fetching total items in cart:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addOrUpdateCart = async (req, res) => {
    try {
        const { userId, productId, variantId, quantity } = req.body;

        if (!userId || !productId || !variantId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const variant = await Variant.findOne({ where: { id: variantId, productId } });
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        let cartItem = await Cart.findOne({ where: { userId, productId, variantId } });

        if (cartItem) {
            cartItem.quantity = quantity;
            await cartItem.save();
            return res.status(200).json({ message: 'Cart updated', cartItem });
        } else {
            cartItem = await Cart.create({
                userId,
                productId,
                variantId,
                quantity,
                priceAtPurchase: variant.price,
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
                    attributes: ['id', 'name']
                },
                {
                    model: Variant,  // Add Variant model
                    attributes: { exclude: [] },  // Assuming the variant has these attributes
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

exports.getLastOrder = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch the most recent order for the user
        const lastOrder = await Order.findOne({
            where: { userId },
            include: [
                {
                    model: OrderProduct,
                    as: 'orderItems',
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'price', 'imageUrl']
                        }
                    ]
                },
                {
                    model: Transaction,
                    attributes: ['amount', 'status', 'paymentType']
                },
                {
                    model: DeliveryAddress,
                    as: 'address',
                    attributes: ['fullName', 'phoneNumber', 'street']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 1
        });

        if (!lastOrder) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        return res.status(200).json(lastOrder);
    } catch (error) {
        console.error('Error fetching last order:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // ✅ Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // ✅ Check if user exists (optional but good practice)
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ❌ Prevent duplicate wishlist entry
        const exists = await Wishlist.findOne({ where: { userId, productId } });
        if (exists) {
            return res.status(409).json({ message: 'Product already in wishlist' });
        }

        // ✅ Create wishlist
        const wishlist = await Wishlist.create({ userId, productId });
        return res.status(201).json({ message: 'Added to wishlist', wishlist });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        // Optional: Validate user existence
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const wishlist = await Wishlist.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'imageUrl', 'totalStock'],
                    include: [
                        { model: Category, attributes: {exclude: []} },
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
            const prod = item.product?.toJSON?.() || {};

            // Safely parse imageUrl
            if (typeof prod.imageUrl === 'string') {
                try {
                    prod.imageUrl = JSON.parse(prod.imageUrl);
                } catch {
                    prod.imageUrl = [];
                }
            }

            // Cart status
            const carts = prod.Carts || [];
            prod.isInCart = carts.length > 0;
            prod.category = prod.Category || null;
            prod.cartQuantity = prod.isInCart ? carts[0].quantity : 0;
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

exports.getAdminGroupedOrders = async (req, res) => {
    try {
        const {
            searchQuery,
            itemsPerPage = 10,
            page = 1,
            sortBy = 'createdAt',
            orderBy = 'DESC',
            startDate,
            endDate,
        } = req.query;

        const optUserId = getOptionalUserId(req);
        const statuses = ['pending', 'delivery', 'delivered', 'completed', 'cancelled'];

        const result = {};
        const limit = parseInt(itemsPerPage, 10);
        const offset = (parseInt(page, 10) - 1) * limit;
        const dateWhere = buildCreatedAtRange(startDate, endDate);

        for (const status of statuses) {
            // Count for pagination
            const totalCount = await Order.count({
                where: {
                    status,
                    ...dateWhere,
                    ...(optUserId ? { userId: optUserId } : {}),
                    ...(searchQuery
                        ? { [Op.or]: [{ id: { [Op.like]: `%${searchQuery}%` } }] }
                        : {}),
                },
            });

            const totalPages = Math.ceil(totalCount / limit);

            // Page data
            const orders = await Order.findAll({
                where: {
                    status,
                    ...dateWhere,
                    ...(optUserId ? { userId: optUserId } : {}),
                    ...(searchQuery
                        ? { [Op.or]: [{ id: { [Op.like]: `%${searchQuery}%` } }] }
                        : {}),
                },
                include: [
                    { model: User, attributes: ['id', 'name', 'email', 'coverImage'] },
                    {
                        model: OrderProduct,
                        as: 'orderItems',
                        include: [{ model: Product, attributes: ['id', 'name', 'price', 'imageUrl'] }],
                    },
                    {
                        model: DeliveryAddress,
                        as: 'address',
                        attributes: ['id', 'fullName', 'phoneNumber', 'street'],
                    },
                    {
                        model: OrderTracking,
                        as: 'trackingSteps',
                        attributes: ['status', 'timestamp'],
                        separate: true,
                        order: [['timestamp', 'ASC']],
                    },
                    { model: Transaction, attributes: ['id', 'amount', 'status', 'paymentType'] },
                ],
                order: [[sortBy, orderBy]],
                limit,
                offset,
            });

            result[status] = {
                orders,
                pagination: {
                    total: totalCount,
                    page: parseInt(page, 10),
                    totalPages,
                    itemsPerPage: limit,
                },
            };
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error grouping orders for admin:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getOrdersByUserAndStatus = async (req, res) => {
    try {
        const { userId } = req.params;  // Get userId from URL parameters
        const { status, startDate, endDate, searchQuery, itemsPerPage = 10, page = 1, sortBy = 'createdAt', orderBy = 'DESC' } = req.query;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const allowedStatuses = ['pending', 'delivery', 'delivered', 'completed', 'cancelled'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Pagination
        const limit = parseInt(itemsPerPage);
        const offset = (parseInt(page) - 1) * limit;

        // Build where conditions
        const whereCondition = {
            userId,
            status,
            ...(searchQuery ? {
                [Op.or]: [
                    { id: { [Op.like]: `%${searchQuery}%` } },
                    { status: { [Op.like]: `%${searchQuery}%` } }
                ]
            } : {}),
            ...(startDate && endDate ? {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            } : startDate ? {
                createdAt: { [Op.gte]: new Date(startDate) }
            } : endDate ? {
                createdAt: { [Op.lte]: new Date(endDate) }
            } : {})
        };

        // Count for pagination
        const totalCount = await Order.count({ where: whereCondition });

        const totalPages = Math.ceil(totalCount / limit);

        // Fetch data
        const orders = await Order.findAll({
            where: whereCondition,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'coverImage']
                },
                {
                    model: OrderProduct,
                    as: 'orderItems',
                    include: [
                        {
                            model: Product,
                            as: 'Product',
                            attributes: ['id', 'name', 'price', 'imageUrl'],
                            include: [
                                {
                                    model: Variant,
                                    attributes: { exclude: [] },
                                    include: [{ model: VariantAttribute, attributes: ['name', 'value'] }]
                                },
                            ]
                        }
                    ]
                },
                {
                    model: DeliveryAddress,
                    as: 'address',
                    attributes: ['id', 'fullName', 'phoneNumber', 'street']
                },
                {
                    model: OrderTracking,
                    as: 'trackingSteps',
                    attributes: ['status', 'timestamp'],
                    separate: true,
                    order: [['timestamp', 'ASC']],
                },
                {
                    model: Transaction,
                    attributes: ['id', 'amount', 'status', 'paymentType']
                }
            ],
            order: [[sortBy, orderBy]],
            limit,
            offset
        });

        // Format result
        const formattedOrders = orders.map(order => ({
            id: order.id,
            orderId: order.id,
            paymentType: order.Transaction?.paymentType || null,
            status: order.status,
            transactionId: order.Transaction?.id || null,
            amount: order.Transaction?.amount || 0,
            notes: order.Transaction?.notes || null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            Order: {
                id: order.id,
                userId: order.userId,
                totalAmount: order.totalAmount,
                paymentType: order.paymentType,
                status: order.status,
                billingNumber: order.billingNumber,
                deliveryAddressId: order.deliveryAddressId,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                orderItems: order.orderItems.map(item => ({
                    id: item.id,
                    orderId: item.orderId,
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                    Product: {
                        id: item.Product.id,
                        name: item.Product.name,
                        price: item.Product.price,
                        imageUrl: item.Product.imageUrl,
                        Variants: item.Product.Variants?.map(variant => ({
                            id: variant.id,
                            title: variant.title,
                            sku: variant.sku,
                            price: variant.price,
                            stock: variant.stock,
                            discountType: variant.discountType,
                            discountValue: variant.discountValue,
                            isPromotion: variant.isPromotion,
                            imageUrl: variant.imageUrl,
                            attributes: variant.VariantAttributes?.map(attr => ({
                                name: attr.name,
                                value: attr.value
                            })) || []
                        })) || []
                    }
                })),
                address: order.address ? {
                    id: order.address.id,
                    userId: order.address.userId,
                    fullName: order.address.fullName,
                    phoneNumber: order.address.phoneNumber,
                    street: order.address.street,
                    isDefault: order.address.isDefault,
                    createdAt: order.address.createdAt,
                    updatedAt: order.address.updatedAt,
                } : null,
                trackingSteps: order.trackingSteps.map(step => ({
                    status: step.status,
                    timestamp: step.timestamp,
                }))
            }
        }));

        return res.status(200).json(formattedOrders);

        // return res.status(200).json({
        //     orders: formattedOrders,
        //     pagination: {
        //         total: totalCount,
        //         page: parseInt(page),
        //         totalPages,
        //         itemsPerPage: limit
        //     }
        // });

    } catch (error) {
        console.error('Error fetching orders by user and status:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateTotalStock = async (req, res) => {
    const { productId } = req.params;

    try {
        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Sum all variant stock for this product
        const totalStockResult = await Variant.findAll({
            where: { productId },
            attributes: [[Sequelize.fn('SUM', Sequelize.col('stock')), 'totalStock']],
            raw: true,
        });

        const totalStock = parseInt(totalStockResult[0].totalStock || 0, 10);

        // Update product's totalStock field
        await product.update({ totalStock });

        return res.status(200).json({
            message: "Total stock updated successfully",
            totalStock,
        });
    } catch (error) {
        console.error("Error updating total stock:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getOverviewStats = async (req, res) => {
    try {
        const [users, products, orders, revenue, carts, wishlistItems] = await Promise.all([
            User.count(),
            Product.count(),
            Order.count(),
            Transaction.sum('amount', { where: { status: 'completed' } }),
            Cart.count({ distinct: true, col: 'userId' }),
            Wishlist.count()
        ])

        res.json({ users, products, orders, revenue, carts, wishlistItems })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

exports.getSalesChart = async (req, res) => {
    try {
        const period = (req.query.period || 'monthly').toLowerCase()
        const now = new Date()

        let where = {}
        let dateFormat = '%Y-%m-%d' // default day buckets
        let groupExpr = `DATE_FORMAT(createdAt, '${dateFormat}')`

        if (period === 'daily') {
            // Today only
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
            const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
            where.createdAt = { [Op.gte]: start, [Op.lt]: end }
            dateFormat = '%Y-%m-%d' // single day bucket
            groupExpr = `DATE_FORMAT(createdAt, '${dateFormat}')`
        } else if (period === 'monthly') {
            // This month only (by day)
            const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0)
            where.createdAt = { [Op.gte]: start, [Op.lt]: end }
            dateFormat = '%Y-%m-%d' // daily buckets inside this month
            groupExpr = `DATE_FORMAT(createdAt, '${dateFormat}')`
        } else if (period === 'all') {
            // All time, group by month
            dateFormat = '%Y-%m'
            groupExpr = `DATE_FORMAT(createdAt, '${dateFormat}')`
            // no where filter
        } else {
            // fallback to monthly if unknown param
            const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0)
            where.createdAt = { [Op.gte]: start, [Op.lt]: end }
            dateFormat = '%Y-%m-%d'
            groupExpr = `DATE_FORMAT(createdAt, '${dateFormat}')`
        }

        const rows = await Order.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), dateFormat), 'date'],
                [fn('COUNT', col('id')), 'orders'],
                [fn('SUM', col('totalAmount')), 'revenue'],
            ],
            where,
            group: [literal(groupExpr)],
            order: [[literal('date'), 'ASC']],
            raw: true,
        })

        // normalize number types
        const salesData = rows.map(r => ({
            date: r.date,
            orders: Number(r.orders || 0),
            revenue: Number(r.revenue || 0),
        }))

        return res.json(salesData)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Server error', error: error.message })
    }
}

exports.getTopProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 5;

        // 1) Aggregate sales by productId
        const topRows = await OrderProduct.findAll({
            attributes: [
                'productId',
                [fn('SUM', col('quantity')), 'totalSold'],
                [fn('SUM', literal('quantity * price')), 'totalRevenue'],
            ],
            group: ['productId'],
            order: [[literal('totalSold'), 'DESC']],
            limit,
            raw: true,
        });

        if (!topRows.length) {
            return res.json([]);
        }

        // 2) Fetch product data in one shot
        const ids = topRows.map(r => r.productId);
        const products = await Product.findAll({
            where: { id: { [Op.in]: ids } },
            attributes: ['id', 'name', 'price', 'imageUrl', 'totalStock'],
            raw: true,
        });

        // Index products by id
        const productMap = new Map(products.map(p => [p.id, p]));

        // 3) Merge + keep original order
        const result = topRows.map(r => {
            const p = productMap.get(r.productId) || {};
            let imageUrl = p.imageUrl;

            // Normalize imageUrl (stringified JSON -> array)
            if (typeof imageUrl === 'string') {
                try { imageUrl = JSON.parse(imageUrl); } catch { /* keep as-is or set [] */ }
            }

            return {
                productId: r.productId,
                totalSold: Number(r.totalSold) || 0,
                totalRevenue: Number(r.totalRevenue) || 0,
                product: {
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    totalStock: p.totalStock,
                    imageUrl: imageUrl ?? [],
                },
            };
        });

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Transaction, attributes: ['amount', 'status'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        })

        res.json(orders)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

exports.getRecentReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: Product, attributes: ['name'] },
                { model: User, attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 5
        })

        res.json(reviews)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

exports.getOrderStatusSummary = async (req, res) => {
    try {
        const statuses = ['pending', 'delivery', 'delivered', 'completed', 'cancelled']
        const counts = {}

        for (const status of statuses) {
            counts[status] = await Order.count({ where: { status } })
        }

        res.json(counts)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

exports.exportOrdersAggregated = async (req, res) => {
    try {
        const {
            period = 'monthly',      // 'daily' | 'monthly'
            format = 'excel',        // 'excel' | 'pdf'
            start,
            end,
        } = req.query

        // Build date range (defaults)
        const endDate = end ? new Date(end) : new Date()
        const startDate = start
            ? new Date(start)
            : (period === 'daily'
                ? new Date(endDate.getTime() - 30 * 24 * 3600 * 1000) // last 30 days
                : new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1)) // last 12 months

        const dateFormat = period === 'daily' ? '%Y-%m-%d' : '%Y-%m'
        const labelTitle = period === 'daily' ? 'Date' : 'Month'

        // Aggregate orders by period (count + revenue)
        const rows = await Order.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), dateFormat), 'period'],
                [fn('COUNT', col('id')), 'orders'],
                [fn('SUM', col('totalAmount')), 'revenue'],
            ],
            where: {
                createdAt: {
                    [Op.gte]: startDate,
                    [Op.lt]: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1),
                },
            },
            group: [literal(`DATE_FORMAT(createdAt, '${dateFormat}')`)],
            order: [[literal('period'), 'ASC']],
            raw: true,
        })

        // Normalize numbers
        const data = rows.map(r => ({
            period: r.period,
            orders: Number(r.orders || 0),
            revenue: Number(r.revenue || 0),
        }))

        if (format === 'excel') {
            // ---------- Excel (xlsx) ----------
            const wb = new ExcelJS.Workbook()
            const ws = wb.addWorksheet('Orders')

            ws.columns = [
                { header: labelTitle, key: 'period', width: 16 },
                { header: 'Orders', key: 'orders', width: 12 },
                { header: 'Revenue', key: 'revenue', width: 16 },
            ]

            data.forEach(row => ws.addRow(row))

            // Total row
            ws.addRow({})
            ws.addRow({
                period: 'TOTAL',
                orders: data.reduce((a, b) => a + b.orders, 0),
                revenue: data.reduce((a, b) => a + b.revenue, 0),
            })

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', `attachment; filename="orders-${period}.xlsx"`)

            await wb.xlsx.write(res)
            return res.end()
        }

        // ---------- PDF ----------
        const doc = new PDFDocument({ margin: 40 })
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="orders-${period}.pdf"`)
        doc.pipe(res)

        doc.fontSize(16).text(`Orders (${period})`, { align: 'left' })
        doc.moveDown(0.3)
        doc.fontSize(10).fillColor('#666')
            .text(`Range: ${startDate.toISOString().slice(0,10)} to ${endDate.toISOString().slice(0,10)}`)
        doc.moveDown(0.8)
        doc.fillColor('black')

        // Table header
        const col1 = 40, col2 = 220, col3 = 340
        doc.fontSize(12).text(labelTitle, col1).text('Orders', col2).text('Revenue', col3)
        doc.moveTo(40, doc.y + 4).lineTo(560, doc.y + 4).stroke()
        doc.moveDown(0.4)

        // Rows
        doc.fontSize(11)
        data.forEach(r => {
            doc.text(r.period, col1)
                .text(String(r.orders), col2)
                .text(`${r.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, col3)
        })

        // Total
        doc.moveDown(0.5)
        doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke()
        doc.moveDown(0.4)
        const tOrders = data.reduce((a, b) => a + b.orders, 0)
        const tRevenue = data.reduce((a, b) => a + b.revenue, 0)
        doc.fontSize(12).text('TOTAL', col1)
            .text(String(tOrders), col2)
            .text(`${tRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, col3)

        doc.end()
    } catch (error) {
        console.error('exportOrdersAggregated error:', error)
        return res.status(500).json({ message: 'Server error', error: error.message })
    }
}

exports.getLowStock = async (req, res) => {
  try {
    // query params
    const per = (req.query.per || 'product').toLowerCase(); // 'product' | 'variant'
    const threshold = Number.isFinite(parseInt(req.query.threshold, 10))
      ? parseInt(req.query.threshold, 10)
      : 5;
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 10;
    const offset = (page - 1) * size;
    const limit = size;

    // optionally include user context to set wishlist/cart flags (just like your other APIs)
    const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;

    // optional flags
    const includeInactive = req.query.includeInactive === 'true';
    const recomputeTotal = req.query.recomputeTotal === 'true'; // if true, recompute product stock via SUM(variants.stock)

    if (per === 'variant') {
      // ----- Variant mode: list variants with stock < threshold -----
      const variantWhere = {
        stock: { [Op.lt]: threshold },
      };
      if (!includeInactive) {
        // treat null as active by default; only exclude explicit false
        variantWhere.isActive = { [Op.ne]: false };
      }

      const { rows, count } = await Variant.findAndCountAll({
        where: variantWhere,
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'price', 'imageUrl', 'totalStock', 'categoryId'],
            include: [{ model: Category, attributes: { exclude: [] } }],
          },
          {
            model: VariantAttribute,
            attributes: ['name', 'value'],
          },
          ...(userId
            ? [
                // cart/wishlist are product-scoped in your codebase; we’ll attach flags on the parent product
                {
                  model: Product,
                  attributes: [],
                  include: [
                    {
                      model: Wishlist,
                      as: 'Wishlists',
                      where: { userId },
                      attributes: ['id'],
                      required: false,
                    },
                    {
                      model: Cart,
                      where: { userId },
                      attributes: ['quantity'],
                      required: false,
                    },
                  ],
                },
              ]
            : []),
        ],
        order: [['stock', 'ASC'], ['id', 'ASC']],
        limit,
        offset,
        distinct: true,
      });

      const data = rows.map((v) => {
        const variant = v.toJSON();
        // normalize product imageUrl
        if (variant.Product) {
          if (typeof variant.Product.imageUrl === 'string') {
            try {
              variant.Product.imageUrl = JSON.parse(variant.Product.imageUrl);
            } catch {
              variant.Product.imageUrl = [];
            }
          }
          // basic flags if userId provided (best-effort)
          if (userId) {
            const productCarts = variant.Product.Carts || [];
            const productWishlists = variant.Product.Wishlists || [];
            variant.Product.isInCart = productCarts.length > 0;
            variant.Product.cartQuantity = variant.Product.isInCart ? productCarts[0].quantity : 0;
            variant.Product.isInWishlist = productWishlists.length > 0;
            delete variant.Product.Carts;
            delete variant.Product.Wishlists;
          }
        }
        return {
          variantId: variant.id,
          sku: variant.sku,
          title: variant.title,
          stock: variant.stock,
          price: variant.price,
          discountType: variant.discountType,
          discountValue: variant.discountValue,
          isPromotion: variant.isPromotion,
          attributes: (variant.VariantAttributes || []).map((a) => ({ name: a.name, value: a.value })),
          product: variant.Product || null,
        };
      });

      return res.status(200).json({
        mode: 'variant',
        threshold,
        data,
        pagination: {
          currentPage: page,
          pageSize: size,
          totalItems: count,
          totalPages: Math.ceil(count / size),
        },
      });
    }

    // ----- Product mode -----
    if (recomputeTotal) {
      // Compute SUM(variants.stock) and filter via HAVING
      const products = await Product.findAll({
        attributes: [
          'id',
          'name',
          'price',
          'imageUrl',
          'categoryId',
          [fn('COALESCE', fn('SUM', col('Variants.stock')), 0), 'computedTotalStock'],
        ],
        include: [
          { model: Category, attributes: { exclude: [] } },
          {
            model: Variant,
            attributes: [], // we only need the SUM
            ...(includeInactive ? {} : { where: { isActive: { [Op.ne]: false } }, required: false }),
          },
          ...(userId
            ? [
                {
                  model: Wishlist,
                  as: 'Wishlists',
                  where: { userId },
                  required: false,
                  attributes: ['id'],
                },
                {
                  model: Cart,
                  where: { userId },
                  required: false,
                  attributes: ['quantity'],
                },
              ]
            : []),
        ],
        group: ['Product.id', 'Category.id', ...(userId ? ['Wishlists.id', 'Carts.id'] : [])],
        having: sequelizeWhere(fn('COALESCE', fn('SUM', col('Variants.stock')), 0), { [Op.lt]: threshold }),
        order: [[literal('computedTotalStock'), 'ASC'], ['id', 'ASC']],
        limit,
        offset,
        subQuery: false,
      });

      // count for pagination: run a separate count query on ids
      const countRows = await Product.findAll({
        attributes: ['id'],
        include: [
          {
            model: Variant,
            attributes: [],
            ...(includeInactive ? {} : { where: { isActive: { [Op.ne]: false } }, required: false }),
          },
        ],
        group: ['Product.id'],
        having: sequelizeWhere(fn('COALESCE', fn('SUM', col('Variants.stock')), 0), { [Op.lt]: threshold }),
        raw: true,
      });

      const formatted = products.map((p) => {
        const prod = p.toJSON();
        if (typeof prod.imageUrl === 'string') {
          try {
            prod.imageUrl = JSON.parse(prod.imageUrl);
          } catch {
            prod.imageUrl = [];
          }
        }
        prod.category = prod.Category || null;
        delete prod.Category;
        if (userId) {
          prod.isInWishlist = (prod.Wishlists || []).length > 0;
          const carts = prod.Carts || [];
          prod.isInCart = carts.length > 0;
          prod.cartQuantity = prod.isInCart ? carts[0].quantity : 0;
          delete prod.Wishlists;
          delete prod.Carts;
        }
        // expose computed stock
        prod.totalStock = Number(prod.computedTotalStock || 0);
        delete prod.computedTotalStock;
        return prod;
      });

      return res.status(200).json({
        mode: 'product',
        recomputeTotal: true,
        threshold,
        data: formatted,
        pagination: {
          currentPage: page,
          pageSize: size,
          totalItems: countRows.length,
          totalPages: Math.ceil(countRows.length / size),
        },
      });
    } else {
      // Use Product.totalStock field (fast path)
      const where = { totalStock: { [Op.lt]: threshold } };

      const totalItems = await Product.count({ where });

      const products = await Product.findAll({
        where,
        include: [
          { model: Category, attributes: { exclude: [] } },
          ...(userId
            ? [
                {
                  model: Wishlist,
                  as: 'Wishlists',
                  where: { userId },
                  required: false,
                  attributes: ['id'],
                },
                {
                  model: Cart,
                  where: { userId },
                  required: false,
                  attributes: ['quantity'],
                },
              ]
            : []),
        ],
        order: [['totalStock', 'ASC'], ['id', 'ASC']],
        limit,
        offset,
      });

      const formatted = products.map((p) => {
        const prod = p.toJSON();
        if (typeof prod.imageUrl === 'string') {
          try {
            prod.imageUrl = JSON.parse(prod.imageUrl);
          } catch {
            prod.imageUrl = [];
          }
        }
        prod.category = prod.Category || null;
        delete prod.Category;
        if (userId) {
          prod.isInWishlist = (prod.Wishlists || []).length > 0;
          const carts = prod.Carts || [];
          prod.isInCart = carts.length > 0;
          prod.cartQuantity = prod.isInCart ? carts[0].quantity : 0;
          delete prod.Wishlists;
          delete prod.Carts;
        }
        return prod;
      });

      return res.status(200).json({
        mode: 'product',
        recomputeTotal: false,
        threshold,
        data: formatted,
        pagination: {
          currentPage: page,
          pageSize: size,
          totalItems,
          totalPages: Math.ceil(totalItems / size),
        },
      });
    }
  } catch (error) {
    console.error('getLowStock error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};