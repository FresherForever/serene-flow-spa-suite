const { Sequelize } = require('sequelize');
require('dotenv').config();

// PostgreSQL configuration
let sequelize;

// Check if DATABASE_URL is provided (Vercel deployment)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  });
} else {
  // Local development configuration
  sequelize = new Sequelize(
    process.env.DB_NAME || 'serene_flow_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    // Add connection retry logic
    retry: {
      max: 5,
      match: [
        /ConnectionRefusedError/,
        /Connection terminated unexpectedly/,
        /Connection refused/,
      ]
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    console.error('Please make sure PostgreSQL is installed and running, and the database is created.');
  }
};

testConnection();

module.exports = sequelize;