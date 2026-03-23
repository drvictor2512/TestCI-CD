const axios = require("axios");
const axiosRetry = require("axios-retry").default;

// Tạo axios instance với retry logic
const createRetryAxios = () => {
    const instance = axios.create({
        timeout: 10000, // 10 giây timeout
    });

    axiosRetry(instance, {
        retries: 3,
        retryDelay: (retryCount) => {
            // Exponential backoff: 3s, 4s, 5s
            const delay = Math.min(3000 + (retryCount - 1) * 1000, 5000);
            console.log(`[GATEWAY] Retry attempt ${retryCount}, waiting ${delay}ms...`);
            return delay;
        },
        retryCondition: (error) => {
            // Retry on network errors and 5xx server errors
            return (
                axiosRetry.isNetworkError(error) ||
                axiosRetry.isRetryableError(error) ||
                (error.response && error.response.status >= 500)
            );
        },
        onRetry: (retryCount, error, requestConfig) => {
            console.log(
                `[GATEWAY] Retrying request to ${requestConfig.url} (attempt ${retryCount}) due to: ${error.message}`
            );
        },
    });

    return instance;
};

module.exports = { createRetryAxios };
