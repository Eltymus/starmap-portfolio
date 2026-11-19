import { CHAPTERS, chapterSkyAngles } from '../../data/chapters.js';
import { seededRandom } from '../../lib/math.js';
import { COLORS } from '../../lib/theme.js';
import { chapterArtImageUrl, hasAllChapterArt } from '../art/chapter-art.js';
import { state } from '../state.js';
import { createDialog } from './dialog.js';

const NAVIGATE_AFTER_CLOSE = 350;
const ART_SCALE = 2.0;
const DEFAULT_LAYOUT = { haloRadius: 15.5, titleY: 18.5, subtitleY: 21.6 };
const GOLD = COLORS.gold;

const gradients = () => '<defs>'
  + `<radialGradient id="full-map-sky" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="${COLORS.mapCenter}"/><stop offset="1" stop-color="${COLORS.mapEdge}"/></radialGradient>`
  + `<radialGradient id="full-map-milky-way" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${COLORS.goldLight}" stop-opacity=".16"/><stop offset="1" stop-color="${COLORS.goldLight}" stop-opacity="0"/></radialGradient>`
  + '</defs>';

const backdrop = () => '<circle r="96" fill="url(#full-map-sky)"/><ellipse rx="110" ry="20" fill="url(#full-map-milky-way)" transform="rotate(-28)"/>';

const twinklingStars = () => {
  const next = seededRandom(7);
  let svg = '';
  for (let k = 0; k < 420; k++) {
    const a = next() * Math.PI * 2;
    const r = Math.sqrt(next()) * 93;
    const big = next() < 0.06;
    svg += `<circle class="twinkle" cx="${(Math.cos(a) * r).toFixed(2)}" cy="${(Math.sin(a) * r).toFixed(2)}" r="${(big ? 0.55 : 0.12 + next() * 0.25).toFixed(2)}" fill="${next() < 0.3 ? COLORS.goldLight : COLORS.skyBlue}" style="animation-delay:-${(next() * 3).toFixed(2)}s;animation-duration:${(2 + next() * 3).toFixed(2)}s"/>`;
  }
  return svg;
};

const coordinateGrid = () => {
  const rings = [30, 60].map((r) => `<circle r="${r}"/>`).join('');
  const spokes = [0, 1, 2, 3, 4, 5].map((k) => `<line x1="${Math.cos(k * Math.PI / 6) * -92}" y1="${Math.sin(k * Math.PI / 6) * -92}" x2="${Math.cos(k * Math.PI / 6) * 92}" y2="${Math.sin(k * Math.PI / 6) * 92}"/>`).join('');
  return `<g fill="none" stroke="${GOLD}" stroke-width=".2" opacity=".35" stroke-dasharray=".6 1.6">${rings}${spokes}</g>`
    + `<circle cx="9" cy="-6" r="56" fill="none" stroke="${GOLD}" stroke-width=".3" opacity=".35"/>`;
};

const hourDial = () => {
  let svg = `<g class="dial"><circle r="92" fill="none" stroke="${GOLD}" stroke-width=".35"/><circle r="97" fill="none" stroke="${GOLD}" stroke-width=".25" opacity=".7"/>`;
  for (let k = 0; k < 72; k++) {
    const a = k / 72 * Math.PI * 2;
    const length = k % 3 ? 1.4 : 3;
    svg += `<line x1="${Math.cos(a) * 92}" y1="${Math.sin(a) * 92}" x2="${Math.cos(a) * (92 + length)}" y2="${Math.sin(a) * (92 + length)}" stroke="${GOLD}" stroke-width=".25"/>`;
  }
  for (let k = 0; k < 24; k++) {
    const a = k / 24 * Math.PI * 2 - Math.PI / 2;
    const x = (Math.cos(a) * 102).toFixed(2);
    const y = (Math.sin(a) * 102 + 1).toFixed(2);
    svg += `<text x="${x}" y="${y}" font-family="Cinzel" font-size="2.8" fill="${GOLD}" text-anchor="middle" transform="rotate(${k * 15} ${x} ${y})">${k}h</text>`;
  }
  return svg + '</g>';
};

const compassTitle = () => `<g opacity=".9"><path d="M0 -10 L1.6 -1.6 L10 0 L1.6 1.6 L0 10 L-1.6 1.6 L-10 0 L-1.6 -1.6 Z" fill="none" stroke="${GOLD}" stroke-width=".3"/><circle r="3" fill="none" stroke="${GOLD}" stroke-width=".25"/>`
  + `<text y="17" font-family="Cinzel" font-weight="600" font-size="4.2" letter-spacing=".9" fill="${GOLD}" text-anchor="middle">LORENZO TRIPODI</text>`
  + `<text y="22.5" font-family="Cormorant Garamond" font-style="italic" font-size="3.6" fill="${COLORS.muted}" text-anchor="middle">Mappa caelestis · MMXXVI</text></g>`;

const constellationGroup = (chapter, i) => {
  const { azimuth, elevation } = chapterSkyAngles(i);
  const theta = azimuth - Math.PI / 2;
  const rho = 64 - elevation * 34;
  const cx = Math.cos(theta) * rho;
  const cy = Math.sin(theta) * rho;
  const layout = { ...DEFAULT_LAYOUT, ...chapter.fullMap };
  const { points, edges } = chapter.figure;
  const image = chapterArtImageUrl(i);
  let svg = `<g class="constellation" data-chapter="${i}" tabindex="0" role="button" aria-label="${chapter.name}" transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)})"><circle class="halo" r="${layout.haloRadius}"/>`;
  if (image) svg += `<image href="${image}" x="${-8 * ART_SCALE}" y="${-8 * ART_SCALE}" width="${16 * ART_SCALE}" height="${16 * ART_SCALE}"/>`;
  edges.forEach(([a, b], e) => {
    svg += `<line pathLength="1" style="transition-delay:${(0.4 + i * 0.12 + e * 0.05).toFixed(2)}s" x1="${points[a][0] * ART_SCALE}" y1="${-points[a][1] * ART_SCALE}" x2="${points[b][0] * ART_SCALE}" y2="${-points[b][1] * ART_SCALE}"/>`;
  });
  points.forEach((p) => {
    svg += `<circle class="star" style="transition-delay:${(0.5 + i * 0.12).toFixed(2)}s" cx="${p[0] * ART_SCALE}" cy="${-p[1] * ART_SCALE}" r=".55"/>`;
  });
  return svg + `<text y="${layout.titleY}">${chapter.name.toUpperCase()}</text><text class="subtitle" y="${layout.subtitleY}">${chapter.subtitle}</text><text class="here-label" y="-16.8">you are here</text></g>`;
};

export const createFullMap = ({ goTo }) => {
  const root = document.getElementById('full-map');
  const svg = document.getElementById('full-map-svg');
  const closeButton = root.querySelector('.full-map-close');
  const dialog = createDialog(root, closeButton);
  let built = false;
  let builtWithArt = false;

  const close = () => dialog.close();

  const build = () => {
    built = true;
    builtWithArt = hasAllChapterArt();
    svg.innerHTML = gradients() + backdrop() + twinklingStars() + coordinateGrid() + hourDial() + compassTitle() + CHAPTERS.map(constellationGroup).join('');
    svg.querySelectorAll('.constellation').forEach((group) => {
      const index = +group.dataset.chapter;
      const travel = () => {
        close();
        setTimeout(() => goTo(index), NAVIGATE_AFTER_CLOSE);
      };
      group.addEventListener('click', travel);
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          travel();
        }
      });
    });
  };

  const open = () => {
    if (!built || !builtWithArt) build();
    svg.querySelectorAll('.constellation').forEach((group) => group.classList.toggle('here', +group.dataset.chapter === state.activeChapter));
    dialog.open();
  };

  document.getElementById('full-map-button').onclick = open;
  closeButton.onclick = close;
  root.addEventListener('click', (event) => {
    if (event.target === root || event.target.classList.contains('full-map-dialog')) close();
  });

  return {
    open,
    close,
    trapTab: dialog.trapTab,
    get isOpen() {
      return dialog.isOpen;
    }
  };
};
