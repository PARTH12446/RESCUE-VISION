import { db } from '../config/database.js';
import { getRoute } from './RoutingProvider.js';

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
    coordinates: dbRow.coordinates || null,
    roadStatus: dbRow.road_status || null,
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

    async fetchIndiaWeatherFromOpenWeather(lat, lon) {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('Missing OPENWEATHER_API_KEY');
        }

        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&exclude=minutely,alerts&units=metric&appid=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OpenWeatherMap error: ${response.status}`);
        }

        return response.json();
    }

    async getIndiaRisk(lat, lon) {
        try {
            const weather = await this.fetchIndiaWeatherFromOpenWeather(lat, lon);

            const current = weather.current || {};
            const daily = Array.isArray(weather.daily) && weather.daily.length > 0 ? weather.daily[0] : {};

            const temp = typeof current.temp === 'number' ? current.temp : null;
            const maxTemp = typeof daily.temp?.max === 'number' ? daily.temp.max : temp;
            const rain24h = typeof daily.rain === 'number' ? daily.rain : 0; // mm/day
            const wind = typeof current.wind_speed === 'number' ? current.wind_speed : 0; // m/s
            const humidity = typeof current.humidity === 'number' ? current.humidity : 0;
            const pop = typeof daily.pop === 'number' ? daily.pop : 0.5; // 0-1

            let type = 'general_risk';

            // Heatwave thresholds adapted for many Indian plains regions
            if (maxTemp !== null && maxTemp >= 37) {
                type = 'heatwave';
            }

            // Monsoon / heavy rain: IMD heavy rain ~64.5mm+, very heavy >115.6mm
            if (rain24h >= 65) {
                type = 'severe_rain';
            } else if (rain24h >= 35 && type !== 'heatwave') {
                type = 'heavy_rain';
            }

            // Strong winds (possible cyclonic conditions near coast)
            if (wind >= 20 && type !== 'heatwave') {
                type = 'storm';
            }

            let severity = 'low';
            let baseScore = 2;

            if (type === 'heatwave') {
                if (maxTemp >= 45) {
                    severity = 'critical';
                    baseScore = 9.5;
                } else if (maxTemp >= 42) {
                    severity = 'high';
                    baseScore = 7.5;
                } else if (maxTemp >= 39) {
                    severity = 'medium';
                    baseScore = 5.5;
                } else {
                    severity = 'low';
                    baseScore = 3.5;
                }
            } else if (type === 'severe_rain' || type === 'heavy_rain') {
                if (rain24h >= 200) {
                    severity = 'critical';
                    baseScore = 9.5;
                } else if (rain24h >= 115) {
                    severity = 'high';
                    baseScore = 8;
                } else if (rain24h >= 65) {
                    severity = 'medium';
                    baseScore = 6;
                } else if (rain24h >= 35) {
                    severity = 'low';
                    baseScore = 4;
                }
            } else if (type === 'storm') {
                // wind in m/s ~ 10m/s (36 km/h) strong breeze, >17m/s gale
                if (wind >= 30) {
                    severity = 'critical';
                    baseScore = 9;
                } else if (wind >= 24) {
                    severity = 'high';
                    baseScore = 7.5;
                } else if (wind >= 17) {
                    severity = 'medium';
                    baseScore = 5.5;
                } else {
                    severity = 'low';
                    baseScore = 3.5;
                }
            }

            const probability = Math.max(0, Math.min(1, pop));
            const humidityFactor = humidity / 100; // 0-1
            const riskScoreRaw = baseScore * probability + humidityFactor * 2;
            const riskScore = Math.max(0, Math.min(10, riskScoreRaw));

            const predictedTime = daily.dt ? new Date(daily.dt * 1000) : new Date(Date.now() + 6 * 60 * 60 * 1000);

            const indiaRisk = {
                type,
                location: weather.timezone || 'Selected location in India',
                coordinates: { lat: Number(lat), lng: Number(lon) },
                probability,
                severity,
                predictedTime,
                affectedPopulation: 0,
                riskScore,
                isActive: true,
            };

            return {
                success: true,
                data: indiaRisk,
                timestamp: new Date(),
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to compute India risk from external data',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date(),
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
                (type, name, quantity, available, location, status, description, coordinates, road_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `, [
                resource.type,
                resource.name,
                resource.quantity,
                resource.available,
                resource.location,
                resource.status || 'available',
                resource.description || null,
                resource.coordinates ? JSON.stringify(resource.coordinates) : null,
                resource.roadStatus || null
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
                    } else if (key === 'coordinates') {
                        dbField = 'coordinates';
                        dbValue = JSON.stringify(value);
                    } else if (key === 'roadStatus') {
                        dbField = 'road_status';
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

    // ============ AI RESOURCE OPTIMIZATION ============

    async optimizeResources() {
        try {
            const [predictionsResult, resourcesResult] = await Promise.all([
                this.getPredictions(),
                this.getResources(),
            ]);

            if (!predictionsResult.success || !resourcesResult.success) {
                return {
                    success: false,
                    message: 'Failed to load data for optimization',
                    timestamp: new Date(),
                };
            }

            const predictions = predictionsResult.data || [];
            const resources = resourcesResult.data || [];

            if (!predictions.length || !resources.length) {
                return {
                    success: false,
                    message: 'Not enough data to optimize resources',
                    data: { suggestions: [], summary: null },
                    timestamp: new Date(),
                };
            }

            const demandScores = predictions
                .filter((p) => p.isActive !== false)
                .map((p) => ({
                    id: p.id,
                    location: p.location,
                    severity: p.severity,
                    type: p.type,
                    riskScore: p.riskScore || 0,
                    affectedPopulation: p.affectedPopulation || 1,
                }))
                .map((p) => ({
                    ...p,
                    demandScore: (p.riskScore || 0) * (p.affectedPopulation || 1),
                }))
                .sort((a, b) => b.demandScore - a.demandScore);

            const totalDeployedBefore = resources.reduce(
                (sum, r) => sum + Math.max(0, (r.quantity || 0) - (r.available || 0)),
                0,
            );

            const haversineKm = (a, b) => {
                if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) {
                    return null;
                }
                const toRad = (v) => (v * Math.PI) / 180;
                const R = 6371;
                const dLat = toRad((b.lat || 0) - (a.lat || 0));
                const dLon = toRad((b.lng || 0) - (a.lng || 0));
                const lat1 = toRad(a.lat || 0);
                const lat2 = toRad(b.lat || 0);
                const h =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.sin(dLon / 2) * Math.sin(dLon / 2) *
                        Math.cos(lat1) *
                        Math.cos(lat2);
                const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
                return R * c;
            };

            const suggestions = [];

            demandScores.forEach((demand) => {
                const targetLocation = demand.location;

                const severityMultiplier =
                    demand.severity === 'critical'
                        ? 1.0
                        : demand.severity === 'high'
                        ? 0.7
                        : demand.severity === 'medium'
                        ? 0.4
                        : 0.2;

                const desiredUnits = Math.ceil(
                    (demand.affectedPopulation / 50000) * severityMultiplier,
                );

                const byType = {};
                resources.forEach((r) => {
                    const deployed = Math.max(0, (r.quantity || 0) - (r.available || 0));
                    if (!byType[r.type]) {
                        byType[r.type] = { deployed: 0, items: [] };
                    }
                    byType[r.type].deployed += deployed;
                    byType[r.type].items.push(r);
                });

                Object.entries(byType).forEach(([type, info]) => {
                    const neededFromType = Math.max(
                        0,
                        Math.round((desiredUnits * (info.deployed || 0)) / (totalDeployedBefore || 1)),
                    );
                    if (!neededFromType) return;

                    const donors = info.items
                        .filter((r) => r.location !== targetLocation)
                        .map((r) => {
                            const blocked =
                                (r.roadStatus || r.road_status || '').toLowerCase() === 'blocked' ||
                                (r.roadStatus || r.road_status || '').toLowerCase() === 'flooded';
                            const distanceKm = haversineKm(demand.coordinates, r.coordinates);
                            return { resource: r, blocked, distanceKm };
                        })
                        .sort((a, b) => {
                            if (a.blocked !== b.blocked) {
                                return a.blocked ? 1 : -1;
                            }
                            const aAvail = a.resource.available || 0;
                            const bAvail = b.resource.available || 0;
                            if (a.distanceKm != null && b.distanceKm != null) {
                                if (a.distanceKm !== b.distanceKm) {
                                    return a.distanceKm - b.distanceKm;
                                }
                            }
                            return bAvail - aAvail;
                        })
                        .map((entry) => entry.resource);

                    let remaining = neededFromType;

                    donors.forEach((donor) => {
                        if (remaining <= 0) return;
                        const movable = Math.max(0, (donor.available || 0) - 1);
                        if (!movable) return;
                        const quantityToMove = Math.min(movable, remaining);

                        suggestions.push({
                            resourceId: donor.id,
                            type,
                            fromLocation: donor.location,
                            toLocation: targetLocation,
                            quantityToMove,
                            reason: `Reallocate to support ${demand.severity} ${demand.type} risk in ${targetLocation}`,
                        });

                        remaining -= quantityToMove;
                    });
                });
            });

            const summary = {
                totalPredictions: predictions.length,
                totalResources: resources.length,
                totalDeployedBefore,
                suggestedTransfers: suggestions.length,
            };

            return {
                success: true,
                data: {
                    suggestions,
                    summary,
                },
                timestamp: new Date(),
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to optimize resources',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date(),
            };
        }
    }

    // ============ EVACUATION ROUTES ============

    async generateEvacuationRoutes(origin, disasterType) {
        try {
            const [predictionsResult, resourcesResult] = await Promise.all([
                this.getPredictions(),
                this.getResources(),
            ]);

            if (!predictionsResult.success || !resourcesResult.success) {
                return {
                    success: false,
                    message: 'Failed to load data for evacuation planning',
                    timestamp: new Date(),
                };
            }

            const predictions = (predictionsResult.data || []).filter(
                (p) => !disasterType || p.type === disasterType,
            );
            const resources = resourcesResult.data || [];

            if (!predictions.length || !resources.length) {
                return {
                    success: false,
                    message: 'Not enough data to generate evacuation routes',
                    data: { routes: [] },
                    timestamp: new Date(),
                };
            }

            const safeResources = resources.filter(
                (r) => (r.status || '').toLowerCase() !== 'depleted',
            );

            const originPoint = origin || predictions[0].coordinates || {
                lat: 0,
                lng: 0,
            };

            const routes = [];

            for (let idx = 0; idx < Math.min(3, predictions.length); idx++) {
                const prediction = predictions[idx];
                const start = prediction.coordinates || originPoint;

                const nearbySafe = safeResources.slice(0, 2);

                for (let routeIdx = 0; routeIdx < nearbySafe.length; routeIdx++) {
                    const entry = nearbySafe[routeIdx];
                    const end = entry.coordinates || originPoint;

                    let distanceKm = 0;
                    let estimatedTimeMin = 0;
                    let path = [start, end];

                    try {
                        const routed = await getRoute(start, end);
                        if (routed) {
                            distanceKm = routed.distanceKm;
                            estimatedTimeMin = routed.estimatedTimeMin;
                            path = routed.path;
                        }
                    } catch (e) {
                        // Fallback silently to simple straight line
                        distanceKm = 0;
                        estimatedTimeMin = 0;
                        path = [start, end];
                    }

                    const riskLevel =
                        prediction.severity === 'critical'
                            ? 'high'
                            : prediction.severity === 'high'
                            ? 'medium'
                            : 'low';

                    routes.push({
                        id: `${prediction.id}-${routeIdx}`,
                        name: `Route ${idx + 1}.${routeIdx + 1} from ${prediction.location}`,
                        from: prediction.location,
                        to: entry.location || 'Safe Zone',
                        riskLevel,
                        distanceKm,
                        estimatedTimeMin,
                        path,
                    });
                }
            }

            return {
                success: true,
                data: { routes },
                timestamp: new Date(),
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to generate evacuation routes',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date(),
            };
        }
    }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;