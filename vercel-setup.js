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
    
    const minimalConfig = `
// Minimal Vite configuration for Vercel build
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
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
});`;
      fs.writeFileSync(path.join(process.cwd(), 'vite.config.js'), minimalConfig);
    console.log("Successfully created minimal vite.config.js");
  } catch (error) {
    console.error("Error creating minimal vite.config.js:", error);
  }
}

console.log("Vercel pre-install setup completed");
