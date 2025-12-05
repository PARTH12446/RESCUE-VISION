// Type declarations for the application - JavaScript version

// No type declarations needed in JavaScript
// The following are just for documentation purposes

// Note: In JavaScript, we don't have interface declarations.
// The Express request extension happens in middleware.

// For API responses, we'll use plain objects with consistent structure
const createApiResponse = (data, success = true, message = '', error = '') => {
    return {
        success,
        data,
        error,
        message,
        timestamp: new Date().toISOString()
    };
};

// For paginated responses
const createPaginatedResponse = (data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    
    return {
        success: true,
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: Number(total),
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        },
        timestamp: new Date().toISOString()
    };
};

// For error responses
const createErrorResponse = (error, details = null, path = '', method = '') => {
    return {
        success: false,
        error: error.message || String(error),
        details,
        timestamp: new Date().toISOString(),
        path,
        method
    };
};

// Middleware to extend Express Request type
const extendRequest = (req, res, next) => {
    // This is where you would add user property to request
    // The actual implementation is in your auth middleware
    next();
};

// Export utility functions
module.exports = {
    createApiResponse,
    createPaginatedResponse,
    createErrorResponse,
    extendRequest
};

// If using ES modules:
// export { createApiResponse, createPaginatedResponse, createErrorResponse, extendRequest };