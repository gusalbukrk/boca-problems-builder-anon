import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslint({
      fix: true,
      include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.json'],
    }),
    react(),
  ],
});
