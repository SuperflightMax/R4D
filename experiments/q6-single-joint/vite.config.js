import {defineConfig} from 'vite';
export default defineConfig({base:'./',server:{port:4186,strictPort:true},build:{outDir:'output/builder/dist',emptyOutDir:true}});
