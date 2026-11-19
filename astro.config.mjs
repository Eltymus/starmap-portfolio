import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: https://<user>.github.io/<repo>/
export default defineConfig({
  site: 'https://eltymus.github.io',
  base: '/starmap-portfolio',
  vite: {
    plugins: [tailwindcss()],
    build: {
      // three's WebGLRenderer and its shaders alone are ~550 kB minified (~140 kB gzip) and cannot be split
      // further. That chunk is loaded with import() after the page text, off the critical path.
      chunkSizeWarningLimit: 600
    }
  }
});
