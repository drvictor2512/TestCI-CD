// Middleware đảm bảo chỉ seller mới có thể truy cập một số endpoint nhất định.
const sellerOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    if (req.user.role !== "seller") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Only sellers can perform this action.",
        });
    }

    next();
};

// Kiểm tra user có phải admin không
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }
    next();
};

module.exports = { sellerOnly, adminOnly };
