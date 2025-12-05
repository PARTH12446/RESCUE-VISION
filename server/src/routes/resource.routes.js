import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = Router();

// Get all resources
router.get('/', ResourceController.getResources);

// Get single resource
router.get('/:id', 
    ValidationMiddleware.validateId,
    ResourceController.getResourceById
);

// Create resource
router.post('/', 
    ValidationMiddleware.validateResource,
    ResourceController.createResource
);

// Update resource
router.put('/:id', 
    ValidationMiddleware.validateId,
    ResourceController.updateResource
);

// Delete resource
router.delete('/:id', 
    ValidationMiddleware.validateId,
    ResourceController.deleteResource
);

// Update resource availability
router.patch('/:id/availability', 
    ValidationMiddleware.validateId,
    ResourceController.updateResourceAvailability
);

// Get resources by type
router.get('/type/:type', ResourceController.getResourcesByType);

export default router;