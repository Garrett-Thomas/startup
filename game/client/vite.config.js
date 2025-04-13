import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5500/',
      '/socket.io/': {
        target: 'ws://localhost:5500/',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['vue-demi', '@vite/client', '@vite/env'],
  }
});