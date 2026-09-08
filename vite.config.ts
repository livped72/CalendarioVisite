import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true, // accessibile da qualsiasi dispositivo (es. smartphone sulla rete Wi-Fi)
    proxy: {
      // Proxy in locale per testare la Vercel Serverless Function (opzionale se non usi Vercel Dev)
      // '/api': { target: 'http://localhost:3000', changeOrigin: true }
    }
  },
});
