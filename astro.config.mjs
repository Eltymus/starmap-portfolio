import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: https://<user>.github.io/<repo>/
export default defineConfig({
  site: 'https://eltymus.github.io',
  base: '/starmap-portfolio',
  vite: { plugins: [tailwindcss()] },
});
