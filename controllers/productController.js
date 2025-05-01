const Product = require("../models/Product");
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

exports.createProduct = async (req, res) => {
    try {
        const { categoryId, reviewId, name, description, price, variants, review, relatedProductIds } = req.body;
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

// Save related products (store only the IDs in the join table)
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

// Fetch related products via association
        const relatedProducts = await product.getRelatedProducts({
            attributes: ['id'],
        });
        const relatedProductIdsResult = relatedProducts.map(p => p.id);

// Build response
        const response = {
            product: {
                productId: updatedProduct.id,
                name: updatedProduct.name,
                description: updatedProduct.description,
                price: updatedProduct.price,
                stock: updatedProduct.totalStock,
                imageUrl: imageArray,
                categoryId: updatedProduct.categoryId,
                reviews: reviews.length > 0 ? reviews : [],
                variants: productVariant.length > 0 ? productVariant : [],
                relatedProductIds: relatedProductIdsResult
            }
        };

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
        const products = await Product.findAll({
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name']
                },
                {
                    model: Variant,
                    include: {
                        model: VariantAttribute,
                        attributes: ['name', 'value']
                    }
                },
                {
                    model: Review,
                    attributes: ['id', 'rating', 'comment'],
                    required: false
                },
                {
                    model: Product,
                    as: 'RelatedProducts',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
        return res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, price, stock, imageUrl, relatedProductIds } = req.body;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update main product info
        await product.update({
            name: name ?? product.name,
            description: description ?? product.description,
            price: price ?? product.price,
            stock: stock ?? product.stock,
            imageUrl: imageUrl ?? product.imageUrl
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

        // Fetch updated related products
        const relatedProducts = await product.getRelatedProducts({ attributes: ['id', 'name'] });

        return res.status(200).json({
            message: "Product updated successfully",
            product: {
                ...product.toJSON(),
                relatedProducts
            }
        });

    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Product ID:", id);

        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    attributes: ['id'],
                },
                {
                    model: Variant,
                    attributes: ['id', 'productId', 'sku', 'price', 'stock'],
                    include: [{
                        model: VariantAttribute,
                        attributes: ['name', 'value']
                    }]
                },
                {
                    model: Review,
                    attributes: ['id', 'rating', 'comment'],
                    required: false,
                }
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const reviews = product.Reviews?.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment
        })) || [];

        const variants = product.Variants?.map(variant => ({
            id: variant.id,
            productId: variant.productId,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            attributes: variant.VariantAttributes?.map(attr => ({
                name: attr.name,
                value: attr.value
            })) || []
        })) || [];

        const response = {
            product: {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                imageUrl: product.imageUrl,
                categoryId: product.categoryId,
                reviews,
                variants
            }
        };

        res.status(200).json(response);
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

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Optional: Delete related data (variants, related products, etc.)
        await Variant.destroy({ where: { productId } }); // if you have variants
        await RelatedProduct.destroy({ where: { productId } }); // one side
        await RelatedProduct.destroy({ where: { relatedProductId: productId } }); // other side

        // Delete the product
        await product.destroy();

        return res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


