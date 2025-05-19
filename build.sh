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

# Build the application
echo "Building application..."
npx vite build

echo "Build completed successfully!"
