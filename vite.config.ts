import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // otherwise, error `Top-level await is not available in the configured target environment`
    target: 'esnext',
  },
  plugins: [
    eslint({
      fix: true,
      include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.json'],
    }),
    react(),
  ],
});
