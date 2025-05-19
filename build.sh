#!/bin/bash

# Display Node.js and npm versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm install
npm install vite@latest @vitejs/plugin-react-swc --no-save

# Copy the Vercel-specific Vite config to be used
echo "Setting up Vercel-specific configuration..."
cp vite.config.vercel.js vite.config.js

# Run database migrations
echo "Running database migrations..."
node vercel-migrate.js

# Build the frontend application
echo "Building frontend application..."
npx vite build

# Install API dependencies
echo "Setting up API directory..."
cd api
npm install
cd ..

echo "Build completed successfully!"
