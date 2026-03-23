require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 3002;


app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);


app.use("/products", productRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
    });
});


const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`\nE-commerce Service running on port ${PORT}`);
            console.log(`Auth Service  → ${process.env.AUTH_SERVICE_URL}`);
        });
    } catch (error) {
        console.error("Failed to start E-commerce Service:", error);
        process.exit(1);
    }
};

startServer();
