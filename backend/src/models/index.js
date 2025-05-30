import { sequelize } from '../config/database.js';
import Customer from './Customer.js';
import Staff from './Staff.js';
import Service from './Service.js';
import Appointment from './Appointment.js';

// Define relationships between models
Appointment.belongsTo(Customer);
Customer.hasMany(Appointment);

Appointment.belongsTo(Staff);
Staff.hasMany(Appointment);

Appointment.belongsTo(Service);
Service.hasMany(Appointment);

// Function to sync all models with the database
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

export { Customer, Staff, Service, Appointment, sequelize };