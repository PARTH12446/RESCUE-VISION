export class DisasterModel {
    static async findAll(
        filters = {},
        limit = 100,
        offset = 0
    ) {
        const db = (await import('../config/database')).default;
        
        let query = 'SELECT * FROM disasters WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (filters?.type) {
            query += ` AND type = $${paramCount}`;
            params.push(filters.type);
            paramCount++;
        }

        if (filters?.status) {
            query += ` AND status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        if (filters?.severity) {
            query += ` AND severity = $${paramCount}`;
            params.push(filters.severity);
            paramCount++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
    }

    static async findById(id) {
        const db = (await import('../config/database')).default;
        const result = await db.query('SELECT * FROM disasters WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    static async create(disasterData) {
        const db = (await import('../config/database')).default;
        const result = await db.query(
            `INSERT INTO disasters (
                type, title, description, location, latitude, longitude,
                severity, reported_by, started_at, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
            RETURNING *`,
            [
                disasterData.type,
                disasterData.title,
                disasterData.description,
                disasterData.location,
                disasterData.latitude,
                disasterData.longitude,
                disasterData.severity,
                disasterData.reported_by,
                disasterData.started_at
            ]
        );
        return result.rows[0];
    }

    static async update(id, disasterData) {
        const db = (await import('../config/database')).default;
        
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(disasterData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (fields.length === 0) {
            return null;
        }

        values.push(id);
        
        const result = await db.query(
            `UPDATE disasters 
             SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
             WHERE id = $${paramCount}
             RETURNING *`,
            values
        );

        return result.rows[0] || null;
    }

    static async delete(id) {
        const db = (await import('../config/database')).default;
        const result = await db.query('DELETE FROM disasters WHERE id = $1', [id]);
        return (result.rowCount || 0) > 0;
    }

    static async getStats() {
        const db = (await import('../config/database')).default;
        
        const totalResult = await db.query('SELECT COUNT(*) FROM disasters');
        const activeResult = await db.query("SELECT COUNT(*) FROM disasters WHERE status = 'active'");
        const containedResult = await db.query("SELECT COUNT(*) FROM disasters WHERE status = 'contained'");
        const resolvedResult = await db.query("SELECT COUNT(*) FROM disasters WHERE status = 'resolved'");
        
        const typeResult = await db.query('SELECT type, COUNT(*) FROM disasters GROUP BY type');
        const severityResult = await db.query('SELECT severity, COUNT(*) FROM disasters GROUP BY severity');

        // Initialize all disaster types with 0
        const byType = {
            earthquake: 0,
            flood: 0,
            fire: 0,
            hurricane: 0,
            tsunami: 0,
            landslide: 0,
            other: 0
        };

        const bySeverity = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        };

        // Update counts from database
        typeResult.rows.forEach((row) => {
            byType[row.type] = parseInt(row.count, 10);
        });

        severityResult.rows.forEach((row) => {
            bySeverity[row.severity] = parseInt(row.count, 10);
        });

        return {
            total: parseInt(totalResult.rows[0]?.count || '0', 10),
            active: parseInt(activeResult.rows[0]?.count || '0', 10),
            contained: parseInt(containedResult.rows[0]?.count || '0', 10),
            resolved: parseInt(resolvedResult.rows[0]?.count || '0', 10),
            by_type: byType,
            by_severity: bySeverity
        };
    }

    static async findNearby(latitude, longitude, radiusKm = 10) {
        const db = (await import('../config/database')).default;
        const result = await db.query(
            `SELECT *, 
             (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
             cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
             sin(radians(latitude)))) AS distance
             FROM disasters 
             WHERE latitude IS NOT NULL AND longitude IS NOT NULL
             AND (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
             cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
             sin(radians(latitude)))) < $3
             ORDER BY distance`,
            [latitude, longitude, radiusKm]
        );
        return result.rows;
    }

    // Helper method to get active disasters
    static async getActiveDisasters() {
        return this.findAll({ status: 'active' });
    }

    // Helper method to get disasters by type
    static async getByType(type) {
        return this.findAll({ type });
    }

    // Helper method to get critical disasters
    static async getCriticalDisasters() {
        return this.findAll({ severity: 'critical' });
    }
}