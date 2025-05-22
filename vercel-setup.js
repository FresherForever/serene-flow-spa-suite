// Enhanced Vercel pre-install and setup script
// This script prepares the environment for Vercel deployment
console.log("📦 Starting enhanced Vercel pre-installation setup...");

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import { execSync } from 'child_process';

// Get directory information
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment detection
const isVercel = process.env.VERCEL === '1';
const isCI = process.env.CI === 'true' || process.env.VERCEL === '1';
const nodeEnv = process.env.NODE_ENV || 'development';

console.log(`🔍 Environment Information:`);
console.log(`- Vercel: ${isVercel ? 'Yes' : 'No'}`);
console.log(`- CI: ${isCI ? 'Yes' : 'No'}`);
console.log(`- Node Environment: ${nodeEnv}`);
console.log(`- Node Version: ${process.version}`);

// Only run these optimizations in Vercel environment
if (isVercel || isCI) {
  try {
    // Create a simple spinner animation
    let spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;
    let spinnerInterval;
    
    function startSpinner(text) {
      spinnerInterval = setInterval(() => {
        process.stdout.write(`\r${spinnerChars[spinnerIndex]} ${text}`);
        spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
      }, 100);
    }
    
    function stopSpinner(success = true, message = '') {
      clearInterval(spinnerInterval);
      process.stdout.write(`\r${success ? '✅' : '❌'} ${message}\n`);
    }
    
    // 1. Create minimal vite.config.js
    startSpinner("Creating optimized Vite config...");
    
    try {
      // Try to load from dedicated Vercel config first
      if (fs.existsSync(path.join(process.cwd(), 'vite.config.vercel.js'))) {
        const minimalConfig = fs.readFileSync(path.join(process.cwd(), 'vite.config.vercel.js'), 'utf8');
        fs.writeFileSync(path.join(process.cwd(), 'vite.config.js'), minimalConfig);
      } else {
        // Create a new minimal config
        const viteConfig = `
// Optimized Vite configuration for Vercel
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
});`;
        fs.writeFileSync(path.join(process.cwd(), 'vite.config.js'), viteConfig);
      }
      stopSpinner(true, "Created optimized Vite config");
    } catch (err) {
      stopSpinner(false, "Failed to create Vite config");
      console.error(`Error: ${err.message}`);
      // Continue despite error
    }
    
    // 2. Create simplified PostCSS config
    startSpinner("Creating optimized PostCSS config...");
    
    const postCssConfig = `
// ES Module version of PostCSS config for Vercel
export default {
  plugins: {
    // Only include autoprefixer for compatibility
    autoprefixer: {}
  }
}`;
    
    try {
      fs.writeFileSync(path.join(process.cwd(), 'postcss.config.js'), postCssConfig);
      stopSpinner(true, "Created optimized PostCSS config");
    } catch (err) {
      stopSpinner(false, "Failed to create PostCSS config");
      console.error(`Error: ${err.message}`);
      // Continue despite error
    }
  } catch (error) {
    console.error("Error during Vercel setup:", error);
  }
}

console.log("Vercel pre-install setup completed");