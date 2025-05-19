// Database migration script for Vercel
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting Vercel database migration...');

// Check if we're in a Vercel environment
if (process.env.VERCEL === '1' || process.env.DATABASE_URL) {
  console.log('Running in Vercel environment or with DATABASE_URL - attempting database migration');
  console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);
    try {
    // Import Sequelize models
    const sequelize = require('./backend/src/config/database');
    const Customer = require('./backend/src/models/Customer');
    const Staff = require('./backend/src/models/Staff');
    const Service = require('./backend/src/models/Service');
    const Appointment = require('./backend/src/models/Appointment');
    
    // Define relationships between models
    Appointment.belongsTo(Customer);
    Customer.hasMany(Appointment);
    
    Appointment.belongsTo(Staff);
    Staff.hasMany(Appointment);
    
    Appointment.belongsTo(Service);
    Service.hasMany(Appointment);
    
    // Sync database
    (async () => {
      try {
        console.log('Synchronizing database schema...');
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');
        
        // Check if we need to seed initial data
        const serviceCount = await Service.count();
        if (serviceCount === 0) {
          console.log('Seeding initial data...');
          
          // Seed services
          await Service.bulkCreate([
            { name: 'Swedish Massage', description: 'Relaxing full-body massage', duration: 60, price: 80.00 },
            { name: 'Deep Tissue Massage', description: 'Therapeutic massage targeting deep muscle tension', duration: 60, price: 95.00 },
            { name: 'Hot Stone Massage', description: 'Massage with heated stones for deep relaxation', duration: 90, price: 110.00 },
            { name: 'Facial Treatment', description: 'Cleansing and rejuvenating facial', duration: 45, price: 70.00 },
          ]);
          
          // Seed staff members
          await Staff.bulkCreate([
            { firstName: 'John', lastName: 'Smith', email: 'john.smith@sereneflow.com', position: 'Massage Therapist' },
            { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@sereneflow.com', position: 'Esthetician' },
          ]);
          
          console.log('Initial data seeded successfully');
        } else {
          console.log('Database already contains data - skipping seed process');
        }
      } catch (error) {
        console.error('Error during database synchronization:', error);
        process.exit(1);
      }
    })();
  } catch (error) {
    console.error('Error importing database models:', error);
    process.exit(1);
  }
} else {
  console.log('Not running in Vercel environment - skipping migration');
}

// Exit successfully (process will end after async operations complete)
console.log('Migration script initialized');
