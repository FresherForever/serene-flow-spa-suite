# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b6bea204-80c5-420f-b65f-b8ebb8afb703

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b6bea204-80c5-420f-b65f-b8ebb8afb703) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b6bea204-80c5-420f-b65f-b8ebb8afb703) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Serene Flow Spa Suite

A comprehensive spa management application for appointment booking, customer management, and service scheduling.

## Tech Stack

- Frontend: React with Vite, TypeScript, Tailwind CSS
- Backend: Node.js with Express.js
- Database: PostgreSQL

## Getting Started

### Prerequisites

- Node.js and npm installed
- PostgreSQL installed (see PostgreSQL setup below)

### PostgreSQL Setup

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

### Running the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd serene-flow-spa-suite
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   
   # Create .env file if it doesn't exist
   echo "PORT=5000
   NODE_ENV=development
   
   # PostgreSQL Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=serene_flow_db
   DB_USER=postgres
   DB_PASSWORD=postgres" > .env
   
   # Start the backend server
   npm run dev
   ```

3. Set up the frontend (in a new terminal):
   ```bash
   # From the project root
   npm install
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health check: http://localhost:5000/api/health

## Verification Tools

The application comes with comprehensive verification tools to ensure both local and Vercel deployments are working correctly:

### Quick Verification

```powershell
# Start servers and verify all components
./start-dev.ps1

# Check server status with self-healing
./check-servers.ps1 -SelfHeal

# Run comprehensive verification
./verify-all.ps1
```

### Environment Comparison

```powershell
# Compare local and Vercel environments
./master-verify.ps1 -CompareEnvironments

# Generate HTML comparison report
./master-verify.ps1 -CompareEnvironments -GenerateHtmlReport
```

### Verification Documentation

For detailed information on verification tools:
- See `VERIFICATION_README.md` for all available verification tools
- See `ENVIRONMENT_COMPARISON.md` for environment comparison details
- See `VERIFICATION_GUIDE.md` for step-by-step verification process

## API Documentation

The backend provides the following REST endpoints:

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Staff
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get staff by ID 
- `POST /api/staff` - Create a new staff member
- `PUT /api/staff/:id` - Update a staff member
- `DELETE /api/staff/:id` - Delete a staff member

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create a new service
- `PUT /api/services/:id` - Update a service
- `DELETE /api/services/:id` - Delete a service

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment
