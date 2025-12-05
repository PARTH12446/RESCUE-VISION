import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import apiRoutes from './routes/api.js'; // Keep .js for compiled JS files
import { 
    requestLogger, 
    responseLogger, 
    errorLogger 
} from './middlewares/logging.middleware.js'; // Add .js extension
import { 
    notFound, 
    errorHandler 
} from './middlewares/error.middleware.js'; // Add .js extension
import { AuthMiddleware } from './middlewares/auth.middleware.js'; // Add .js extension

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:8081',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('🔌 WebSocket client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('🔌 WebSocket client disconnected:', socket.id);
    });
});

// ============ MIDDLEWARE ============
// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Request validation - if AuthMiddleware.validateRequest exists
// app.use(AuthMiddleware.validateRequest);

// Logging
app.use(requestLogger);
app.use(responseLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ ROUTES ============
app.use('/api', apiRoutes);

// ============ ERROR HANDLING ============
// 404 handler
app.use(notFound);

// Error logging
app.use(errorLogger);

// Global error handler
app.use(errorHandler);

// ============ SERVER START ============
const startServer = async () => {
    try {
        server.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('🚀 Disaster Management System Backend');
            console.log('='.repeat(50));
            console.log(`📡 Server: http://${HOST}:${PORT}`);
            console.log(`🌐 API: http://${HOST}:${PORT}/api`);
            console.log(`🏥 Health: http://${HOST}:${PORT}/api/health`);
            console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('='.repeat(50));
            console.log('✅ Server is running...');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start server
startServer();

export default app;