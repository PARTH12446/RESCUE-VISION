import { Router } from 'express';
import predictionRoutes from './prediction.routes.js';
import resourceRoutes from './resource.routes.js';
import alertRoutes from './alert.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportRoutes from './report.routes.js';
import analyticsRoutes from './analytics.routes.js';
import indiaRiskRoutes from './india-risk.routes.js';

const router = Router();

// Register all routes
router.use('/predictions', predictionRoutes);
router.use('/resources', resourceRoutes);
router.use('/alerts', alertRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/india-risk', indiaRiskRoutes);

export default router;