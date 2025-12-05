import { dataService } from '../services/DataService.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export class AlertController {
    
    // Get all alerts
    static getAlerts = asyncHandler(async (req, res) => {
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const unreadOnly = req.query.unreadOnly === 'true';
        
        const result = await dataService.getAlerts(limit, unreadOnly);
        res.status(result.success ? 200 : 400).json(result);
    });

    // Create new alert
    static createAlert = asyncHandler(async (req, res) => {
        const alertData = {
            ...req.body,
            timestamp: new Date(),
            isRead: false
        };
        
        // Validate required fields
        if (!alertData.type || !alertData.severity || !alertData.title || !alertData.message) {
            const response = {
                success: false,
                message: 'Missing required fields: type, severity, title, message',
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        const result = await dataService.createAlert(alertData);
        return res.status(result.success ? 201 : 400).json(result);
    });

    // Mark alert as read
    static markAlertAsRead = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await dataService.markAlertAsRead(id);
        return res.status(result.success ? 200 : 404).json(result);
    });

    // Mark all alerts as read
    static markAllAlertsAsRead = asyncHandler(async (req, res) => {
        // Since markAllAlertsAsRead doesn't exist in DataService, implement it here
        const result = await dataService.getAlerts(1000, true); // Get all unread alerts
        
        if (result.success && result.data) {
            // Mark each alert as read
            for (const alert of result.data) {
                await dataService.markAlertAsRead(alert.id);
            }
            
            const response = {
                success: true,
                data: { count: result.data.length },
                message: `Marked ${result.data.length} alerts as read`,
                timestamp: new Date()
            };
            
            return res.status(200).json(response);
        }
        
        const response = {
            success: false,
            message: 'Failed to mark alerts as read',
            error: result.error,
            timestamp: new Date()
        };
        return res.status(400).json(response);
    });

    // Get unread alerts count
    static getUnreadCount = asyncHandler(async (req, res) => {
        const result = await dataService.getAlerts(1000, true); // Get all unread alerts
        
        const response = {
            success: result.success,
            data: { count: result.data?.length || 0 },
            message: result.message,
            timestamp: new Date()
        };
        
        return res.status(result.success ? 200 : 400).json(response);
    });

    // Get alerts by severity
    static getAlertsBySeverity = asyncHandler(async (req, res) => {
        const { severity } = req.params;
        const result = await dataService.getAlerts(1000); // Get all alerts
        
        if (result.success && result.data) {
            const filteredAlerts = result.data.filter(alert => 
                alert.severity.toLowerCase() === severity.toLowerCase()
            );
            
            const response = {
                success: true,
                data: filteredAlerts,
                message: `Found ${filteredAlerts.length} alerts with severity ${severity}`,
                timestamp: new Date()
            };
            
            return res.status(200).json(response);
        }
        
        // Always return a response
        const response = {
            success: false,
            message: result.message || 'Failed to fetch alerts',
            error: result.error,
            timestamp: new Date()
        };
        return res.status(400).json(response);
    });
}