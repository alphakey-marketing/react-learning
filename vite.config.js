import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    assetsInlineLimit: 100000000, // inline all assets into JS to avoid file:// loading issues
    cssCodeSplit: false,          // single CSS file
    rollupOptions: {
      output: {
        manualChunks: undefined,  // no code splitting - single JS bundle
        inlineDynamicImports: true,
      }
    }
  },
  server: {
    host: '0.0.0.0',
  }
})
