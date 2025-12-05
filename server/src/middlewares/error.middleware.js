export const requestLogger = (req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] 📥 ${req.method} ${req.url}`);
    
    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusIcon = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
        console.log(`[${new Date().toISOString()}] 📤 ${statusIcon} ${req.method} ${req.url} - ${status} (${duration}ms)`);
    });
    
    next();
};

export const responseLogger = (req, res, next) => {
    // You can add additional response logging here if needed
    next();
};

export const errorLogger = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] 🚨 ERROR:`, {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next(err);
};

// Helper to wrap async route handlers and forward errors to Express
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler used as the final non-error middleware in server.js
export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Resource not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    });
};

// Global error handler used at the end of the middleware chain
export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
    });
};

export default { requestLogger, responseLogger, errorLogger, asyncHandler, notFound, errorHandler };