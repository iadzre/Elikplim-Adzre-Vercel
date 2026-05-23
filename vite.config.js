import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  // Vercel was configured with NEXT_PUBLIC_*; Vite normally only exposes VITE_*.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
});
