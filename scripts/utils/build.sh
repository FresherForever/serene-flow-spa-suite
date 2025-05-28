#!/bin/bash

# Display Node.js and npm versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm install
npm install vite@latest --no-save

# Create a public directory with a minimal index.html for testing
echo "Creating minimal build output..."
mkdir -p dist
echo "<!DOCTYPE html>
<html>
  <head>
    <title>Serene Flow Spa</title>
  </head>
  <body>
    <h1>Serene Flow Spa Deployment Test</h1>
    <p>Testing Vercel deployment</p>
  </body>
</html>" > dist/index.html

echo "Verifying dist directory..."
ls -la dist/

# Run database migrations
echo "Running database migrations..."
node vercel-migrate.js

# Install API dependencies
echo "Setting up API directory..."
cd api
npm install
cd ..

echo "Build completed successfully!"
