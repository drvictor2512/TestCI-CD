const rateLimit = require("express-rate-limit");

// Giới hạn cho tất cả các route
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút",
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

// Giới hạn cho auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút",
  },
});

module.exports = { globalLimiter, authLimiter };
