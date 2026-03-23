const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            dbName: process.env.DB_NAME || "auth_db",
        });
        console.log(`Auth MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Auth MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

mongoose.connection.on("disconnected", () => {
    console.warn(" Auth MongoDB disconnected");
});


module.exports = connectDB;
