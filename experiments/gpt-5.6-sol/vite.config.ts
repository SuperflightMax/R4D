import { cp } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'copy-character-assets',
      apply: 'build',
      async closeBundle() {
        await cp(
          path.resolve('assets'),
          path.resolve('dist/assets'),
          { recursive: true },
        );
      },
    },
  ],
});
