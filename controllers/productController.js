const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review")

exports.createProduct = async (req, res) => {
  try {
    const { categoryId, reviewId, name, description, price, stock, imageUrl } = req.body;

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
      reviewId: reviewId || null, // ✅ If no reviewId provided, set to null
      name,
      description,
      price,
      stock,
      imageUrl,
    });

    return res.status(201).json({ message: "Product created successfully", product });

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getAllProduct = async (req, res)=> {
    try{
        const product = await Product.findAll()
        res.status(200).json({
            success: true,
            product : product
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error,
        })
    }
};

exports.getProductById = async (req, res) =>{
    try {
        const { id } = req.body; // Get id from URL parameters
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
