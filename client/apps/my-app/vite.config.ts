import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          [
            '@emotion/babel-plugin',
            {
              autoLabel: 'always',
              labelFormat: '[local]',
            },
          ],
        ],
      },
    }),
  ],
  define: {
    global: 'globalThis',
  },
  server:
  {
    port: 3001,
    strictPort: true, // Throw error if port is in use (don't automatically switch to next port)
    open: false,
  },
  resolve:
  {
    alias:
    {
      '@ui/components': path.resolve(__dirname, '../../libs/ui/src'),
    },
  },
});

