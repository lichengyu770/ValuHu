import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    globals: true,
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/index.jsx',
        'src/App.jsx',
        'src/main.tsx'
      ]
    },
    moduleNameMapping: {
      '^@/(.*)$': '<rootDir>/src/$1'
    }
  }
});