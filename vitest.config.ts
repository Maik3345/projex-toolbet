import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist'],
    typecheck: {
      tsconfig: './tsconfig.test.json'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html','lcov'],
      exclude: [
        'node_modules',
        'dist',
        'bin',
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@api': resolve(__dirname, 'src/api'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@commands': resolve(__dirname, 'src/commands'),
    },
  },
});
