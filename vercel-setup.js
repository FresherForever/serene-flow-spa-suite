// Vercel pre-install script
console.log("Starting Vercel pre-install setup...");

// Write a minimal vite.config.js that will be used during build
const fs = require('fs');
const path = require('path');

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';
console.log(`Running in Vercel environment: ${isVercel ? 'Yes' : 'No'}`);

if (isVercel) {
  try {
    console.log("Creating minimal vite.config.js for Vercel...");
    
    const minimalConfig = `
// Minimal Vite configuration for Vercel build
const path = require('path');

module.exports = {
  plugins: [
    require('@vitejs/plugin-react-swc')(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
  },
};`;
    
    fs.writeFileSync(path.join(process.cwd(), 'vite.config.js'), minimalConfig);
    console.log("Successfully created minimal vite.config.js");
  } catch (error) {
    console.error("Error creating minimal vite.config.js:", error);
  }
}

console.log("Vercel pre-install setup completed");
