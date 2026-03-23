const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        // 1. Lấy token từ header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        const token = authHeader.split(" ")[1];

        // 2. Xác minh JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Gắn thông tin user vào request
        req.user = decoded;
        req.token = token;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please refresh your token.",
            });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }
        next(error);
    }
};

module.exports = authMiddleware;
