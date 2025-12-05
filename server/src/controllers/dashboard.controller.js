import { dataService } from '../services/DataService.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export class DashboardController {
    
    // Get dashboard statistics
    static getDashboardStats = asyncHandler(async (req, res) => {
        const result = await dataService.getDashboardStats();

        // On success, return the plain stats object so the frontend receives
        // { activeAlerts, predictedDisasters, resourcesDeployed, populationAtRisk, responseTeams, successRate }
        if (result.success && result.data) {
            return res.status(200).json(result.data);
        }

        // On failure, preserve the existing error wrapper and 400 status
        return res.status(400).json(result);
    });

    // Get historical data
    static getHistoricalData = asyncHandler(async (req, res) => {
        const result = await dataService.getHistoricalData();
        return res.status(result.success ? 200 : 400).json(result);
    });

    // Get AI insights
    static getAIInsights = asyncHandler(async (req, res) => {
        const result = await dataService.getAIInsights();
        return res.status(result.success ? 200 : 400).json(result);
    });

    // Get alert statistics
    static getAlertStats = asyncHandler(async (req, res) => {
        const alertsResult = await dataService.getAlerts(1000); // Get all alerts
        
        if (!alertsResult.success || !alertsResult.data) {
            return res.status(400).json(alertsResult);
        }
        
        const total = alertsResult.data.length;
        const unread = alertsResult.data.filter(alert => !alert.isRead).length;
        const critical = alertsResult.data.filter(alert => alert.severity === 'critical').length;
        
        const stats = {
            total,
            unread,
            critical,
            resolvedToday: Math.floor(Math.random() * 20) // Mock data
        };
        
        const response = {
            success: true,
            data: stats,
            timestamp: new Date()
        };
        
        return res.status(200).json(response);
    });

    // Get resource statistics
    static getResourceStats = asyncHandler(async (req, res) => {
        const resourcesResult = await dataService.getResources();
        
        if (!resourcesResult.success || !resourcesResult.data) {
            return res.status(400).json(resourcesResult);
        }
        
        const unitsDeployed = resourcesResult.data.reduce((sum, resource) => 
            sum + (resource.quantity - resource.available), 0
        );
        
        const uniqueLocations = new Set(resourcesResult.data.map(r => r.location)).size;
        
        const stats = {
            unitsDeployed,
            activeLocations: uniqueLocations,
            efficiencyScore: 85 + Math.random() * 15,
            pendingTransfers: Math.floor(Math.random() * 10),
            utilizationRate: Math.min(100, (unitsDeployed / resourcesResult.data.reduce((sum, r) => sum + r.quantity, 0)) * 100)
        };
        
        const response = {
            success: true,
            data: stats,
            timestamp: new Date()
        };
        
        return res.status(200).json(response);
    });

    // Get combined dashboard data
    static getCombinedDashboardData = asyncHandler(async (req, res) => {
        const [statsResult, insightsResult, historicalResult] = await Promise.all([
            dataService.getDashboardStats(),
            dataService.getAIInsights(),
            dataService.getHistoricalData()
        ]);
        
        const response = {
            success: statsResult.success && insightsResult.success && historicalResult.success,
            data: {
                stats: statsResult.data,
                insights: insightsResult.data,
                historical: historicalResult.data
            },
            timestamp: new Date()
        };
        
        return res.status(response.success ? 200 : 400).json(response);
    });

    // Get analytics data for Analytics page
    static getAnalytics = asyncHandler(async (req, res) => {
        const [statsResult, alertStatsResult, resourceStatsResult] = await Promise.all([
            dataService.getDashboardStats(),
            dataService.getAlertStats(),
            dataService.getResourceStats()
        ]);

        // Basic defensive defaults
        const stats = statsResult.data || {};
        const alertStats = alertStatsResult.data || {};
        const resourceStats = resourceStatsResult.data || {};

        const kpis = {
            avgResponseTime: 18 + Math.random() * 6, // minutes
            predictionAccuracy: 88 + Math.random() * 8, // percent
            livesProtected: 2_000_000 + Math.floor(Math.random() * 500_000),
            resourceEfficiency: 70 + Math.random() * 25
        };

        // Simple mocked response time trend over last 7 days
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const responseTimeData = days.map((day) => ({
            day,
            time: 15 + Math.random() * 10
        }));

        // Disaster type distribution based on alert or prediction types (mocked)
        const disasterTypeData = [
            { name: 'Floods', value: 32 },
            { name: 'Earthquakes', value: 18 },
            { name: 'Wildfires', value: 24 },
            { name: 'Storms', value: 16 },
            { name: 'Other', value: 10 }
        ];

        const analytics = {
            kpis,
            responseTimeData,
            disasterTypeData
        };

        return res.status(200).json(analytics);
    });
}