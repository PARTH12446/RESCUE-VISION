 import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js'; // Use the singleton db instance

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseSetup {
    static async initialize() {
        try {
            // Read and execute schema SQL
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
            
            console.log('📊 Setting up database schema...');
            await db.query(schemaSQL);
            
            console.log('✅ Database setup completed successfully');
            
            // Insert sample data for development
            if (process.env.NODE_ENV === 'development') {
                await this.insertSampleData();
            }
        } catch (error) {
            console.error('❌ Database setup failed:', error);
            throw error;
        }
    }

    static async insertSampleData() {
        try {
            console.log('📝 Inserting sample data...');
            
            // Insert sample users
            await db.query(`
                INSERT INTO users (username, email, password_hash, role, full_name, phone_number, location)
                VALUES 
                ('admin1', 'admin@rescuevision.com', 'hashed_password_123', 'admin', 'John Admin', '+1234567890', 'New York, USA'),
                ('responder1', 'responder@rescuevision.com', 'hashed_password_456', 'responder', 'Sarah Responder', '+1234567891', 'Los Angeles, USA'),
                ('civilian1', 'civilian@rescuevision.com', 'hashed_password_789', 'civilian', 'Mike Civilian', '+1234567892', 'Chicago, USA')
                ON CONFLICT (email) DO NOTHING;
            `);
            
            // Insert sample disasters
            await db.query(`
                INSERT INTO disasters (type, title, description, location, latitude, longitude, severity, reported_by, started_at)
                SELECT 
                    'flood',
                    'Major Flood in Downtown',
                    'Heavy rainfall causing flooding in downtown area',
                    'Downtown Area, Cityville',
                    40.7128,
                    -74.0060,
                    'high',
                    u.id,
                    NOW() - INTERVAL '2 days'
                FROM users u WHERE u.email = 'civilian@rescuevision.com'
                UNION ALL
                SELECT 
                    'fire',
                    'Forest Fire Alert',
                    'Wildfire spreading in northern forest region',
                    'Northern Forest, Greenstate',
                    34.0522,
                    -118.2437,
                    'critical',
                    u.id,
                    NOW() - INTERVAL '1 day'
                FROM users u WHERE u.email = 'responder@rescuevision.com'
                ON CONFLICT DO NOTHING;
            `);
            
            console.log('✅ Sample data inserted successfully');
        } catch (error) {
            console.error('❌ Failed to insert sample data:', error);
        }
    }

    static async checkHealth() {
        try {
            await db.query('SELECT 1');
            return true;
        } catch (error) {
            console.error('❌ Database health check failed:', error);
            return false;
        }
    }
}