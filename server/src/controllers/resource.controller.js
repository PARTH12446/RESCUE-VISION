import { dataService } from '../services/DataService.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export class ResourceController {
    
    // Get all resources
    static getResources = asyncHandler(async (req, res) => {
        const result = await dataService.getResources();
        if (result.success && result.data) {
            // Return plain array so frontend receives [] and can call resources.map
            return res.status(200).json(result.data);
        }

        // On failure, keep the existing error structure
        return res.status(400).json(result);
    });

    // Get single resource by ID
    static getResourceById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await dataService.getResourceById(id);
        return res.status(result.success ? 200 : 404).json(result);
    });

    // Create new resource
    static createResource = asyncHandler(async (req, res) => {
        const resourceData = req.body;
        
        // Validate required fields
        if (!resourceData.type || !resourceData.name || resourceData.quantity === undefined) {
            const response = {
                success: false,
                message: 'Missing required fields: type, name, quantity',
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        const result = await dataService.createResource(resourceData);
        return res.status(result.success ? 201 : 400).json(result);
    });

    // Update resource
    static updateResource = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;
        
        const result = await dataService.updateResource(id, updates);
        return res.status(result.success ? 200 : 404).json(result);
    });

    // Delete resource
    static deleteResource = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await dataService.deleteResource(id);
        return res.status(result.success ? 200 : 404).json(result);
    });

    // Update resource availability
    static updateResourceAvailability = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { available } = req.body;
        
        if (available === undefined || typeof available !== 'number') {
            const response = {
                success: false,
                message: 'Available quantity is required and must be a number',
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        const result = await dataService.updateResource(id, { available });
        return res.status(result.success ? 200 : 404).json(result);
    });

    // Get resources by type
    static getResourcesByType = asyncHandler(async (req, res) => {
        const { type } = req.params;
        const result = await dataService.getResources();
        
        if (result.success && result.data) {
            const filteredResources = result.data.filter(resource => 
                resource.type.toLowerCase() === type.toLowerCase()
            );
            
            const response = {
                success: true,
                data: filteredResources,
                message: `Found ${filteredResources.length} resources of type ${type}`,
                timestamp: new Date()
            };
            
            return res.status(200).json(response);
        }
        
        // Return the original error result
        return res.status(400).json(result);
    });
}