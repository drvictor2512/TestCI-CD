require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { globalLimiter, authLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:3001";
const ECOMMERCE_SERVICE_URL = process.env.ECOMMERCE_SERVICE_URL || "http://ecommerce-service:3002";

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Áp dụng global rate limiter cho tất cả các request
app.use(globalLimiter);

// Proxy Options
const proxyOptions = (target, pathRewrite) => ({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
        error: (err, req, res) => {
            console.error(`[GATEWAY] Proxy error: ${err.message}`);
            res.status(502).json({
                success: false,
                message: "Service temporarily unavailable. Please try again later.",
                error: process.env.NODE_ENV === "development" ? err.message : undefined,
            });
        },
        proxyReq: (proxyReq, req) => {
            console.log(`[GATEWAY] → ${req.method} ${req.url} → ${target}`);
            proxyReq.setHeader("X-Forwarded-For", req.ip);
            proxyReq.setHeader("X-Gateway-Request", "true");
        },
        proxyRes: (proxyRes, req) => {
            console.log(`[GATEWAY] ← ${proxyRes.statusCode} ${req.url}`);
        },
    },
});

// Auth Service Proxy
// Áp dụng rate limiter cho auth endpoints
app.use(
    "/api/auth",
    authLimiter,
    createProxyMiddleware(
        proxyOptions(AUTH_SERVICE_URL, { "^/api/auth": "/auth" })
    )
);

// E-commerce Service Proxy
app.use(
    "/api/products",
    createProxyMiddleware(
        proxyOptions(ECOMMERCE_SERVICE_URL, { "^/api/products": "/products" })
    )
);

app.use(
    "/api/categories",
    createProxyMiddleware(
        proxyOptions(ECOMMERCE_SERVICE_URL, { "^/api/categories": "/categories" })
    )
);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
    });
});

app.listen(PORT, () => {
    console.log(`\nAPI Gateway running on port ${PORT}`);
    console.log(`Auth Service: ${AUTH_SERVICE_URL}`);
    console.log(`E-commerce: ${ECOMMERCE_SERVICE_URL}`);
});
