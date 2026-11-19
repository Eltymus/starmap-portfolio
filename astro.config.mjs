import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages: https://<user>.github.io/<repo>/
export default defineConfig({
  site: 'https://eltymus.github.io',
  base: '/starmap-portfolio',
  trailingSlash: 'always',
  integrations: [sitemap()],
  // Every stylesheet is a file, never an inline <style>: the Content-Security-Policy (src/lib/csp.ts) relies on it.
  build: { inlineStylesheets: 'never' },
  vite: {
    build: {
      // three's WebGLRenderer and its shaders alone are ~550 kB minified (~140 kB gzip) and cannot be split
      // further. That chunk is loaded with import() after the page text, off the critical path.
      chunkSizeWarningLimit: 600
    }
  }
});
