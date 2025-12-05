// Validation middleware
export const validateRequest = (schema) => {
    return (req, res, next) => {
        const errors = [];
        
        // Validate each field in schema
        Object.keys(schema).forEach(key => {
            const fieldSchema = schema[key];
            const value = req.body[key];
            
            // Check required fields
            if (fieldSchema.required && (value === undefined || value === null)) {
                errors.push(`${key} is required`);
                return;
            }
            
            if (value !== undefined && value !== null) {
                // Type validation
                if (fieldSchema.type === 'string' && typeof value !== 'string') {
                    errors.push(`${key} must be a string`);
                } else if (fieldSchema.type === 'number' && typeof value !== 'number') {
                    errors.push(`${key} must be a number`);
                }
                
                // Min/Max validation
                if (fieldSchema.min !== undefined && value < fieldSchema.min) {
                    errors.push(`${key} must be at least ${fieldSchema.min}`);
                }
                if (fieldSchema.max !== undefined && value > fieldSchema.max) {
                    errors.push(`${key} must be at most ${fieldSchema.max}`);
                }
                
                // Length validation
                if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
                    errors.push(`${key} must be at least ${fieldSchema.minLength} characters`);
                }
                if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
                    errors.push(`${key} must be at most ${fieldSchema.maxLength} characters`);
                }
                
                // Enum validation
                if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
                    errors.push(`${key} must be one of: ${fieldSchema.enum.join(', ')}`);
                }
            }
        });
        
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
};

// Coordinate validation
export const validateCoordinates = (coordinates) => {
    if (!coordinates || typeof coordinates !== 'object') return false;
    if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') return false;
    if (coordinates.lat < -90 || coordinates.lat > 90) return false;
    if (coordinates.lng < -180 || coordinates.lng > 180) return false;
    return true;
};

// Future date validation
export const validateFutureDate = (date) => {
    return new Date(date) > new Date();
};

// Email validation
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone validation
export const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/;
    return phoneRegex.test(phone);
};

// URL validation
export const validateUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Validation schemas
export const validationSchemas = {
    prediction: {
        type: {
            type: 'string',
            enum: ['earthquake', 'flood', 'hurricane', 'wildfire', 'tsunami', 'drought', 'landslide'],
            required: true
        },
        location: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            required: true
        },
        probability: {
            type: 'number',
            min: 0,
            max: 1,
            required: true
        },
        severity: {
            type: 'string',
            enum: ['low', 'moderate', 'high', 'critical'],
            required: true
        },
        affectedPopulation: {
            type: 'number',
            min: 0,
            required: true
        },
        riskScore: {
            type: 'number',
            min: 0,
            max: 10,
            required: true
        }
    },
    
    resource: {
        type: {
            type: 'string',
            enum: ['medical', 'food', 'shelter', 'rescue', 'transport', 'communication', 'specialized'],
            required: true
        },
        name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            required: true
        },
        quantity: {
            type: 'number',
            min: 0,
            required: true
        },
        available: {
            type: 'number',
            min: 0,
            required: true
        }
    },
    
    alert: {
        type: {
            type: 'string',
            enum: ['earthquake', 'flood', 'hurricane', 'wildfire', 'tsunami', 'drought', 'landslide'],
            required: true
        },
        severity: {
            type: 'string',
            enum: ['low', 'moderate', 'high', 'critical'],
            required: true
        },
        title: {
            type: 'string',
            minLength: 5,
            maxLength: 200,
            required: true
        },
        message: {
            type: 'string',
            minLength: 10,
            required: true
        },
        location: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            required: true
        }
    }
};