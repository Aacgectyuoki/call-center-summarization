/**
 * Middleware to log request execution time.
 */
const timerMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[${req.method}] ${req.originalUrl} - ${duration}ms`);
    });

    next();
};

module.exports = timerMiddleware;
