// Simple Vite configuration for Vercel deployment
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
  // Explicitly set base path for Vercel
  base: './',
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
  },
}
