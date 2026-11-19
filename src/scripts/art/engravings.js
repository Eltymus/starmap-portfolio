import { CHAPTERS } from '../../data/chapters.js';
import { assetUrl } from '../../lib/assets.js';
import { COLORS, fontCaps, fontMono } from '../../lib/theme.js';
import { ART_CENTER as CENTER, UNIT as U, X, Y, goldStroke, sparkle, circle, dotted, scatterSparkles } from './canvas.js';

const IMAGE_FILES = {
  mole: 'img/mole.png',
  computer: 'img/computer.png',
  grapes: 'img/grapes.png',
  book: 'img/book.png',
  icosahedron: 'img/icosahedron.png',
  stairs: 'img/stairs.png',
  bird: 'img/bird.png'
};

const images = {};

export const loadEngravingImages = () => {
  const waits = Object.entries(IMAGE_FILES).map(([key, file]) => {
    const image = new Image();
    image.src = assetUrl(file);
    images[key] = image;
    return new Promise((resolve) => {
      if (image.complete) resolve();
      else {
        image.onload = resolve;
        image.onerror = resolve;
      }
    });
  });
  return Promise.all(waits);
};

const drawImageWhenLoaded = (ctx, image, x, y, width, height) => {
  if (image && image.complete && image.naturalWidth) ctx.drawImage(image, x, y, width, height);
};

export const drawRingFrame = (ctx, radius, center = [0, 0]) => {
  ctx.save();
  ctx.translate(center[0] * U, -center[1] * U);
  goldStroke(ctx, 2.6);
  ctx.globalAlpha = 0.95;
  ctx.setLineDash([2, 12]);
  circle(ctx, CENTER, CENTER, radius * U);
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1.1;
  circle(ctx, CENTER, CENTER, (radius + 0.22) * U);
  ctx.globalAlpha = 0.75;
  for (let k = 0; k < 24; k++) {
    const a = k / 24 * Math.PI * 2;
    const length = k % 6 ? 0.1 : 0.22;
    ctx.beginPath();
    ctx.moveTo(CENTER + Math.cos(a) * (radius + 0.22) * U, CENTER + Math.sin(a) * (radius + 0.22) * U);
    ctx.lineTo(CENTER + Math.cos(a) * (radius + 0.22 + length) * U, CENTER + Math.sin(a) * (radius + 0.22 + length) * U);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.8;
  [0, 1, 2, 3].forEach((k) => {
    const a = k * Math.PI / 2;
    sparkle(ctx, CENTER + Math.cos(a) * (radius + 0.6) * U, CENTER + Math.sin(a) * (radius + 0.6) * U, 9);
  });
  ctx.restore();
};

const drawCompassRose = (ctx) => {
  ctx.save();
  ctx.lineWidth = 0.8;
  for (let k = 0; k < 32; k++) {
    const a = k / 32 * Math.PI * 2;
    ctx.globalAlpha = k % 4 ? 0.22 : 0.45;
    ctx.beginPath();
    ctx.moveTo(CENTER + Math.cos(a) * 1.3 * U, CENTER + Math.sin(a) * 1.3 * U);
    ctx.lineTo(CENTER + Math.cos(a) * 5.55 * U, CENTER + Math.sin(a) * 5.55 * U);
    ctx.stroke();
  }
  ctx.restore();

  const points = CHAPTERS[0].figure.points;
  ctx.save();
  for (let k = 0; k < 8; k++) {
    const tip = points[1 + k];
    const valley = points[9 + (k + 7) % 8];
    ctx.globalAlpha = k % 2 ? 0.16 : 0.26;
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.lineTo(X(tip[0]), Y(tip[1]));
    ctx.lineTo(X(valley[0]), Y(valley[1]));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.lineWidth = 1;
  circle(ctx, CENTER, CENTER, 1.3 * U);
  circle(ctx, CENTER, CENTER, 0.45 * U);
  ctx.restore();

  ctx.save();
  ctx.font = fontCaps(26);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  [['N', 0, 5.62], ['E', 5.62, 0], ['S', 0, -5.62], ['W', -5.62, 0]].forEach(([letter, u, v]) => {
    ctx.fillStyle = COLORS.navy;
    ctx.beginPath();
    ctx.arc(X(u), Y(v), 16, 0, 7);
    ctx.fill();
    ctx.fillStyle = COLORS.goldPale;
    ctx.fillText(letter, X(u), Y(v) + 1);
  });
  ctx.restore();
};

const drawLaurelLeaf = (ctx, cx, cy, length, width, angle) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.45, -width, length, 0);
  ctx.quadraticCurveTo(length * 0.45, width, 0, 0);
  ctx.closePath();
  ctx.globalAlpha *= 0.14;
  ctx.fill();
  ctx.globalAlpha /= 0.14;
  ctx.stroke();
  ctx.save();
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(length * 0.08, 0);
  ctx.lineTo(length * 0.9, 0);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
};

const drawLaurelBranch = (ctx, side) => {
  const rx = 6.25 * U;
  const ry = 6.25 * U;
  const cy = CENTER;
  const start = Math.PI / 2 + side * 0.1;
  const end = Math.PI / 2 + side * 1.25;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let k = 0; k <= 40; k++) {
    const a = start + (end - start) * k / 40;
    if (k) ctx.lineTo(CENTER + Math.cos(a) * rx, cy + Math.sin(a) * ry);
    else ctx.moveTo(CENTER + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  }
  ctx.stroke();
  ctx.lineWidth = 1.2;
  for (let k = 0; k < 11; k++) {
    const t = 0.06 + k * 0.088;
    const a = start + (end - start) * t;
    const px = CENTER + Math.cos(a) * rx;
    const py = cy + Math.sin(a) * ry;
    const tangent = a + side * Math.PI / 2;
    const size = 1 - t * 0.55;
    drawLaurelLeaf(ctx, px, py, 30 * size, 9 * size, tangent + Math.PI + side * 0.55);
    drawLaurelLeaf(ctx, px, py, 26 * size, 8 * size, tangent + Math.PI - side * 0.75);
    if (k % 3 === 1) {
      ctx.beginPath();
      ctx.arc(px + Math.cos(a) * 9, py + Math.sin(a) * 9, 3.2, 0, 7);
      ctx.fill();
    }
  }
  drawLaurelLeaf(ctx, CENTER + Math.cos(end) * rx, cy + Math.sin(end) * ry, 22, 7, end + side * Math.PI / 2 + Math.PI);
};

const drawRibbonBow = (ctx) => {
  ctx.lineWidth = 1.4;
  const by = Y(-6.3);
  ctx.beginPath();
  ctx.moveTo(CENTER, by);
  ctx.bezierCurveTo(CENTER - 34, by - 22, CENTER - 46, by + 14, CENTER, by);
  ctx.bezierCurveTo(CENTER + 46, by + 14, CENTER + 34, by - 22, CENTER, by);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CENTER - 4, by + 2);
  ctx.quadraticCurveTo(CENTER - 16, by + 26, CENTER - 28, by + 34);
  ctx.moveTo(CENTER + 4, by + 2);
  ctx.quadraticCurveTo(CENTER + 16, by + 26, CENTER + 28, by + 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(CENTER, by, 4, 0, 7);
  ctx.fill();
};

const laurentius = (ctx) => {
  goldStroke(ctx, 2);
  circle(ctx, CENTER, CENTER, 5.9 * U);
  ctx.lineWidth = 1;
  circle(ctx, CENTER, CENTER, 5.55 * U);
  for (let i = 0; i < 64; i++) {
    const a = i / 64 * Math.PI * 2;
    if (i % 8 === 0) sparkle(ctx, CENTER + Math.cos(a) * 5.73 * U, CENTER + Math.sin(a) * 5.73 * U, 9);
  }
  drawCompassRose(ctx);
  [-1, 1].forEach((side) => drawLaurelBranch(ctx, side));
  drawRibbonBow(ctx);
  scatterSparkles(ctx, 10, 3);
};

const turin = (ctx) => {
  const k = (9.6 / 1085) * U;
  drawImageWhenLoaded(ctx, images.mole, CENTER + (60 - 248) * k, CENTER - (5.0 + 17 * 9.6 / 1085) * U, 380 * k, 1110 * k);
  goldStroke(ctx, 1.4);
  scatterSparkles(ctx, 10, 7);
};

const stack = (ctx) => {
  const k = 0.016 * U;
  drawImageWhenLoaded(ctx, images.computer, CENTER - 300 * k, CENTER - 295 * k, 600 * k, 590 * k);
  goldStroke(ctx, 1.4);
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.font = fontMono(25);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ['C:\\LORENZO> dir /stack', ' VUE  NUXT  REACT  NODE', ' SQL  DOCKER  N8N  AI', 'C:\\LORENZO> _'].forEach((line, n) => ctx.fillText(line, X(-3.75), Y(3.2 - n * 0.62)));
  ctx.restore();
  scatterSparkles(ctx, 12, 11);
};

const siply = (ctx) => {
  const k = (9.6 / 372) * U;
  drawImageWhenLoaded(ctx, images.grapes, CENTER - 155 * k, CENTER - 186 * k, 311 * k, 372 * k);
  goldStroke(ctx, 1.4);
  scatterSparkles(ctx, 12, 13);
};

const bookRelay = (ctx) => {
  const k = 0.0131 * 1.18 * U;
  drawImageWhenLoaded(ctx, images.book, CENTER - 397 * k, CENTER - 152 * k, 794 * k, 305 * k);
  goldStroke(ctx, 1.4);
  dotted(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(X(-0.39), Y(1.05));
    ctx.bezierCurveTo(X(-1.4), Y(3.0), X(0.7), Y(4.2), X(1.89), Y(4.84));
    ctx.stroke();
  });
  [[-1.05, 2.6, 12], [-0.25, 3.9, 16], [1.89, 4.84, 22]].forEach(([a, b, size]) => sparkle(ctx, X(a), Y(b), size));
  scatterSparkles(ctx, 10, 17);
};

const tavern = (ctx) => {
  const k = (9 / 648) * U;
  drawImageWhenLoaded(ctx, images.icosahedron, CENTER - 321 * k, CENTER - 343 * k, 642 * k, 683 * k);
  goldStroke(ctx, 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(X(-3.6), Y(-4.85));
  ctx.lineTo(X(3.6), Y(-4.85));
  ctx.lineTo(X(3.2), Y(-5.5));
  ctx.lineTo(X(3.6), Y(-6.15));
  ctx.lineTo(X(-3.6), Y(-6.15));
  ctx.lineTo(X(-3.2), Y(-5.5));
  ctx.closePath();
  ctx.stroke();
  ctx.font = fontCaps(30);
  ctx.fillText('NATURAL TWENTY', CENTER, Y(-5.48));
  scatterSparkles(ctx, 14, 19);
};

const climb = (ctx) => {
  const k = (10 / 318) * U;
  drawImageWhenLoaded(ctx, images.stairs, CENTER - 201 * k, CENTER - 150 * k, 400 * k, 294 * k);
  goldStroke(ctx, 1.4);
  scatterSparkles(ctx, 12, 23);
};

const contact = (ctx) => {
  const k = (11 / 641) * U;
  drawImageWhenLoaded(ctx, images.bird, CENTER - 320 * k, CENTER - 157 * k, 641 * k, 314 * k);
  drawImageWhenLoaded(ctx, images.bird, CENTER - 320 * k, CENTER - 157 * k, 641 * k, 314 * k);
  goldStroke(ctx, 1.4);
  scatterSparkles(ctx, 12, 29);
};

export const ENGRAVINGS = {
  laurentius,
  turin,
  stack,
  siply,
  'book-relay': bookRelay,
  tavern,
  climb,
  contact
};
