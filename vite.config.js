import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { downloadResourceDevApi } from './vite/downloadResourceDevApi.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  process.env.VITE_SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY =
    env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    plugins: [react(), downloadResourceDevApi()],
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
  };
});
