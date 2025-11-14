import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server:
  {
    port: 3000,
    open: true,
  },
  resolve:
  {
    alias:
    {
      '@ui/components': path.resolve(__dirname, '../../libs/ui/src'),
    },
  },
});

