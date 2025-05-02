# Serene Flow Spa Suite Backend

This is the Express.js backend for the Serene Flow Spa Suite application, providing RESTful API endpoints for managing appointments, customers, staff, and services.

## Technologies Used

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Powerful, open-source relational database
- **Sequelize ORM** - Object-Relational Mapping for database operations

## PostgreSQL Setup

1. **Install PostgreSQL**
   - Visit the [PostgreSQL official download page](https://www.postgresql.org/download/windows/)
   - Download the installer for Windows
   - Run the installer and follow the setup wizard
   - Select the components to install (PostgreSQL Server, pgAdmin 4, and Command Line Tools)
   - Set a password for the postgres user (remember this password)
   - Keep the default port (5432)

2. **Create Database with pgAdmin 4**
   - After installation, open pgAdmin 4 from the Start menu
   - If this is your first time opening pgAdmin, set a master password for pgAdmin itself
   - In the left sidebar, expand "Servers" by clicking the "+" icon
   - Right-click on the PostgreSQL server and select "Connect Server"
   - Enter the password you created during PostgreSQL installation
   - Once connected, right-click on the "Databases" folder
   - Select "Create" then "Database..."
   - In the "Create - Database" dialog box:
     - Enter `serene_flow_db` in the "Database" field
     - Ensure "Owner" is set to "postgres"
   - Click "Save" to create the database
   - The new database should appear in the list under the "Databases" folder

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   
   # PostgreSQL Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=serene_flow_db
   DB_USER=postgres
   DB_PASSWORD=postgres   # Use the password you set during installation
   ```

## Running the Application

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get a specific customer
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Staff
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get a specific staff member
- `POST /api/staff` - Create a new staff member
- `PUT /api/staff/:id` - Update a staff member
- `DELETE /api/staff/:id` - Delete a staff member

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get a specific service
- `POST /api/services` - Create a new service
- `PUT /api/services/:id` - Update a service
- `DELETE /api/services/:id` - Delete a service

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get a specific appointment
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment

## Health Check

- `GET /api/health` - Check if the server is running