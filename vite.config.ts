import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    chunkSizeWarningLimit: 2000, // deck.gl + maplibre are legitimately large
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-map': ['maplibre-gl', 'react-map-gl', '@deck.gl/core', '@deck.gl/layers', '@deck.gl/mapbox'],
          'vendor-data': ['geotiff', 'zarrita'],
          // recharts must share a chunk with react to avoid a circular split
          'vendor-react': ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit', 'recharts'],
        },
      },
    },
  },
});
