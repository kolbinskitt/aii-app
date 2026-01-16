import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/aii-app/' : '/';
  const outDir = 'dist'; // default Vite outDir

  const htmlPath = resolve(outDir, base === '/' ? 'index.html' : 'aii-app/index.html');
  const notFoundPath = resolve(outDir, base === '/' ? '404.html' : 'aii-app/404.html');

  return {
    base,
    plugins: [
      react(),
      tsconfigPaths(),
      {
        name: 'vite-plugin-404-fix',
        closeBundle() {
          if (!existsSync(htmlPath)) {
            console.warn(`[vite-plugin-404-fix] Skipping: ${htmlPath} not found`);
            return;
          }
          const html = readFileSync(htmlPath, 'utf-8');
          writeFileSync(notFoundPath, html);
          console.log(`[vite-plugin-404-fix] 404.html written to ${notFoundPath}`);
        },
      },
    ],
  };
});
