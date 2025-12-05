// Auth middleware used by server.js
// Currently implemented as no-ops so the backend can run
// without real authentication. You can extend these later.

export const AuthMiddleware = {
  // Generic request validation/auth placeholder
  validateRequest: (req, res, next) => {
    next();
  },

  // API key auth placeholder
  apiKeyAuth: (req, res, next) => {
    next();
  },

  // Development-only mock authentication
  mockAuthenticate: (req, res, next) => {
    if (!req.user) {
      req.user = { id: 'mock-user', role: 'admin' };
    }
    next();
  },

  // Role-based authorization placeholder
  authorize: (...roles) => {
    return (req, res, next) => {
      // In the future you can restrict based on req.user.role and roles
      next();
    };
  },
};

export default AuthMiddleware;