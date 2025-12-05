// Types for Disaster Management System - JavaScript version

// Constants for enums
const DisasterType = {
    EARTHQUAKE: 'earthquake',
    FLOOD: 'flood',
    HURRICANE: 'hurricane',
    WILDFIRE: 'wildfire',
    TSUNAMI: 'tsunami',
    DROUGHT: 'drought',
    LANDSLIDE: 'landslide'
};

const SeverityLevel = {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high',
    CRITICAL: 'critical'
};

const ResourceType = {
    MEDICAL: 'medical',
    FOOD: 'food',
    SHELTER: 'shelter',
    RESCUE: 'rescue',
    TRANSPORT: 'transport',
    COMMUNICATION: 'communication',
    SPECIALIZED: 'specialized'
};

const ResourceStatus = {
    AVAILABLE: 'available',
    DEPLOYED: 'deployed',
    IN_TRANSIT: 'in-transit',
    MAINTENANCE: 'maintenance',
    RESERVED: 'reserved'
};

const AlertStatus = {
    ACTIVE: 'active',
    RESOLVED: 'resolved',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
};

// Validation functions
function isValidCoordinates(coords) {
    if (!coords || typeof coords !== 'object') return false;
    if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return false;
    if (coords.lat < -90 || coords.lat > 90) return false;
    if (coords.lng < -180 || coords.lng > 180) return false;
    return true;
}

function isValidDisasterType(type) {
    return Object.values(DisasterType).includes(type);
}

function isValidSeverityLevel(severity) {
    return Object.values(SeverityLevel).includes(severity);
}

function isValidResourceType(type) {
    return Object.values(ResourceType).includes(type);
}

function isValidResourceStatus(status) {
    return Object.values(ResourceStatus).includes(status);
}

function isValidAlertStatus(status) {
    return Object.values(AlertStatus).includes(status);
}

// Example structure functions
function createDisasterPrediction(data) {
    return {
        id: data.id || '',
        type: data.type || DisasterType.EARTHQUAKE,
        location: data.location || '',
        coordinates: data.coordinates || { lat: 0, lng: 0 },
        probability: data.probability || 0,
        severity: data.severity || SeverityLevel.LOW,
        predictedTime: data.predictedTime || new Date(),
        affectedPopulation: data.affectedPopulation || 0,
        riskScore: data.riskScore || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date()
    };
}

function createResource(data) {
    return {
        id: data.id || '',
        type: data.type || ResourceType.MEDICAL,
        name: data.name || '',
        quantity: data.quantity || 0,
        available: data.available || 0,
        location: data.location || '',
        status: data.status || ResourceStatus.AVAILABLE,
        description: data.description || '',
        lastUpdated: data.lastUpdated || new Date(),
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date()
    };
}

function createAlert(data) {
    return {
        id: data.id || '',
        type: data.type || DisasterType.EARTHQUAKE,
        severity: data.severity || SeverityLevel.LOW,
        title: data.title || '',
        message: data.message || '',
        timestamp: data.timestamp || new Date(),
        isRead: data.isRead !== undefined ? data.isRead : false,
        location: data.location || '',
        status: data.status || AlertStatus.ACTIVE,
        createdAt: data.createdAt || new Date()
    };
}

function createDashboardStats(data) {
    return {
        activeAlerts: data.activeAlerts || 0,
        predictedDisasters: data.predictedDisasters || 0,
        resourcesDeployed: data.resourcesDeployed || 0,
        populationAtRisk: data.populationAtRisk || 0,
        responseTeams: data.responseTeams || 0,
        successRate: data.successRate || 0
    };
}

// Validation for complete objects
function validateDisasterPrediction(prediction) {
    const errors = [];
    
    if (!prediction.id) errors.push('Missing id');
    if (!isValidDisasterType(prediction.type)) errors.push('Invalid disaster type');
    if (!prediction.location) errors.push('Missing location');
    if (!isValidCoordinates(prediction.coordinates)) errors.push('Invalid coordinates');
    if (prediction.probability < 0 || prediction.probability > 1) errors.push('Probability must be between 0 and 1');
    if (!isValidSeverityLevel(prediction.severity)) errors.push('Invalid severity level');
    if (!prediction.predictedTime || !(prediction.predictedTime instanceof Date)) errors.push('Invalid predicted time');
    if (prediction.affectedPopulation < 0) errors.push('Affected population cannot be negative');
    if (prediction.riskScore < 0 || prediction.riskScore > 10) errors.push('Risk score must be between 0 and 10');
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Export everything
module.exports = {
    // Enums
    DisasterType,
    SeverityLevel,
    ResourceType,
    ResourceStatus,
    AlertStatus,
    
    // Validation functions
    isValidCoordinates,
    isValidDisasterType,
    isValidSeverityLevel,
    isValidResourceType,
    isValidResourceStatus,
    isValidAlertStatus,
    
    // Creation functions
    createDisasterPrediction,
    createResource,
    createAlert,
    createDashboardStats,
    
    // Validation functions for objects
    validateDisasterPrediction
};