const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            dbName: process.env.DB_NAME || "ecommerce_db",
        });
        console.log(`E-commerce MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`E-commerce MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

mongoose.connection.on("disconnected", () => {
    console.warn("E-commerce MongoDB disconnected");
});

module.exports = connectDB;
