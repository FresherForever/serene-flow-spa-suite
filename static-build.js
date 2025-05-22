// Simple Static Build Script for Vercel
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting simple static build process...');

try {  // Always create fresh dist directory
  if (fs.existsSync('dist')) {
    // Remove old directory
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Removed existing dist directory');
  }
  
  // Create fresh dist directory
  fs.mkdirSync('dist', { recursive: true });
  console.log('Created dist directory');
  
  // Create .vercel/output/static directory for Vercel v2 output
  if (!fs.existsSync('.vercel/output/static')) {
    fs.mkdirSync('.vercel/output/static', { recursive: true });
    console.log('Created .vercel/output/static directory');
  }
  
  // Create a simple index.html with no build dependencies
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Serene Flow Spa</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid #eaeaea;
      padding-bottom: 1rem;
    }
    .main-content {
      display: grid;
      grid-template-columns: 1fr 3fr;
      gap: 2rem;
    }
    .sidebar {
      border-right: 1px solid #eaeaea;
      padding-right: 1rem;
    }
    .content {
      padding: 1rem;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .card {
      border: 1px solid #eaeaea;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .card h3 {
      margin-top: 0;
    }
    .status {
      padding: 0.5rem;
      border-radius: 4px;
      display: inline-block;
      margin-top: 0.5rem;
    }
    .status.success {
      background-color: #e6f7e6;
      color: #2e7d32;
    }
    .status.error {
      background-color: #fdeded;
      color: #d32f2f;
    }
    .status.loading {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    button {
      background-color: #4a90e2;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #357ae8;
    }
    .nav-item {
      padding: 0.75rem 1rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .nav-item:hover {
      background-color: #f5f5f5;
    }
    .nav-item.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    .nav-item svg {
      margin-right: 0.5rem;
    }
    .code {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      font-family: 'Courier New', Courier, monospace;
      overflow-x: auto;
    }
    .footer {
      margin-top: 2rem;
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid #eaeaea;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Serene Flow Spa Suite</h1>
    <div id="user-info">
      <strong>Spa Admin</strong> (admin@serenespa.com)
    </div>
  </div>
  
  <div class="main-content">
    <div class="sidebar">
      <div class="nav-item active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Dashboard
      </div>
      <div class="nav-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Appointments
      </div>
      <div class="nav-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Staff
      </div>
      <div class="nav-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Customers
      </div>
      <div class="nav-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Settings
      </div>
    </div>
    
    <div class="content">
      <h2>Dashboard</h2>
      
      <div class="card" id="deployment-status">
        <h3>Deployment Status</h3>
        <div id="env-status" class="status loading">Loading...</div>
        <div id="env-info" class="code">
          Fetching environment information...
        </div>
        <button id="retry-btn" style="margin-top: 1rem;">Retry</button>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
        <div class="card">
          <h3>Today's Appointments</h3>
          <div style="font-size: 2rem; font-weight: bold;">12</div>
        </div>
        
        <div class="card">
          <h3>Available Staff</h3>
          <div style="font-size: 2rem; font-weight: bold;">5</div>
        </div>
        
        <div class="card">
          <h3>New Customers</h3>
          <div style="font-size: 2rem; font-weight: bold;">3</div>
        </div>
        
        <div class="card">
          <h3>Today's Revenue</h3>
          <div style="font-size: 2rem; font-weight: bold;">$1,250</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>© 2025 Serene Flow Spa Suite. All rights reserved.</p>
  </div>
  
  <script>
    // Simple function to fetch environment data
    async function fetchEnvironmentData() {
      const envStatus = document.getElementById('env-status');
      const envInfo = document.getElementById('env-info');
      
      envStatus.className = 'status loading';
      envStatus.textContent = 'Loading...';
      
      try {
        // Try both endpoint formats to handle both local and Vercel environments
        const responses = await Promise.allSettled([
          fetch('/api/environment'),
          fetch('/environment')
        ]);
        
        // Find a successful response
        let data = null;
        for (const response of responses) {
          if (response.status === 'fulfilled' && response.value.ok) {
            data = await response.value.json();
            break;
          }
        }
        
        if (data) {
          envStatus.className = 'status success';
          envStatus.textContent = 'Connected: ' + (data.environment || 'Unknown');
          
          // Display environment data
          envInfo.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } else {
          throw new Error('Could not retrieve environment data from any endpoint');
        }
      } catch (error) {
        envStatus.className = 'status error';
        envStatus.textContent = 'Error: ' + error.message;
        envInfo.textContent = 'Failed to fetch environment information. Please check the API status.';
      }
    }

    // Attach retry button
    document.getElementById('retry-btn').addEventListener('click', fetchEnvironmentData);
    
    // Initial fetch
    window.addEventListener('DOMContentLoaded', fetchEnvironmentData);
  </script>
</body>
</html>
  `;
    // Write to dist directory
  fs.writeFileSync(path.join('dist', 'index.html'), htmlContent);
  console.log('Created static index.html in dist directory');
  
  // Write to .vercel/output/static directory for Vercel v2 output
  fs.writeFileSync(path.join('.vercel/output/static', 'index.html'), htmlContent);
  console.log('Created static index.html in .vercel/output/static directory');
  
  // Create config.json for Vercel v2 output
  const configJson = {
    "version": 2,
    "routes": [
      { "handle": "filesystem" },
      { "src": "/api/health", "dest": "/api" },
      { "src": "/api/(.*)", "dest": "/api/[...catchAll]" },
      { "src": "/(.*)", "dest": "/index.html" }
    ]
  };
  
  fs.writeFileSync(path.join('.vercel/output', 'config.json'), JSON.stringify(configJson, null, 2));
  console.log('Created config.json in .vercel/output directory');
  
  // Copy favicon to both directories
  if (fs.existsSync('public/favicon.ico')) {
    fs.copyFileSync('public/favicon.ico', path.join('dist', 'favicon.ico'));
    fs.copyFileSync('public/favicon.ico', path.join('.vercel/output/static', 'favicon.ico'));
    console.log('Copied favicon.ico to both output directories');
  }

  console.log('Static build completed successfully!');
} catch (error) {
  console.error('Error during static build:', error);
  process.exit(1);
}
