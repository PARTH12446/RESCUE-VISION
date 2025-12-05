import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = Router();

// Report a disaster
router.post('/', 
    ValidationMiddleware.validateReport,
    ReportController.reportDisaster
);

// Get all reports
router.get('/', ReportController.getReportedDisasters);

// Get single report
router.get('/:id', 
    ValidationMiddleware.validateId,
    ReportController.getReportById
);

// Update report status
router.patch('/:id/status', 
    ValidationMiddleware.validateId,
    ReportController.updateReportStatus
);

// Search reports
router.get('/search/all', ReportController.searchReports);

export default router;