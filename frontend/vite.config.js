import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/execute': {
        target: 'https://api.jdoodle.com/v1/execute',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/execute/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
