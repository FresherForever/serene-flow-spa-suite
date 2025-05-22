const { sequelize } = require('../config/database');

// Import models after initializing sequelize
const Customer = require('./Customer');
const Staff = require('./Staff');
const Service = require('./Service');
const Appointment = require('./Appointment');

// Define relationships between models
Appointment.belongsTo(Customer);
Customer.hasMany(Appointment);

Appointment.belongsTo(Staff);
Staff.hasMany(Appointment);

Appointment.belongsTo(Service);
Service.hasMany(Appointment);

// Function to sync all models with the database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

module.exports = {
  Customer,
  Staff,
  Service,
  Appointment,
  sequelize,
  syncDatabase
};