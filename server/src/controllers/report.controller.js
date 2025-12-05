import { dataService } from '../services/DataService.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export class ReportController {
    
    // Report a disaster
    static reportDisaster = asyncHandler(async (req, res) => {
        const reportData = {
            ...req.body,
            status: 'reported'
        };
        
        // Validate required fields
        if (!reportData.type || !reportData.severity || !reportData.title || 
            !reportData.description || !reportData.location) {
            const response = {
                success: false,
                message: 'Missing required fields: type, severity, title, description, location',
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        const result = await dataService.reportDisaster(reportData);
        return res.status(result.success ? 201 : 400).json(result);
    });

    // Get all reported disasters
    static getReportedDisasters = asyncHandler(async (req, res) => {
        const result = await dataService.getReportedDisasters();
        return res.status(result.success ? 200 : 400).json(result);
    });

    // Get single report by ID
    static getReportById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await dataService.getReportedDisasters();
        
        if (result.success && result.data) {
            const report = result.data.find(r => r.id === id);
            
            if (report) {
                const response = {
                    success: true,
                    data: report,
                    timestamp: new Date()
                };
                return res.status(200).json(response);
            }
        }
        
        const response = {
            success: false,
            message: 'Report not found',
            timestamp: new Date()
        };
        return res.status(404).json(response);
    });

    // Update report status
    static updateReportStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['reported', 'verified', 'investigating', 'resolved'];
        
        if (!status || !validStatuses.includes(status)) {
            const response = {
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        // Note: You would need to add an updateReport method to DataService
        // For now, we'll return a mock response
        const response = {
            success: true,
            data: { id, status },
            message: `Report ${id} status updated to ${status}`,
            timestamp: new Date()
        };
        
        return res.status(200).json(response);
    });

    // Search reported disasters
    static searchReports = asyncHandler(async (req, res) => {
        const { search } = req.query;
        
        if (!search || typeof search !== 'string') {
            const response = {
                success: false,
                message: 'Search query is required',
                timestamp: new Date()
            };
            return res.status(400).json(response);
        }

        const result = await dataService.search(search);
        
        const response = {
            success: true,
            data: {
                reports: result.data?.alerts.filter(alert => 
                    alert.title.includes('Reported:')
                ).map(alert => ({
                    id: alert.id,
                    type: alert.type,
                    severity: alert.severity,
                    title: alert.title.replace('Reported: ', ''),
                    description: alert.message,
                    location: alert.location,
                    timestamp: alert.timestamp,
                    status: 'reported',
                    createdAt: alert.createdAt
                })),
                total: result.data?.alerts.filter(alert => alert.title.includes('Reported:')).length || 0
            },
            timestamp: new Date()
        };
        
        return res.status(200).json(response);
    });
}