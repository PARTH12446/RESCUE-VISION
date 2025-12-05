import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log('🚀 Running resources coordinates / road_status migration...');

    const sqlPath = path.join(__dirname, '0012_add_coordinates_and_road_status_to_resources.sql');

    try {
        const sql = await fs.readFile(sqlPath, 'utf8');
        await db.query(sql);
        console.log('✅ Migration applied successfully.');
    } catch (err) {
        console.error('❌ Failed to run migration:', err.message || err);
        process.exitCode = 1;
    } finally {
        try {
            await db.close();
        } catch (_) {
            // ignore
        }
    }
}

run();
