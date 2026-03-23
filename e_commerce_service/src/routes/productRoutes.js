const express = require("express");
const router = express.Router();
const {
    createProduct,
    getMyProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getAllProducts,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const { sellerOnly } = require("../middleware/sellerOnly");
const { writeLimiter } = require("../middleware/rateLimiter");

// Ai cũng có thể xem danh sách sản phẩm
router.get("/", getAllProducts);

// Lấy chi tiết sản phẩm
router.get("/:id", authMiddleware, getProductById);

// Seller xem sản phẩm của mình
router.get("/seller/my", authMiddleware, sellerOnly, getMyProducts);

// Seller tạo sản phẩm mới
router.post("/", authMiddleware, sellerOnly, writeLimiter, createProduct);

// Seller cập nhật sản phẩm 
router.put("/:id", authMiddleware, sellerOnly, writeLimiter, updateProduct);

// DELETE a product (soft delete, owner only)
router.delete("/:id", authMiddleware, sellerOnly, writeLimiter, deleteProduct);

module.exports = router;
