const retryAxios = require("../utils/retry");

const API_GATEWAY_URL =
    process.env.API_GATEWAY_URL || "http://api-gateway:3000";

// Auth middleware cho E-commerce Service.
// Xác thực JWT bằng cách gọi endpoint /api/auth/verify qua API Gateway.
// Sử dụng axios với retry logic (3 attempts, 3-5s backoff).
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        // Gửi token đến Auth Service qua API Gateway để xác thực
        const response = await retryAxios.get(`${API_GATEWAY_URL}/api/auth/verify`, {
            headers: {
                Authorization: authHeader,
                "X-Internal-Service": "ecommerce-service",
            },
        });

        if (!response.data.success) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        // Gán thông tin user đã xác thực vào request
        req.user = response.data.data;
        next();
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            return res.status(status).json({
                success: false,
                message: data.message || "Authentication failed",
            });
        }

        // Lỗi mạng - API Gateway không thể truy cập
        console.error("[ECOMMERCE] API Gateway unreachable:", error.message);
        return res.status(503).json({
            success: false,
            message: "Authentication service unavailable. Please try again later.",
        });
    }
};

module.exports = authMiddleware;
