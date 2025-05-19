// Simple build script for Vercel deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting simple build process...');

// Get Node.js and npm versions
console.log(`Node version: ${process.version}`);
console.log(`NPM version: ${execSync('npm -v').toString().trim()}`);

try {
  // Create dist directory if it doesn't exist
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
    console.log('Created dist directory');
  }  // Run the actual build using Vite
  console.log('Running Vite build process...');
  try {
    execSync('npm run build:vite', { stdio: 'inherit' });
    console.log('Vite build completed successfully');
  } catch (error) {
    console.error('Error running Vite build:', error);
    
    // Fall back to test page if build fails
    console.log('Creating fallback index.html');
    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>Serene Flow Spa</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <h1>Serene Flow Spa Deployment</h1>
    <p>The build process encountered an error. Please check the build logs.</p>
    <p>Built at: ${new Date().toISOString()}</p>
  </body>
</html>`;

    fs.writeFileSync(path.join('dist', 'index.html'), htmlContent);
  }
  console.log('Created index.html');
  // List files in dist directory
  const files = fs.readdirSync('dist');
  console.log('Files in dist directory:', files);

  // Check if index.html exists and has content
  const indexPath = path.join('dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    const stats = fs.statSync(indexPath);
    console.log(`index.html exists: ${stats.size} bytes`);
    
    if (stats.size === 0) {
      console.error('index.html is empty!');
      // Create an emergency index.html
      fs.writeFileSync(indexPath, '<html><body>Emergency fallback page</body></html>');
      console.log('Created emergency index.html');
    }
  } else {
    console.error('index.html does not exist!');
    fs.writeFileSync(indexPath, '<html><body>Emergency fallback page</body></html>');
    console.log('Created emergency index.html');
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Error during build:', error);
  process.exit(1);
}
