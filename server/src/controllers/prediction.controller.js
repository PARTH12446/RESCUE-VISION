import { dataService } from '../services/DataService.js';
import { parseQueryParams } from '../utils/helpers.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export class PredictionController {
    
    // Get all predictions
    static getPredictions = asyncHandler(async (req, res) => {
        const result = await dataService.getPredictions();
        return res.status(result.success ? 200 : 400).json(result);
    });

    // Get single prediction by ID
    static getPredictionById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await dataService.getPredictionById(id);
        return res.status(result.success ? 200 : 404).json(result);
    });

    // Create new prediction
    static createPrediction = asyncHandler(async (req, res) => {
        const predictionData = req.body;
        
        // Validate required fields
        if (!predictionData.type || !predictionData.location || !predictionData.coordinates) {
            const response = {
                success: false,
                message: 'Missing required fields: type, location, coordinates',
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        const result = await dataService.createPrediction(predictionData);
        return res.status(result.success ? 201 : 400).json(result);
    });

    // Update prediction
    static updatePrediction = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;
        
        const result = await dataService.updatePrediction(id, updates);
        return res.status(result.success ? 200 : 404).json(result);
    });

    // Delete prediction
    static deletePrediction = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await dataService.deletePrediction(id);
        return res.status(result.success ? 200 : 404).json(result);
    });

    // Search predictions
    static searchPredictions = asyncHandler(async (req, res) => {
        const { search } = parseQueryParams(req);
        
        // Fix: Provide default empty string if search is undefined
        const searchQuery = search || '';
        const result = await dataService.search(searchQuery);
        
        const response = {
            success: true,
            data: {
                data: result.data?.predictions || [],
                total: result.data?.predictions?.length || 0,
                page: 1,
                limit: 10,
                totalPages: Math.ceil((result.data?.predictions?.length || 0) / 10)
            },
            timestamp: new Date()
        };
        
        return res.status(200).json(response);
    });
}