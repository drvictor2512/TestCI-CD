const axios = require("axios");
const axiosRetry = require("axios-retry").default;

// Tạo axios instance với retry logic
// Retry 3 lần với khoảng thời gian tăng dần từ 3-5 giây
// Dùng khi gọi Auth Service để verify tokens
const createRetryAxios = () => {
    const instance = axios.create({
        timeout: 8000,
    });

    axiosRetry(instance, {
        retries: 3,
        retryDelay: (retryCount) => {
            // Backoff: 3s → 4s → 5s
            const delay = Math.min(3000 + (retryCount - 1) * 1000, 5000);
            console.log(
                `[ECOMMERCE] Retry attempt ${retryCount}, waiting ${delay}ms before retrying Auth Service...`
            );
            return delay;
        },
        retryCondition: (error) => {
            return (
                axiosRetry.isNetworkError(error) ||
                axiosRetry.isRetryableError(error) ||
                (error.response && error.response.status >= 500)
            );
        },
        onRetry: (retryCount, error, requestConfig) => {
            console.log(
                `[ECOMMERCE] Retrying ${requestConfig.url} (attempt ${retryCount}): ${error.message}`
            );
        },
    });

    return instance;
};

// Singleton instance
const retryAxios = createRetryAxios();

module.exports = retryAxios;
