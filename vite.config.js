import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxy = {
  '/v1': { target: 'http://127.0.0.1:4000', changeOrigin: true },
  '/uploads': { target: 'http://127.0.0.1:4000', changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5174, strictPort: true, proxy },
  preview: { host: '127.0.0.1', port: 5184, strictPort: true, proxy },
});
