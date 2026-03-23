const Product = require("../models/Product");
const Category = require("../models/Category");

// ─── Helper: check product ownership ─────────────────────────────────────────
const checkOwnership = async (productId, sellerId) => {
    const product = await Product.findById(productId);
    if (!product) return { error: "Product not found", status: 404 };
    if (product.sellerId.toString() !== sellerId.toString()) {
        return { error: "Access denied. You can only manage your own products.", status: 403 };
    }
    return { product };
};

// ─── POST /products ───────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
    const { categoryId, ...rest } = req.body;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) {
        return res.status(400).json({
            success: false,
            message: "Category not found or inactive",
        });
    }

    const product = await Product.create({
        ...rest,
        categoryId,
        sellerId: req.user.userId,
        sellerName: req.user.name,
    });

    await product.populate("categoryId", "name slug");

    res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: { product },
    });
};

// ─── GET /products/my ─────────────────────────────────────────────────────────
const getMyProducts = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sort = "-createdAt",
        isActive,
        search,
    } = req.query;

    const filter = { sellerId: req.user.userId };

    // Optional filters
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate("categoryId", "name slug")
            .sort(sort)
            .skip(skip)
            .limit(limitNum),
        Product.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: {
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        },
    });
};

// ─── GET /products/:id ────────────────────────────────────────────────────────
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id).populate(
        "categoryId",
        "name slug"
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    // Sellers can see their inactive products; public cannot
    if (!product.isActive && product.sellerId.toString() !== req.user?.userId?.toString()) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    res.status(200).json({
        success: true,
        data: { product },
    });
};

// ─── PUT /products/:id ────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
    const { error, product } = await checkOwnership(
        req.params.id,
        req.user.userId
    );
    if (error) return res.status(400).json({ success: false, message: error });

    // Validate new categoryId if provided
    if (req.body.categoryId) {
        const category = await Category.findById(req.body.categoryId);
        if (!category || !category.isActive) {
            return res.status(400).json({
                success: false,
                message: "Category not found or inactive",
            });
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    ).populate("categoryId", "name slug");

    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: { product: updatedProduct },
    });
};

// ─── DELETE /products/:id ─────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
    const { error } = await checkOwnership(req.params.id, req.user.userId);
    if (error) {
        return res
            .status(error === "Product not found" ? 404 : 403)
            .json({ success: false, message: error });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
};

// ─── GET /products (public - all active products) ─────────────────────────────
const getAllProducts = async (req, res) => {
    const {
        page = 1,
        limit = 12,
        sort = "-createdAt",
        categoryId,
        minPrice,
        maxPrice,
        search,
        sellerId,
    } = req.query;

    const filter = { isActive: true };
    if (categoryId) filter.categoryId = categoryId;
    if (sellerId) filter.sellerId = sellerId;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate("categoryId", "name slug")
            .sort(sort)
            .skip(skip)
            .limit(limitNum),
        Product.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: {
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        },
    });
};

module.exports = {
    createProduct,
    getMyProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getAllProducts,
};
