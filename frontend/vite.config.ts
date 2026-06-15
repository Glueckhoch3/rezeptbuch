/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// The dev server proxies /api to the backend so the browser only ever talks
// to a single origin during development.
export default defineConfig(({ mode }) => {
  const rootDir = fileURLToPath(new URL('..', import.meta.url));
  const env = loadEnv(mode, rootDir, '');

  return {
    envDir: rootDir,
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: false,
    },
  };
});
