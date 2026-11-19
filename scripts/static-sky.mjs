// Draws public/img/static-sky.webp, the sky shown instead of the 3D one when WebGL is missing or lost:
// the same ingredients (stars of several temperatures, Milky Way haze, celestial grid, gold ecliptic),
// flat and seeded, so every run gives the same picture. Transparent: the page background shows through.
// Run with `npm run static-sky`.
import sharp from 'sharp';

const WIDTH = 1920;
const HEIGHT = 1080;
const OUTPUT = 'public/img/static-sky.webp';
const GOLD = '#e2be74';
const GOLD_LIGHT = '#f6dfa6';
// Same palette as STAR_TEMPERATURES in src/lib/theme.ts.
const TEMPERATURES = ['#cfe0ff', '#ffffff', '#fff1d0', '#f4d58c', '#ffb98a'];
const HAZE = ['#b9c6ff', '#ffe0a8'];

let seed = 1_337;
const random = () => (seed = (seed * 16_807) % 2_147_483_647) / 2_147_483_647;
const gaussian = () => (random() + random() + random() + random() - 2) / 2;
const pick = (list) => list[Math.floor(random() * list.length)];
const f = (n) => n.toFixed(1);

// The Milky Way: a tilted band across the frame.
const BAND_ANGLE = (-18 * Math.PI) / 180;
const bandPoint = (t, spread) => {
  const along = (t - 0.5) * WIDTH * 1.5;
  return [
    WIDTH / 2 + along * Math.cos(BAND_ANGLE) - spread * Math.sin(BAND_ANGLE),
    HEIGHT * 0.46 + along * Math.sin(BAND_ANGLE) + spread * Math.cos(BAND_ANGLE)
  ];
};

const parts = [];

parts.push('<g filter="url(#haze)">');
for (let k = 0; k < 40; k++) {
  const [x, y] = bandPoint(random(), gaussian() * 140);
  parts.push(
    `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(120 + random() * 160)}" ry="${f(50 + random() * 70)}" ` +
      `transform="rotate(-18 ${f(x)} ${f(y)})" fill="${random() < 0.3 ? HAZE[0] : HAZE[1]}" opacity="${(0.012 + random() * 0.022).toFixed(3)}" />`
  );
}
parts.push('</g>');

// Celestial grid: faint dashed meridians and parallels, as on an old chart.
const grid = [];
for (let k = 0; k < 7; k++) {
  const x = (k / 6) * WIDTH;
  grid.push(`M${f(x)} -40 Q${f(x + (x - WIDTH / 2) * 0.18)} ${HEIGHT / 2} ${f(x)} ${HEIGHT + 40}`);
}
for (let k = 0; k < 5; k++) {
  const y = (k / 4) * HEIGHT;
  grid.push(`M-40 ${f(y)} Q${WIDTH / 2} ${f(y + (y - HEIGHT / 2) * 0.22)} ${WIDTH + 40} ${f(y)}`);
}
parts.push(
  `<path d="${grid.join(' ')}" fill="none" stroke="${GOLD}" stroke-width="1" stroke-dasharray="7 7" opacity="0.09" />`
);

// The ecliptic: a gold arc with tick marks.
const ecliptic = (t) => [t * WIDTH, HEIGHT * 0.2 + Math.sin(t * Math.PI) * -60 + t * HEIGHT * 0.12];
const eclipticPath = Array.from({ length: 49 }, (_, k) => ecliptic(k / 48));
parts.push(
  `<path d="M${eclipticPath.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}" fill="none" stroke="${GOLD}" stroke-width="1.2" opacity="0.22" />`
);
const ticks = [];
for (let k = 0; k <= 72; k++) {
  const [x, y] = ecliptic(k / 72);
  const half = k % 6 ? 4 : 10;
  ticks.push(`M${f(x)} ${f(y - half)} L${f(x)} ${f(y + half)}`);
}
parts.push(`<path d="${ticks.join(' ')}" stroke="${GOLD}" stroke-width="1" opacity="0.22" />`);

// Dust of faint stars everywhere, denser along the Milky Way.
for (let k = 0; k < 1500; k++) {
  const inBand = k % 2 === 0;
  const [x, y] = inBand ? bandPoint(random(), gaussian() * 170) : [random() * WIDTH, random() * HEIGHT];
  parts.push(
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.5 + random() * 0.8)}" fill="${pick(TEMPERATURES)}" opacity="${f(0.2 + random() * 0.45)}" />`
  );
}

// Brighter stars with a soft halo.
for (let k = 0; k < 90; k++) {
  const x = random() * WIDTH;
  const y = random() * HEIGHT;
  const color = pick(TEMPERATURES);
  parts.push(
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(4 + random() * 4)}" fill="${color}" opacity="0.12" filter="url(#glow)" />`,
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.1 + random() * 0.9)}" fill="${color}" opacity="${f(0.7 + random() * 0.3)}" />`
  );
}

// A few four-pointed glints.
for (let k = 0; k < 11; k++) {
  const x = random() * WIDTH;
  const y = random() * HEIGHT;
  const size = 5 + random() * 7;
  const color = k % 3 ? GOLD_LIGHT : pick(TEMPERATURES);
  parts.push(
    `<path d="M${f(x - size)} ${f(y)} L${f(x + size)} ${f(y)} M${f(x)} ${f(y - size)} L${f(x)} ${f(y + size)}" ` +
      `stroke="${color}" stroke-width="0.9" stroke-linecap="round" opacity="0.75" />`,
    `<circle cx="${f(x)}" cy="${f(y)}" r="1.8" fill="${color}" />`
  );
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <filter id="haze" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45" /></filter>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5" /></filter>
  </defs>
  ${parts.join('\n  ')}
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(OUTPUT);
console.log(`Wrote ${OUTPUT}`);
