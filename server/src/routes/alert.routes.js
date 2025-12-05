import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';
const router = Router();

// Get all alerts
router.get('/', 
    ValidationMiddleware.validatePagination,
    AlertController.getAlerts
);

// Create alert
router.post('/', 
    ValidationMiddleware.validateAlert,
    AlertController.createAlert
);

// Mark alert as read
router.patch('/:id/read', 
    ValidationMiddleware.validateId,
    AlertController.markAlertAsRead
);

// Mark all alerts as read
router.patch('/read-all', AlertController.markAllAlertsAsRead);

// Get unread count
router.get('/unread/count', AlertController.getUnreadCount);

// Get alerts by severity
router.get('/severity/:severity', AlertController.getAlertsBySeverity);

export default router;