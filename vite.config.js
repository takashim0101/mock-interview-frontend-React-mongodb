// vite.config.js
// This configuration tells Vite: "Whenever the frontend tries to fetch a path that starts
// with /api/interview, don't try to serve it from the frontend's dev server.
// Instead, send that request to http://localhost:3000."

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configure proxy to forward API requests to the backend
    proxy: {
      '/api/interview': { // When the frontend requests a URL starting with /api/interview
        target: 'http://localhost:3000', // Forward it to the backend server (your Node.js app)
        changeOrigin: true, // Needed for virtual hosted sites
        // rewrite: (path) => path.replace(/^\/api\/interview/, '/api/interview'), // Optional: if your backend route is exactly /api/interview
      },
    },
  },
});