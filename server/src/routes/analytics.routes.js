import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';

const router = Router();

// Get analytics data for Analytics page
router.get('/', DashboardController.getAnalytics);

export default router;
