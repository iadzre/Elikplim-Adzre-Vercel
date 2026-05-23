import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          if (
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/react/')
          ) {
            return 'vendor';
          }
        },
      },
    },
  },
});
