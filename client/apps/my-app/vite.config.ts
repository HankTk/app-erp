import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server:
  {
    port: 3001,
    strictPort: true, // ポートが使用中の場合はエラーを出す（自動的に次のポートに切り替えない）
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

