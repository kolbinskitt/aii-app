import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/aii-app/' : '/',
    plugins: [
      react(),
      tsconfigPaths(),
      {
        name: 'vite-plugin-404-fix',
        closeBundle() {
          const indexHtml = resolve('dist/index.html');
          const notFoundHtml = resolve('dist/404.html');
          const html = readFileSync(indexHtml, 'utf-8');
          writeFileSync(notFoundHtml, html);
        },
      },
    ],
  };
});
