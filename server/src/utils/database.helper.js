import { Database, db } from '../config/database.js';

export class DatabaseHelper {
    
    /**
     * Get database instance
     */
    static getInstance() {
        return Database.getInstance();
    }

    /**
     * Query method
     */
    static async query(text, params) {
        const result = await db.query(text, params);
        return result.rows;
    }

    /**
     * Query for single result
     */
    static async queryOne(text, params) {
        const result = await db.query(text, params);
        return result.rows[0] || null;
    }

    /**
     * Execute query and return affected row count
     */
    static async execute(text, params) {
        const result = await db.query(text, params);
        return result.rowCount || 0;
    }

    /**
     * Execute transaction
     */
    static async transaction(callback) {
        return db.transaction(callback);
    }

    /**
     * Health check
     */
    static async healthCheck() {
        return db.healthCheck();
    }

    /**
     * Pagination helper
     */
    static buildPagination(page = 1, limit = 50) {
        const offset = Math.max(0, (page - 1) * limit);
        return {
            offset,
            limit,
            clause: `LIMIT ${limit} OFFSET ${offset}`
        };
    }

    /**
     * Build WHERE clause from filters
     */
    static buildWhereClause(filters, operator = 'AND') {
        const conditions = [];
        const values = [];
        let paramCount = 1;

        Object.entries(filters).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            if (Array.isArray(value)) {
                // Handle IN clause
                const placeholders = value.map(() => `$${paramCount++}`).join(', ');
                conditions.push(`${key} IN (${placeholders})`);
                values.push(...value);
            } else if (typeof value === 'string' && (value.includes('%') || value.includes('*'))) {
                // Handle LIKE/ILIKE clause
                const likeValue = value.replace(/\*/g, '%');
                conditions.push(`${key} ILIKE $${paramCount++}`);
                values.push(likeValue);
            } else if (typeof value === 'object' && 'operator' in value && 'value' in value) {
                // Handle custom operators: { operator: '>', value: 10 }
                conditions.push(`${key} ${value.operator} $${paramCount++}`);
                values.push(value.value);
            } else {
                // Handle equality
                conditions.push(`${key} = $${paramCount++}`);
                values.push(value);
            }
        });

        return {
            clause: conditions.length > 0 ? `WHERE ${conditions.join(` ${operator} `)}` : '',
            values
        };
    }

    /**
     * Build INSERT query
     */
    static buildInsertQuery(table, data, returning = '*') {
        const columns = Object.keys(data).filter(key => data[key] !== undefined);
        const placeholders = columns.map((_, i) => `$${i + 1}`);
        const values = columns.map(col => data[col]);

        const text = `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING ${returning}
        `;

        return { text, values };
    }

    /**
     * Build UPDATE query
     */
    static buildUpdateQuery(table, updates, where, returning = '*') {
        const setClauses = [];
        const values = [];
        let paramCount = 1;

        // Build SET clause
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                setClauses.push(`${key} = $${paramCount++}`);
                values.push(value);
            }
        });

        // Build WHERE clause
        const whereClauses = [];
        Object.entries(where).forEach(([key, value]) => {
            whereClauses.push(`${key} = $${paramCount++}`);
            values.push(value);
        });

        if (whereClauses.length === 0) {
            throw new Error('WHERE clause cannot be empty for UPDATE query');
        }

        const text = `
            UPDATE ${table}
            SET ${setClauses.join(', ')}
            WHERE ${whereClauses.join(' AND ')}
            RETURNING ${returning}
        `;

        return { text, values };
    }

    /**
     * Build SELECT query
     */
    static buildSelectQuery(table, fields = ['*'], where, orderBy, pagination) {
        const values = [];
        let paramCount = 1;

        // Build WHERE clause
        let whereClause = '';
        if (where && Object.keys(where).length > 0) {
            const whereResult = this.buildWhereClause(where);
            whereClause = whereResult.clause;
            values.push(...whereResult.values);
            paramCount += whereResult.values.length;
        }

        // Build ORDER BY clause
        let orderByClause = '';
        if (orderBy && orderBy.length > 0) {
            const orderParts = orderBy.map(order => 
                `${order.field} ${order.direction}`
            );
            orderByClause = `ORDER BY ${orderParts.join(', ')}`;
        }

        // Build pagination
        let paginationClause = '';
        if (pagination) {
            const paginationResult = this.buildPagination(pagination.page, pagination.limit);
            paginationClause = paginationResult.clause;
        }

        const text = `
            SELECT ${fields.join(', ')}
            FROM ${table}
            ${whereClause}
            ${orderByClause}
            ${paginationClause}
        `.trim();

        return { text, values };
    }

    /**
     * Escape SQL identifier
     */
    static escapeIdentifier(identifier) {
        return `"${identifier.replace(/"/g, '""')}"`;
    }

    /**
     * Escape SQL value
     */
    static escapeValue(value) {
        if (value === null || value === undefined) {
            return 'NULL';
        }
        if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
        }
        if (typeof value === 'boolean') {
            return value ? 'TRUE' : 'FALSE';
        }
        if (value instanceof Date) {
            return `'${value.toISOString()}'`;
        }
        if (typeof value === 'object') {
            return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        }
        return String(value);
    }
}

export default DatabaseHelper;