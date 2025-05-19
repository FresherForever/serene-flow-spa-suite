#!/bin/bash

# Display Node.js and npm versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

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
