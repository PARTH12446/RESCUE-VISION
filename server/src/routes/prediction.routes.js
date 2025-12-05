import { Router } from 'express';
import { PredictionController } from '../controllers/prediction.controller.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = Router();

// Get all predictions
router.get('/', PredictionController.getPredictions);

// Get single prediction
router.get('/:id', 
    ValidationMiddleware.validateId,
    PredictionController.getPredictionById
);

// Create prediction
router.post('/', 
    ValidationMiddleware.validatePrediction,
    PredictionController.createPrediction
);

// Update prediction
router.put('/:id', 
    ValidationMiddleware.validateId,
    PredictionController.updatePrediction
);

// Delete prediction
router.delete('/:id', 
    ValidationMiddleware.validateId,
    PredictionController.deletePrediction
);

// Search predictions
router.get('/search/all', PredictionController.searchPredictions);

export default router;