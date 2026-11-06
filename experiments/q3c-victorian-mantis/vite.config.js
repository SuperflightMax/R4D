import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 4187, strictPort: true },
  preview: { port: 4187, strictPort: true },
});
