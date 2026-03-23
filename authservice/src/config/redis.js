const Redis = require("ioredis");

let redisClient = null;

const connectRedis = () => {
    redisClient = new Redis(process.env.REDIS_URL || "redis://redis:6379", {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times) => {
            const delay = Math.min(times * 500, 5000);
            console.log(`Redis reconnecting in ${delay}ms...`);
            return delay;
        },
    });

    redisClient.on("connect", () => {
        console.log("Redis connected");
    });

    redisClient.on("error", (err) => {
        console.error(`Redis error: ${err.message}`);
    });

    return redisClient;
};

const getRedis = () => {
    if (!redisClient) {
        throw new Error("Redis not initialized. Call connectRedis() first.");
    }
    return redisClient;
};

module.exports = { connectRedis, getRedis };
