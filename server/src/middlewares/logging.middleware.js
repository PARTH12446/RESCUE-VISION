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

export default { requestLogger, responseLogger, errorLogger };