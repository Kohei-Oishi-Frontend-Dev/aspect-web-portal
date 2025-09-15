import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()],
  server: {
    // The proxy configuration is the key part of this file.
    proxy: {
      // Rule 1: For the User Login API
      '/api': {
        target: 'https://chumley--portal.sandbox.my.site.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
      // 📄 Profile API (separate for clarity)
      "/profile-api": {
        target: 'https://chumley--portal.sandbox.my.site.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/profile-api/, ""),
      },
      // // Rule 3: For the Forgot Password API

      // ''
      // Rule 2: For the Authentication (Token) API
      '/auth-api': {
        target: 'https://chumley--portal.sandbox.my.salesforce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, ''),
        secure: false,
      },
    },
  },
});