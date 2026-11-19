// Renders public/og-image.jpg (1200x630), the picture shown when the site is shared:
// the real 3D sky of the first chapter with the name and role set beside it.
// Needs a fresh build: `npm run build && npm run og-image`.
import { chromium } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const DIST = 'dist';
const ORIGIN = 'http://og.local';
const BASE = '/starmap-portfolio/';
const OUTPUT = 'public/og-image.jpg';
const SIZE = { width: 1200, height: 630 };
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

const OVERLAY_CSS = `
  body * { visibility: hidden !important; }
  #sky-canvas, .og-card, .og-card * { visibility: visible !important; }
  .og-card {
    position: fixed; left: 84px; top: 50%; transform: translateY(-50%);
    display: flex; flex-direction: column; gap: 18px; z-index: 10;
  }
  .og-kicker { font: 600 15px Cinzel, serif; letter-spacing: 0.42em; color: #e2be74; }
  .og-name {
    margin: 0; font: 600 92px/0.92 'Cormorant Garamond', serif; letter-spacing: -0.01em;
    background: linear-gradient(100deg, #f8e7ba 0%, #d9a84e 45%, #f6dc9c 70%, #b98a35 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent; animation: none;
  }
  .og-role { font: italic 500 26px 'Cormorant Garamond', serif; color: #f3ebd8; }
  .og-rule { width: 220px; height: 1px; background: linear-gradient(90deg, #e2be74, transparent); }
  .og-place { font: 500 15px Cinzel, serif; letter-spacing: 0.32em; color: #c3c6da; }
`;

const OVERLAY_HTML = `
  <div class="og-card">
    <span class="og-kicker">A STAR MAP OF</span>
    <h1 class="og-name">Lorenzo<br />Tripodi</h1>
    <span class="og-role">Software developer · full-stack, AI &amp; automation</span>
    <span class="og-rule"></span>
    <span class="og-place">TURIN · ITALY</span>
  </div>
`;

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('No build found: run `npm run build` first.');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await page.route(`${ORIGIN}/**`, (route) => {
  let path = new URL(route.request().url()).pathname.replace(BASE, '/');
  if (path.endsWith('/')) path += 'index.html';
  const file = join(DIST, path);
  if (!existsSync(file)) return route.fulfill({ status: 404 });
  return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? 'application/octet-stream' });
});
// A seeded Math.random: the same sky on every run.
await page.addInitScript(() => {
  let seed = 20_261_119;
  Math.random = () => (seed = (seed * 16_807) % 2_147_483_647) / 2_147_483_647;
});
await page.goto(`${ORIGIN}${BASE}`);
await page.waitForSelector('html[data-art-ready]', { timeout: 30_000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2000);
await page.addStyleTag({ content: OVERLAY_CSS });
await page.evaluate((html) => document.body.insertAdjacentHTML('beforeend', html), OVERLAY_HTML);
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot();
await browser.close();

await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(OUTPUT);
console.log(`Wrote ${OUTPUT}`);
