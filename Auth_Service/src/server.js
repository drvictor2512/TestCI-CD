require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiLimiter);
app.use("/auth", authRoutes);

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
            console.log(`\n Auth Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start Auth Service:", error);
        process.exit(1);
    }
};

startServer();
