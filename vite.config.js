import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/aii-app/' : '/',
    plugins: [
      react(),
      {
        name: 'vite-plugin-404-fix',
        closeBundle: () => {
          // Kopiuj index.html jako 404.html
          const indexHtml = resolve(__dirname, 'dist/index.html');
          const notFoundHtml = resolve(__dirname, 'dist/404.html');
          writeFileSync(notFoundHtml, require('fs').readFileSync(indexHtml));
        },
      },
    ],
  };
});
