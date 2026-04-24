import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  server: {
    open: '/about-me.html'
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});