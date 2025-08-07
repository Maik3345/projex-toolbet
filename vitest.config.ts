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
        // Configuration files
        '.prettierrc.js',
        'commitlint.config.js',
        'vitest.config.ts',
        // Entry points
        'src/index.ts',
        // Type definitions only
        'src/modules/apps/pull-request/labels/suggest/types.ts',
      ],
      thresholds: {
        global: {
          statements: 87,
          branches: 87,
          functions: 87,
          lines: 87
        }
      }
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
