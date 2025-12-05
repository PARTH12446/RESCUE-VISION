import { db } from '../config/database.js';

// Helper function to convert database prediction
const convertPrediction = (dbRow) => ({
    id: dbRow.id,
    type: dbRow.type,
    location: dbRow.location,
    coordinates: dbRow.coordinates || { lat: 0, lng: 0 },
    probability: dbRow.probability,
    severity: dbRow.severity,
    predictedTime: dbRow.predicted_time,
    affectedPopulation: dbRow.affected_population,
    riskScore: dbRow.risk_score,
    isActive: dbRow.is_active,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at
});

// Helper function to convert database resource
const convertResource = (dbRow) => ({
    id: dbRow.id,
    type: dbRow.type,
    name: dbRow.name,
    quantity: dbRow.quantity,
    available: dbRow.available,
    location: dbRow.location,
    status: dbRow.status,
    description: dbRow.description,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
    lastUpdated: dbRow.last_updated
});

// Helper function to convert database alert
const convertAlert = (dbRow) => ({
    id: dbRow.id,
    type: dbRow.type,
    severity: dbRow.severity,
    title: dbRow.title,
    message: dbRow.message,
    location: dbRow.location,
    timestamp: dbRow.timestamp,
    isRead: dbRow.is_read,
    status: dbRow.status,
    createdAt: dbRow.created_at
});

// Helper function to convert database historical data
const convertHistoricalData = (dbRow) => ({
    id: dbRow.id,
    month: dbRow.month,
    year: dbRow.year,
    predictions: dbRow.predictions,
    alerts: dbRow.alerts,
    successRate: dbRow.success_rate
});

// Helper function to convert database reported disaster
const convertReportedDisaster = (dbRow) => ({
    id: dbRow.id,
    type: dbRow.type,
    severity: dbRow.severity,
    title: dbRow.title,
    description: dbRow.description,
    location: dbRow.location,
    coordinates: dbRow.coordinates,
    timestamp: dbRow.timestamp,
    status: dbRow.status,
    reporterName: dbRow.reporter_name,
    reporterContact: dbRow.reporter_contact,
    evidenceUrls: dbRow.evidence_urls || [],
    createdAt: dbRow.created_at
});

export class DataService {
    
    // Health Check
    async healthCheck() {
        try {
            await db.query('SELECT 1 as health_check');
            return {
                success: true,
                data: { database: true },
                message: 'Service is healthy',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Health check failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // ============ PREDICTION METHODS ============

    // Get Predictions
    async getPredictions() {
        try {
            const result = await db.query(`
                SELECT * FROM disaster_predictions 
                WHERE is_active = true 
                ORDER BY risk_score DESC
            `);
            const predictions = result.rows.map(convertPrediction);
            return {
                success: true,
                data: predictions,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch predictions',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Get single prediction by ID
    async getPredictionById(id) {
        try {
            const result = await db.query(
                'SELECT * FROM disaster_predictions WHERE id = $1 AND is_active = true',
                [id]
            );

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Prediction not found',
                    timestamp: new Date()
                };
            }

            return {
                success: true,
                data: convertPrediction(result.rows[0]),
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch prediction',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Create Prediction
    async createPrediction(prediction) {
        try {
            const result = await db.query(`
                INSERT INTO disaster_predictions 
                (type, location, coordinates, probability, severity, predicted_time, affected_population, risk_score)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
                prediction.type,
                prediction.location,
                JSON.stringify(prediction.coordinates),
                prediction.probability,
                prediction.severity,
                prediction.predictedTime,
                prediction.affectedPopulation,
                prediction.riskScore
            ]);

            return {
                success: true,
                data: convertPrediction(result.rows[0]),
                message: 'Prediction created successfully',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create prediction',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Update Prediction
    async updatePrediction(id, updates) {
        try {
            const fields = [];
            const values = [];
            let paramCount = 1;

            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    let dbField = key;
                    let dbValue = value;
                    
                    // Map field names
                    if (key === 'predictedTime') {
                        dbField = 'predicted_time';
                        dbValue = new Date(value).toISOString();
                    } else if (key === 'affectedPopulation') {
                        dbField = 'affected_population';
                    } else if (key === 'riskScore') {
                        dbField = 'risk_score';
                    } else if (key === 'isActive') {
                        dbField = 'is_active';
                    } else if (key === 'coordinates') {
                        dbValue = JSON.stringify(value);
                    }
                    
                    fields.push(`${dbField} = $${paramCount}`);
                    values.push(dbValue);
                    paramCount++;
                }
            });

            if (fields.length === 0) {
                return {
                    success: false,
                    message: 'No updates provided',
                    timestamp: new Date()
                };
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            const query = `
                UPDATE disaster_predictions 
                SET ${fields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;

            const result = await db.query(query, values);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Prediction not found',
                    timestamp: new Date()
                };
            }

            return {
                success: true,
                data: convertPrediction(result.rows[0]),
                message: 'Prediction updated successfully',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update prediction',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Delete Prediction
    async deletePrediction(id) {
        try {
            const result = await db.query(
                'DELETE FROM disaster_predictions WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Prediction not found',
                    timestamp: new Date()
                };
            }

            return {
                success: true,
                message: 'Prediction deleted successfully',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete prediction',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // ============ RESOURCE METHODS ============

    // Get Resources
    async getResources() {
        try {
            const result = await db.query('SELECT * FROM resources ORDER BY type, name');
            const resources = result.rows.map(convertResource);
            return {
                success: true,
                data: resources,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch resources',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Get single resource by ID
    async getResourceById(id) {
        try {
            const result = await db.query(
                'SELECT * FROM resources WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Resource not found',
                    timestamp: new Date()
                };
            }

            return {
                success: true,
                data: convertResource(result.rows[0]),
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch resource',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Create Resource
    async createResource(resource) {
        try {
            const result = await db.query(`
                INSERT INTO resources 
                (type, name, quantity, available, location, status, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [
                resource.type,
                resource.name,
                resource.quantity,
                resource.available,
                resource.location,
                resource.status || 'available',
                resource.description || null
            ]);

            return {
                success: true,
                data: convertResource(result.rows[0]),
                message: 'Resource created successfully',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create resource',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Update Resource
    async updateResource(id, updates) {
        try {
            const fields = ['last_updated = CURRENT_TIMESTAMP'];
            const values = [];
            let paramCount = 1;

            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    let dbField = key;
                    let dbValue = value;
                    
                    if (key === 'lastUpdated') {
                        dbField = 'last_updated';
                        dbValue = new Date(value).toISOString();
                    }
                    
                    fields.push(`${dbField} = $${paramCount}`);
                    values.push(dbValue);
                    paramCount++;
                }
            });

            if (fields.length === 1) { // Only has last_updated
                return {
                    success: false,
                    message: 'No updates provided',
                    timestamp: new Date()
                };
            }

            values.push(id);

            const query = `
                UPDATE resources 
                SET ${fields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;

            const result = await db.query(query, values);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Resource not found',
                    timestamp: new Date()
                };
            }

            return {
                success: true,
                data: convertResource(result.rows[0]),
                message: 'Resource updated successfully',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update resource',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Delete Resource
    async deleteResource(id) {
        try {
            const result = await db.query(
                'DELETE FROM resources WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Resource not found',
                    timestamp: new Date()
                };
            }

            return {
                success: true,
                message: 'Resource deleted successfully',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete resource',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // ============ ALERT METHODS ============

    // Get Alerts
    async getAlerts(limit = 50, unreadOnly = false) {
        try {
            let query = 'SELECT * FROM alerts';
            const params = [];
            
            if (unreadOnly) {
                query += ' WHERE is_read = false';
            }
            
            query += ' ORDER BY timestamp DESC';
            
            if (limit > 0) {
                query += ' LIMIT $1';
                params.push(limit);
            }

            const result = await db.query(query, limit > 0 ? params : []);
            const alerts = result.rows.map(convertAlert);
            return {
                success: true,
                data: alerts,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch alerts',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Create Alert
    async createAlert(alert) {
        try {
            const result = await db.query(`
                INSERT INTO alerts 
                (type, severity, title, message, location, status, timestamp, is_read)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
                alert.type,
                alert.severity,
                alert.title,
                alert.message,
                alert.location || null,
                alert.status || 'active',
                alert.timestamp || new Date(),
                alert.isRead || false
            ]);

            return {
                success: true,
                data: convertAlert(result.rows[0]),
                message: 'Alert created successfully',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create alert',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Mark Alert as Read
    async markAlertAsRead(id) {
        try {
            const result = await db.query(`
                UPDATE alerts 
                SET is_read = true, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `, [id]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Alert not found',
                    timestamp: new Date()
                };
            }

            return {
                success: true,
                data: convertAlert(result.rows[0]),
                message: 'Alert marked as read',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update alert',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Mark All Alerts as Read
    async markAllAlertsAsRead() {
        try {
            const result = await db.query(`
                UPDATE alerts 
                SET is_read = true, updated_at = CURRENT_TIMESTAMP
                WHERE is_read = false
                RETURNING COUNT(*) as count
            `);

            const count = parseInt(result.rows[0]?.count || '0');

            return {
                success: true,
                data: { count },
                message: `Marked ${count} alerts as read`,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to mark alerts as read',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // ============ DASHBOARD METHODS ============

    // Get Dashboard Stats
    async getDashboardStats() {
        try {
            const [
                predictionsResult,
                activeAlertsResult,
                resourcesResult,
                populationResult
            ] = await Promise.all([
                db.query('SELECT COUNT(*) as count FROM disaster_predictions WHERE is_active = true'),
                db.query("SELECT COUNT(*) as count FROM alerts WHERE is_read = false AND status = 'active'"),
                db.query('SELECT COALESCE(SUM(quantity - available), 0) as deployed FROM resources'),
                db.query('SELECT COALESCE(SUM(affected_population), 0) as population FROM disaster_predictions WHERE is_active = true')
            ]);

            const stats = {
                activeAlerts: parseInt(activeAlertsResult.rows[0]?.count || '0'),
                predictedDisasters: parseInt(predictionsResult.rows[0]?.count || '0'),
                resourcesDeployed: parseInt(resourcesResult.rows[0]?.deployed || '0'),
                populationAtRisk: parseInt(populationResult.rows[0]?.population || '0'),
                responseTeams: 156,
                successRate: 92.5
            };

            return {
                success: true,
                data: stats,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch dashboard stats',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Get Historical Data
    async getHistoricalData() {
        try {
            const result = await db.query(`
                SELECT * FROM historical_data 
                WHERE year = 2024 
                ORDER BY 
                    CASE month 
                        WHEN 'Jan' THEN 1 WHEN 'Feb' THEN 2 WHEN 'Mar' THEN 3 
                        WHEN 'Apr' THEN 4 WHEN 'May' THEN 5 WHEN 'Jun' THEN 6 
                        WHEN 'Jul' THEN 7 WHEN 'Aug' THEN 8 WHEN 'Sep' THEN 9 
                        WHEN 'Oct' THEN 10 WHEN 'Nov' THEN 11 WHEN 'Dec' THEN 12 
                    END
            `);

            const historicalData = result.rows.map(convertHistoricalData);
            return {
                success: true,
                data: historicalData,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch historical data',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Get AI Insights
    async getAIInsights() {
        try {
            const result = await db.query(`
                SELECT location, type, risk_score 
                FROM disaster_predictions 
                WHERE is_active = true 
                ORDER BY risk_score DESC 
                LIMIT 1
            `);

            const highestRisk = result.rows[0] || { 
                location: 'No active predictions', 
                type: 'none',
                risk_score: 0
            };

            const insights = {
                highestRiskRegion: highestRisk.location,
                highestRiskDescription: `${highestRisk.type.charAt(0).toUpperCase() + highestRisk.type.slice(1)} risk detected`,
                modelConfidence: 92 + Math.random() * 5,
                dataPoints: 10000 + Math.floor(Math.random() * 5000),
                earlyWarningHours: 48 + Math.floor(Math.random() * 48),
                recommendations: [
                    'Deploy emergency response teams',
                    'Activate early warning systems',
                    'Prepare evacuation routes'
                ]
            };

            return {
                success: true,
                data: insights,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch AI insights',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // ============ SEARCH METHOD ============

    // Search
    async search(query) {
        try {
            const searchTerm = `%${query.toLowerCase()}%`;
            
            const [predictions, alerts, resources] = await Promise.all([
                db.query('SELECT * FROM disaster_predictions WHERE is_active = true AND (LOWER(location) LIKE $1 OR LOWER(type) LIKE $1) LIMIT 10', [searchTerm]),
                db.query('SELECT * FROM alerts WHERE LOWER(title) LIKE $1 OR LOWER(message) LIKE $1 OR LOWER(location) LIKE $1 LIMIT 10', [searchTerm]),
                db.query('SELECT * FROM resources WHERE LOWER(name) LIKE $1 OR LOWER(location) LIKE $1 OR LOWER(type) LIKE $1 LIMIT 10', [searchTerm])
            ]);

            const result = {
                predictions: predictions.rows.map(convertPrediction),
                alerts: alerts.rows.map(convertAlert),
                resources: resources.rows.map(convertResource),
                total: (predictions.rowCount || 0) + (alerts.rowCount || 0) + (resources.rowCount || 0)
            };

            return {
                success: true,
                data: result,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Search failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // ============ REPORTED DISASTERS ============

    // Report Disaster
    async reportDisaster(report) {
        try {
            const result = await db.query(`
                INSERT INTO reported_disasters 
                (type, severity, title, description, location, coordinates, status, reporter_name, reporter_contact, evidence_urls)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, [
                report.type,
                report.severity,
                report.title,
                report.description,
                report.location,
                report.coordinates ? JSON.stringify(report.coordinates) : null,
                report.status || 'reported',
                report.reporterName || null,
                report.reporterContact || null,
                report.evidenceUrls ? JSON.stringify(report.evidenceUrls) : null
            ]);

            // Create alert
            await this.createAlert({
                type: report.type,
                severity: report.severity,
                title: `Reported: ${report.title}`,
                message: report.description,
                location: report.location,
                timestamp: new Date(),
                isRead: false,
                status: 'active'
            });

            return {
                success: true,
                data: convertReportedDisaster(result.rows[0]),
                message: 'Disaster reported successfully',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to report disaster',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Get Reported Disasters
    async getReportedDisasters() {
        try {
            const result = await db.query(`
                SELECT * FROM reported_disasters 
                ORDER BY timestamp DESC
                LIMIT 50
            `);

            const reportedDisasters = result.rows.map(convertReportedDisaster);
            return {
                success: true,
                data: reportedDisasters,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch reported disasters',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // ============ ADDITIONAL METHODS ============

    // Get Alert Stats
    async getAlertStats() {
        try {
            const [
                totalResult,
                unreadResult,
                severityResult,
                recentResult
            ] = await Promise.all([
                db.query('SELECT COUNT(*) as count FROM alerts'),
                db.query('SELECT COUNT(*) as count FROM alerts WHERE is_read = false'),
                db.query(`
                    SELECT 
                        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
                        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
                        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
                        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
                    FROM alerts
                `),
                db.query(`
                    SELECT COUNT(*) as count FROM alerts 
                    WHERE timestamp >= NOW() - INTERVAL '24 hours'
                `)
            ]);

            const stats = {
                total: parseInt(totalResult.rows[0]?.count || '0'),
                unread: parseInt(unreadResult.rows[0]?.count || '0'),
                critical: parseInt(severityResult.rows[0]?.critical || '0'),
                high: parseInt(severityResult.rows[0]?.high || '0'),
                medium: parseInt(severityResult.rows[0]?.medium || '0'),
                low: parseInt(severityResult.rows[0]?.low || '0'),
                last24Hours: parseInt(recentResult.rows[0]?.count || '0')
            };

            return {
                success: true,
                data: stats,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch alert stats',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Get Resource Stats
    async getResourceStats() {
        try {
            const [
                totalResult,
                deployedResult,
                byTypeResult,
                byStatusResult
            ] = await Promise.all([
                db.query('SELECT SUM(quantity) as total FROM resources'),
                db.query('SELECT SUM(quantity - available) as deployed FROM resources'),
                db.query(`
                    SELECT type, SUM(quantity) as total, SUM(available) as available
                    FROM resources
                    GROUP BY type
                    ORDER BY type
                `),
                db.query(`
                    SELECT status, COUNT(*) as count
                    FROM resources
                    GROUP BY status
                    ORDER BY status
                `)
            ]);

            const byType = {};
            (byTypeResult.rows || []).forEach((row) => {
                byType[row.type] = {
                    total: parseInt(row.total || '0'),
                    available: parseInt(row.available || '0')
                };
            });

            const byStatus = {};
            (byStatusResult.rows || []).forEach((row) => {
                byStatus[row.status] = parseInt(row.count || '0');
            });

            const stats = {
                total: parseInt(totalResult.rows[0]?.total || '0'),
                deployed: parseInt(deployedResult.rows[0]?.deployed || '0'),
                byType,
                byStatus
            };

            return {
                success: true,
                data: stats,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch resource stats',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Get alerts by type
    async getAlertsByType(type) {
        try {
            const result = await db.query(
                'SELECT * FROM alerts WHERE type = $1 ORDER BY timestamp DESC LIMIT 50',
                [type]
            );

            const alerts = result.rows.map(convertAlert);
            return {
                success: true,
                data: alerts,
                message: `Found ${alerts.length} alerts of type ${type}`,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch alerts by type',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Get recent alerts
    async getRecentAlerts(hours = 24) {
        try {
            const result = await db.query(
                `SELECT * FROM alerts 
                 WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
                 ORDER BY timestamp DESC
                 LIMIT 100`
            );

            const alerts = result.rows.map(convertAlert);
            return {
                success: true,
                data: alerts,
                message: `Found ${alerts.length} alerts in the last ${hours} hours`,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch recent alerts',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;