import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages with a custom domain (public/CNAME, DNS on Cloudflare): the site is served from the root.
export default defineConfig({
  site: 'https://lorenzotripodi.org',
  base: '/',
  trailingSlash: 'always',
  integrations: [sitemap()],
  // Every stylesheet is a file, never an inline <style>: the Content-Security-Policy (src/lib/csp.ts) relies on it.
  build: { inlineStylesheets: 'never' },
  vite: {
    // The project sits in OneDrive, where every file is a reparse point: Vite 8's native resolver takes them for
    // symlinks and fails to canonicalise them ("Cannot resolve entry module"). npm creates no symlinks, so keeping
    // paths as they are changes nothing elsewhere (CI, Linux). Same setting in vitest.config.ts.
    resolve: { preserveSymlinks: true },
    build: {
      // three's WebGLRenderer and its shaders alone are ~550 kB minified (~140 kB gzip) and cannot be split
      // further. That chunk is loaded with import() after the page text, off the critical path.
      chunkSizeWarningLimit: 600
    }
  }
});
