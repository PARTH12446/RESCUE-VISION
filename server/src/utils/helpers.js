// Define generic types for better type safety

// Generate pagination metadata
export const getPagination = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return { offset, limit };
};

// Generate pagination response with proper typing
export const getPaginationResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    
    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
    };
};

// Parse query parameters
export const parseQueryParams = (req) => {
    const {
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        status,
        type,
        severity
    } = req.query;

    return {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: search,
        status: status,
        type: type,
        severity: severity
    };
};

// Generate search conditions for SQL
export const generateSearchConditions = (search, fields) => {
    if (!search.trim()) return '';
    
    const conditions = fields.map(field => 
        `LOWER(${field}) LIKE LOWER('%${search.replace(/'/g, "''")}%')`
    );
    
    return `(${conditions.join(' OR ')})`;
};

// Generate filter conditions with proper typing
export const generateFilterConditions = (filters) => {
    const conditions = [];

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'string') {
                conditions.push(`${key} = '${value.replace(/'/g, "''")}'`);
            } else if (value instanceof Date) {
                conditions.push(`${key} = '${value.toISOString()}'`);
            } else {
                conditions.push(`${key} = ${value}`);
            }
        }
    });
    
    return conditions.length > 0 ? conditions.join(' AND ') : '';
};

// Generate sort SQL
export const generateSortSQL = (sortBy, sortOrder) => {
    const validSortFields = [
        'createdAt', 'updatedAt', 'timestamp', 
        'riskScore', 'probability', 'severity', 
        'name', 'type', 'location', 'affectedPopulation'
    ];
    const validOrder = ['asc', 'desc'];
    
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = validOrder.includes(sortOrder) ? sortOrder : 'desc';
    
    return `ORDER BY ${field} ${order}`;
};

// Calculate risk level based on probability and affected population
export const calculateRiskLevel = (probability, affectedPopulation) => {
    const riskScore = probability * (affectedPopulation / 1000000);
    
    if (riskScore > 7) return 'critical';
    if (riskScore > 5) return 'high';
    if (riskScore > 3) return 'moderate';
    return 'low';
};

// Format date to human readable
export const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Generate random ID
export const generateId = (prefix = '') => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}${random}`;
};

// Debounce function with proper typing
export const debounce = (func, wait) => {
    let timeout = null;
    
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Deep clone object with proper typing
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    
    const clonedObj = {};
    Object.keys(obj).forEach(key => {
        clonedObj[key] = deepClone(obj[key]);
    });
    
    return clonedObj;
};

// Check if object is empty
export const isEmpty = (obj) => {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj !== 'object') return false;
    return Object.keys(obj).length === 0;
};

// Safe parse JSON
export const safeParseJSON = (jsonString) => {
    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
};

// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/;
    return phoneRegex.test(phone);
};

// Sanitize input string
export const sanitizeInput = (input) => {
    return input
        .replace(/[<>]/g, '') // Remove HTML tags
        .trim()
        .substring(0, 5000); // Limit length
};

// Generate SQL safe value
export const toSqlValue = (value) => {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    
    if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`;
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    }
    
    if (value instanceof Date) {
        return `'${value.toISOString()}'`;
    }
    
    if (typeof value === 'object') {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    }
    
    return 'NULL';
};

// Delay function
export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate random number in range
export const randomInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Truncate string with ellipsis
export const truncateString = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
};

// Format number with commas
export const formatNumber = (num) => {
    return num.toLocaleString('en-IN');
};

// Calculate percentage
export const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
};

// Get current timestamp
export const getCurrentTimestamp = () => {
    return new Date().toISOString();
};

// Convert object to query string
export const objectToQueryString = (obj) => {
    const params = new URLSearchParams();
    
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });
    
    return params.toString();
};

// Parse query string to object
export const queryStringToObject = (queryString) => {
    const params = new URLSearchParams(queryString);
    const obj = {};
    
    params.forEach((value, key) => {
        obj[key] = value;
    });
    
    return obj;
};