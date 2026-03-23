const rateLimit = require("express-rate-limit");

//  API rate limiter chung
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Quá nhiều request, vui lòng thử lại sau 15 phút",
    },
});

//  API rate limiter đăng nhập
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Không tính request thành công
    message: {
        success: false,
        message: "Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút",
    },
});

//  API rate limiter đăng ký
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Quá nhiều tài khoản được tạo từ IP này, vui lòng thử lại sau 1 giờ",
    },
});

module.exports = { apiLimiter, loginLimiter, registerLimiter };
