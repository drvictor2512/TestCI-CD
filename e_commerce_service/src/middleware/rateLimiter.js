const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút",
    },
});

// Giới hạn cho các thao tác ghi (tạo/cập nhật/xóa)
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Quá nhiều yêu cầu ghi, vui lòng thử lại sau 15 phút",
    },
});

module.exports = { apiLimiter, writeLimiter };
