// Vercel pre-install script
console.log("Starting Vercel pre-install setup...");

// Write a minimal vite.config.js that will be used during build
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';
console.log(`Running in Vercel environment: ${isVercel ? 'Yes' : 'No'}`);

if (isVercel) {
  try {
    console.log("Creating minimal vite.config.js for Vercel...");
    // Simply copy from the existing vite.config.vercel.js file
    const minimalConfig = fs.readFileSync(path.join(process.cwd(), 'vite.config.vercel.js'), 'utf8');
    fs.writeFileSync(path.join(process.cwd(), 'vite.config.js'), minimalConfig);
    console.log("Successfully created minimal vite.config.js");
    
    // Create simplified PostCSS config without requiring tailwindcss
    console.log("Creating simplified postcss.config.js for Vercel...");
    const postCssConfig = `
module.exports = {
  plugins: {
    // Simplified config that doesn't require tailwindcss
    autoprefixer: {}
  }
}`;
    fs.writeFileSync(path.join(process.cwd(), 'postcss.config.js'), postCssConfig);
    console.log("Successfully created simplified postcss.config.js");
  } catch (error) {
    console.error("Error during Vercel setup:", error);
  }
}

console.log("Vercel pre-install setup completed");