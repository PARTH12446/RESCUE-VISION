import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';

const router = Router();

// Get dashboard stats
router.get('/stats', DashboardController.getDashboardStats);

// Get historical data
router.get('/historical', DashboardController.getHistoricalData);

// Get AI insights
router.get('/insights', DashboardController.getAIInsights);

// Get alert stats
router.get('/alert-stats', DashboardController.getAlertStats);

// Get resource stats
router.get('/resource-stats', DashboardController.getResourceStats);

// Get combined dashboard data
router.get('/combined', DashboardController.getCombinedDashboardData);

export default router;