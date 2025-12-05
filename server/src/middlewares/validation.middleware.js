import { validateCoordinates, validateFutureDate } from '../utils/validators.js';

export class ValidationMiddleware {
    
    // Validate prediction data
    static validatePrediction = (req, res, next) => {
        const { type, location, coordinates, probability, severity, predictedTime, affectedPopulation } = req.body;
        const errors = [];

        // Required fields
        if (!type) errors.push('Type is required');
        if (!location) errors.push('Location is required');
        if (!coordinates) errors.push('Coordinates are required');
        if (probability === undefined) errors.push('Probability is required');
        if (!severity) errors.push('Severity is required');
        if (!predictedTime) errors.push('Predicted time is required');
        if (affectedPopulation === undefined) errors.push('Affected population is required');

        // Type validations
        if (probability !== undefined && (probability < 0 || probability > 1)) {
            errors.push('Probability must be between 0 and 1');
        }

        if (affectedPopulation !== undefined && affectedPopulation < 0) {
            errors.push('Affected population must be positive');
        }

        if (coordinates && !validateCoordinates(coordinates)) {
            errors.push('Invalid coordinates format');
        }

        if (predictedTime && !validateFutureDate(new Date(predictedTime))) {
            errors.push('Predicted time must be in the future');
        }

        if (errors.length > 0) {
            const response = {
                success: false,
                message: 'Validation failed',
                error: errors.join(', '),
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        return next();
    };

    // Validate resource data
    static validateResource = (req, res, next) => {
        const { type, name, quantity, available } = req.body;
        const errors = [];

        if (!type) errors.push('Type is required');
        if (!name) errors.push('Name is required');
        if (quantity === undefined) errors.push('Quantity is required');
        if (available === undefined) errors.push('Available quantity is required');

        if (quantity !== undefined && quantity < 0) {
            errors.push('Quantity must be positive');
        }

        if (available !== undefined && available < 0) {
            errors.push('Available quantity must be positive');
        }

        if (quantity !== undefined && available !== undefined && available > quantity) {
            errors.push('Available quantity cannot exceed total quantity');
        }

        if (errors.length > 0) {
            const response = {
                success: false,
                message: 'Validation failed',
                error: errors.join(', '),
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        return next();
    };

    // Validate alert data
    static validateAlert = (req, res, next) => {
        const { type, severity, title, message, location } = req.body;
        const errors = [];

        if (!type) errors.push('Type is required');
        if (!severity) errors.push('Severity is required');
        if (!title) errors.push('Title is required');
        if (!message) errors.push('Message is required');
        if (!location) errors.push('Location is required');

        if (title && title.length < 5) {
            errors.push('Title must be at least 5 characters');
        }

        if (message && message.length < 10) {
            errors.push('Message must be at least 10 characters');
        }

        if (errors.length > 0) {
            const response = {
                success: false,
                message: 'Validation failed',
                error: errors.join(', '),
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        return next();
    };

    // Validate report data
    static validateReport = (req, res, next) => {
        const { type, severity, title, description, location } = req.body;
        const errors = [];

        if (!type) errors.push('Type is required');
        if (!severity) errors.push('Severity is required');
        if (!title) errors.push('Title is required');
        if (!description) errors.push('Description is required');
        if (!location) errors.push('Location is required');

        if (title && title.length < 5) {
            errors.push('Title must be at least 5 characters');
        }

        if (description && description.length < 10) {
            errors.push('Description must be at least 10 characters');
        }

        if (errors.length > 0) {
            const response = {
                success: false,
                message: 'Validation failed',
                error: errors.join(', '),
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        return next();
    };

    // Validate ID parameter
    static validateId = (req, res, next) => {
        const { id } = req.params;
        
        if (!id || id.trim() === '') {
            const response = {
                success: false,
                message: 'ID parameter is required',
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        return next();
    };

    // Validate pagination parameters
    static validatePagination = (req, res, next) => {
        const { page, limit } = req.query;
        const errors = [];

        if (page && (isNaN(Number(page)) || Number(page) < 1)) {
            errors.push('Page must be a positive number');
        }

        if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
            errors.push('Limit must be between 1 and 100');
        }

        if (errors.length > 0) {
            const response = {
                success: false,
                message: 'Validation failed',
                error: errors.join(', '),
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        return next();
    };
}