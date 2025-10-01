import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Rule 1: For the User Login API
      "/api": {
        target: "https://chumley--qa.sandbox.my.site.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
      },
      "/reports-api": {
        target: "https://chumley--qa.sandbox.my.site.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reports-api/, ""),
        secure: false,
      },
      // THIS IS THE CORRECTED RULE 👇
      "/invoice-api": {
        target: "https://chumley--qa.sandbox.my.site.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/invoice-api/, ""),
        secure: false,
      },
      "/creditnotes-api": {
        target: "https://chumley--qa.sandbox.my.site.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/creditnotes-api/, ""), // Fixed this line
        secure: false,
      },
      "/billing-api": {
        target: "https://chumley--qa.sandbox.my.site.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/billing-api/, ""),
        secure: false,
      },
      // 📄 Profile API (separate for clarity)
      "/profile-api": {
        target: "https://chumley--qa.sandbox.my.site.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/profile-api/, ""),
      },
      "/users-api": {
        target: "https://chumley--qa.sandbox.my.site.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/users-api/, ""),
        secure: false,
      },
      "/sites-api": {
        target: "https://chumley--qa.sandbox.my.site.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sites-api/, ""),
        secure: false,
      },
      // Rule 2: For the Authentication (Token) API
      "/auth-api": {
        target: "https://chumley--qa.sandbox.my.site.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, ""),
        secure: false,
      },
    },
  },
});
