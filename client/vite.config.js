import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://127.0.0.1:5000',
      '/posts': 'http://127.0.0.1:5000',
      '/videos': 'http://127.0.0.1:5000',
      '/books': 'http://127.0.0.1:5000',
      '/providers': 'http://127.0.0.1:5000',
      '/consultations': 'http://127.0.0.1:5000',
      '/tracking': 'http://127.0.0.1:5000',
      '/ad-removal': 'http://127.0.0.1:5000',
      '/admin': 'http://127.0.0.1:5000',
      '/chat': 'http://127.0.0.1:5000',
      '/health': 'http://127.0.0.1:5000'
    }
  }
});
