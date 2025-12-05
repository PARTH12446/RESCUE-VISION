import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
    static instance = null;
    pool;

    /**
     * Private constructor to enforce singleton pattern
     */
    constructor(config) {
        const poolConfig = {
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            ssl: config.ssl || false,
            max: config.max || 20,
            idleTimeoutMillis: config.idleTimeoutMillis || 30000,
            connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
        };

        this.pool = new Pool(poolConfig);
        this.setupEventListeners();
        this.testConnection().catch(error => {
            console.error('❌ Initial database connection test failed:', error.message);
        });
    }

    /**
     * Get singleton instance of Database
     */
    static getInstance() {
        if (!Database.instance) {
            const config = {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: process.env.DB_NAME || 'rescuevision',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                ssl: process.env.DB_SSL === 'true',
                max: parseInt(process.env.DB_POOL_MAX || '20'),
                idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
                connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
            };
            Database.instance = new Database(config);
        }
        return Database.instance;
    }

    /**
     * Setup pool event listeners
     */
    setupEventListeners() {
        this.pool.on('connect', () => {
            console.log('🔌 Database client connected');
        });

        this.pool.on('error', (err) => {
            console.error('💥 Unexpected database pool error:', err);
        });

        this.pool.on('remove', () => {
            console.log('🔌 Database client removed');
        });
    }

    /**
     * Test database connection
     */
    async testConnection() {
        try {
            const client = await this.pool.connect();
            console.log('✅ Database connection established successfully');
            client.release();
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    /**
     * Execute a query with typed results
     */
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`📊 Executed query (${duration}ms):`, {
                    text: text.length > 200 ? text.substring(0, 200) + '...' : text,
                    params,
                    rows: result.rowCount
                });
            }
            
            return result;
        } catch (error) {
            console.error(`❌ Query error: ${text}`, error);
            throw error;
        }
    }

    /**
     * Execute a transaction
     */
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get raw pool instance (for advanced usage)
     */
    getPool() {
        return this.pool;
    }

    /**
     * Close all database connections
     */
    async close() {
        await this.pool.end();
        console.log('👋 Database connections closed');
        Database.instance = null;
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            await this.query('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get connection stats
     */
    async getStats() {
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
        };
    }
}

// Export singleton instance for convenience
export const db = Database.getInstance();
export default Database;