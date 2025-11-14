import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build:
  {
    lib:
    {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UILibrary',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    rollupOptions:
    {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'styled-components'],
      output:
      {
        globals:
        {
          react: 'React',
          'react-dom': 'ReactDOM',
          'styled-components': 'styled',
        },
      },
    },
    emptyOutDir: false,
  },
});

