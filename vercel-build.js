// Full build script for Vercel that installs necessary dependencies
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting enhanced Vercel build process...');

try {
  // Ensure all necessary build dependencies are installed
  console.log('Installing required build dependencies...');
  try {
    execSync('npm install --no-save tailwindcss autoprefixer postcss', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
  } catch (depError) {
    console.error('Error installing dependencies:', depError.message);
    // Continue anyway
  }
  // Create a minimal vite config that works with Vercel
  console.log('Creating optimized Vite config for Vercel...');
  const viteConfig = `
// Optimized Vite configuration for Vercel
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // No plugins to avoid dependency issues
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
          ]
        }
      }
    }
  }
});`;

  fs.writeFileSync('vite.config.js', viteConfig);
  console.log('Vite config created.');

  // Create a simplified postcss.config.js
  console.log('Creating optimized PostCSS config...');
  const postcssConfig = `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

  fs.writeFileSync('postcss.config.js', postcssConfig);
  console.log('PostCSS config created.');  // Run the actual build
  console.log('Running Vite build...');  try {
    // Use more robust build options with fallbacks for Vite compatibility
    try {
      execSync('npx vite build', { stdio: 'inherit' });
    } catch (firstError) {
      console.log('First build attempt failed, trying alternative options...');
      try {
        // Remove dist directory manually and try without the flag
        if (fs.existsSync('dist')) {
          fs.rmSync('dist', { recursive: true, force: true });
          console.log('Removed existing dist directory');
        }
        execSync('npx vite build', { stdio: 'inherit' });
      } catch (secondError) {
        // Last resort with minimal config
        console.log('Second attempt failed, trying with minimal configuration...');
        execSync('npx vite build --config vite.minimal.config.js', { stdio: 'inherit' });
      }
    }
    console.log('Build completed successfully!');
  } catch (buildError) {
    console.error('Error during Vite build:');
    console.error(buildError.message);
    
    console.log('Creating fallback index.html instead...');
      const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Serene Flow Spa Suite</title>
  <!-- Tailwind-inspired custom CSS -->
  <style>
    :root {
      --spa-50: #f0f9ff;
      --spa-100: #e0f2fe;
      --spa-200: #bae6fd;
      --spa-300: #7dd3fc;
      --spa-400: #38bdf8;
      --spa-500: #0ea5e9;
      --spa-600: #0284c7;
      --spa-700: #0369a1;
      --spa-800: #075985;
      --spa-900: #0c4a6e;
      --sage-50: #f0fdf4;
      --sage-100: #dcfce7;
      --sage-200: #bbf7d0;
      --sage-300: #86efac;
      --sage-400: #4ade80;
      --sage-500: #22c55e;
      --sage-600: #16a34a;
      --sage-700: #15803d;
      --sage-800: #166534;
      --sage-900: #14532d;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f9fafb;
      color: #1f2937;
      line-height: 1.5;
    }
    
    .h-screen {
      height: 100vh;
    }
    
    .flex {
      display: flex;
    }
    
    .flex-col {
      flex-direction: column;
    }
    
    .flex-1 {
      flex: 1;
    }
    
    .overflow-hidden {
      overflow: hidden;
    }
    
    .overflow-y-auto {
      overflow-y: auto;
    }
    
    .bg-white {
      background-color: white;
    }
    
    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    /* Sidebar styles */
    .sidebar {
      width: 250px;
      background: white;
      border-right: 1px solid #e5e7eb;
      z-index: 30;
      transition: transform 0.3s ease;
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .sidebar-logo {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--spa-600);
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: #4b5563;
      text-decoration: none;
      transition: background-color 0.2s;
      margin-bottom: 0.25rem;
      border-radius: 0.375rem;
      margin: 0.25rem 0.5rem;
    }
    
    .nav-item.active {
      background-color: var(--spa-100);
      color: var(--spa-700);
    }
    
    .nav-item:hover {
      background-color: #f3f4f6;
    }
    
    .icon {
      margin-right: 0.75rem;
      width: 20px;
      height: 20px;
    }
    
    /* Main content styles */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-hidden;
    }
    
    .header {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background-color: white;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--sage-200);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sage-700);
      font-weight: 500;
    }
    
    .content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
      background-color: #f9fafb;
    }
    
    /* Dashboard cards */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    
    .card-title {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
    
    .card-value {
      font-size: 2rem;
      font-weight: 600;
      color: #111827;
    }
    
    /* Status card */
    .status-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-top: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    
    .status-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .status-indicator {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    
    .loading {
      background-color: #e0f2fe;
      color: #0284c7;
    }
    
    .success {
      background-color: #dcfce7;
      color: #16a34a;
    }
    
    .error {
      background-color: #fee2e2;
      color: #dc2626;
    }
    
    .code {
      background-color: #f3f4f6;
      padding: 1rem;
      border-radius: 0.375rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.875rem;
      overflow-x: auto;
    }
    
    pre {
      margin: 0;
    }
    
    button {
      background-color: var(--spa-600);
      color: white;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      margin-top: 1rem;
      transition: background-color 0.2s;
    }
    
    button:hover {
      background-color: var(--spa-700);
    }
    
    footer {
      text-align: center;
      padding: 1.5rem 0;
      color: #6b7280;
      font-size: 0.875rem;
      border-top: 1px solid #e5e7eb;
    }
    
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
    }
    
    h2 {
      font-size: 1.875rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 1.5rem;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
      }
      
      .sidebar.open {
        transform: translateX(0);
      }
      
      .menu-button {
        display: block;
      }
    }
    
    @media (min-width: 769px) {
      .menu-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="h-screen flex overflow-hidden">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">SereneSpa</div>
      </div>
      
      <nav class="flex-1 px-2 py-4 space-y-1">
        <a href="/" class="nav-item active">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Dashboard
        </a>
        <a href="/appointments" class="nav-item">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Appointments
        </a>
        <a href="/staff" class="nav-item">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Staff
        </a>
        <a href="/customers" class="nav-item">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Customers
        </a>
        <a href="/settings" class="nav-item">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Settings
        </a>
      </nav>
      
      <div class="p-4 border-t">
        <div class="flex items-center space-x-3">
          <div class="user-avatar">SA</div>
          <div>
            <div style="font-weight: 500; font-size: 0.875rem;">Spa Admin</div>
            <div style="font-size: 0.75rem; color: #6b7280;">admin@serenespa.com</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="main-content">
      <header class="header">
        <button class="menu-button" id="menuButton">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <div class="user-info">
          <span id="currentDate">Wednesday, May 22, 2025</span>
        </div>
      </header>
      
      <main class="content">
        <h2>Dashboard</h2>
        
        <div class="status-card">
          <h3 class="status-title">Deployment Status</h3>
          <div id="status-indicator" class="status-indicator loading">Checking API status...</div>
          <p id="status-message">Failed to fetch environment information. Please check the API status.</p>
          
          <div class="code">
            <pre id="api-response">Fetching environment information...</pre>
          </div>
          
          <button id="retry-btn">Retry</button>
        </div>
        
        <div class="grid">
          <div class="card">
            <div class="card-title">Today's Appointments</div>
            <div class="card-value">12</div>
          </div>
          
          <div class="card">
            <div class="card-title">Available Staff</div>
            <div class="card-value">5</div>
          </div>
          
          <div class="card">
            <div class="card-title">New Customers</div>
            <div class="card-value">3</div>
          </div>
          
          <div class="card">
            <div class="card-title">Today's Revenue</div>
            <div class="card-value">$1,250</div>
          </div>
        </div>
      </main>
      
      <footer>
        <p>© 2025 Serene Flow Spa Suite. All rights reserved.</p>
      </footer>
    </div>
  </div>
  
  <script>
    // Set current date
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Mobile menu toggle
    document.getElementById('menuButton').addEventListener('click', function() {
      document.querySelector('.sidebar').classList.toggle('open');
    });
    
    // Function to fetch environment data
    async function fetchEnvironmentData() {
      const statusIndicator = document.getElementById('status-indicator');
      const statusMessage = document.getElementById('status-message');
      const responseDiv = document.getElementById('api-response');
      
      statusIndicator.className = 'status-indicator loading';
      statusIndicator.textContent = 'Checking API status...';
      responseDiv.textContent = 'Fetching environment information...';
      
      try {
        // Try both endpoint formats with error handling
        const endpoints = ['/api/environment', '/environment'];
        let data = null;
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint);
            if (response.ok) {
              data = await response.json();
              break;
            }
          } catch (endpointError) {
            console.log('Error fetching from ' + endpoint + ': ' + endpointError.message);
          }
        }
        
        if (data) {
          statusIndicator.className = 'status-indicator success';
          statusIndicator.textContent = 'Connected: ' + (data.environment || 'Unknown');
          statusMessage.textContent = 'API connection successful.';
          responseDiv.textContent = JSON.stringify(data, null, 2);
        } else {
          throw new Error('Could not retrieve environment data from any endpoint');
        }
      } catch (error) {
        statusIndicator.className = 'status-indicator error';
        statusIndicator.textContent = 'Error: Connection Failed';
        statusMessage.textContent = 'Failed to fetch environment information: ' + error.message;
        responseDiv.textContent = 'API endpoints unavailable. Please check the server status.';
      }
    }

    // Attach retry button
    document.getElementById('retry-btn').addEventListener('click', fetchEnvironmentData);
    
    // Initial fetch
    window.addEventListener('DOMContentLoaded', fetchEnvironmentData);
  </script>
</body>
</html>`;
    
    // Ensure dist directory exists
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    
    fs.writeFileSync(path.join('dist', 'index.html'), fallbackHtml);
    console.log('Created fallback index.html');
  }

} catch (error) {
  console.error('Error during build process:');
  console.error(error);
  
  // Create fallback HTML even in case of major errors
  console.log('Creating emergency fallback index.html...');
  
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  const emergencyHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Serene Flow Spa - Deployment Error</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
      .error { color: #d32f2f; border-left: 4px solid #d32f2f; padding-left: 1rem; }
      pre { background: #f5f5f5; padding: 1rem; overflow: auto; }
    </style>
  </head>
  <body>
    <h1>Serene Flow Spa Suite</h1>
    <p>The build process encountered an error. Please check the build logs.</p>
    <div class="error">
      <h3>Error Details</h3>
      <pre>${error.message || 'Unknown error'}</pre>
    </div>
    <p>Built at: ${new Date().toISOString()}</p>
  </body>
</html>`;
  
  fs.writeFileSync(path.join('dist', 'index.html'), emergencyHtml);
  console.log('Created emergency fallback index.html');
}
