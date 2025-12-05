import { DatabaseSetup } from '../src/database/setup.js';

async function seedDatabase() {
    console.log('🌱 Starting database seeding...');
    
    try {
        await DatabaseSetup.initialize();
        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();