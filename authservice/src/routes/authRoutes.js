const express = require("express");
const router = express.Router();
const {
    register,
    login,
    refreshToken,
    getMe,
    verifyToken,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");

// Public Routes
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshToken);

// Protected Routes
router.get("/me", authMiddleware, getMe);

// Internal Routes (called by other microservices)
router.get("/verify", authMiddleware, verifyToken);

module.exports = router;
