import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['tone', '@supabase/supabase-js'],
    exclude: ['@mediapipe/tasks-vision'],
  },
  server: {
    port: 5173,
    open: true,
  },
});
