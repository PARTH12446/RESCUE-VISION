import { Router } from 'express';
import { dataService } from '../services/DataService.js';
import { db } from '../config/database.js';
import routes from './index.js';

const router = Router();

// Health check
router.get('/health', async (req, res) => {
    try {
        // Check database connection
        await db.query('SELECT 1');
        
        const health = {
            success: true,
            message: 'System is healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                api: 'running'
            }
        };
        return res.status(200).json(health);
    } catch (error) {
        const response = {
            success: false,
            message: 'Health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
        return res.status(500).json(response);
    }
});

// Database initialization (for development only)
router.post('/db/init', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        const response = {
            success: false,
            message: 'Database initialization only allowed in development',
            timestamp: new Date().toISOString()
        };
        return res.status(403).json(response);
    }

    try {
        // Since db.initializeTables doesn't exist, we'll create a simple initialization
        // or you can import DatabaseSetup if you have it
        const { DatabaseSetup } = await import('../database/setup.js');
        await DatabaseSetup.initialize();
        
        const response = {
            success: true,
            message: 'Database initialized successfully',
            timestamp: new Date().toISOString()
        };
        return res.status(200).json(response);
    } catch (error) {
        const response = {
            success: false,
            message: 'Database initialization failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
        return res.status(500).json(response);
    }
});

// API documentation
router.get('/', (req, res) => {
    const response = {
        message: '🚀 Disaster Management System API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /api/health',
            database_init: 'POST /api/db/init (development only)',
            users: {
                list: 'GET /api/users',
                create: 'POST /api/users',
                get: 'GET /api/users/:id',
                update: 'PUT /api/users/:id',
                delete: 'DELETE /api/users/:id'
            },
            disasters: {
                list: 'GET /api/disasters',
                create: 'POST /api/disasters',
                get: 'GET /api/disasters/:id',
                update: 'PUT /api/disasters/:id',
                delete: 'DELETE /api/disasters/:id',
                stats: 'GET /api/disasters/stats',
                nearby: 'GET /api/disasters/nearby?lat=...&lng=...&radius=...'
            },
            ai: {
                predictions: 'GET /api/ai/predictions',
                predict: 'POST /api/ai/predict'
            }
        },
        timestamp: new Date().toISOString()
    };
    return res.status(200).json(response);
});

// Register all routes
router.use('/', routes);

export default router;