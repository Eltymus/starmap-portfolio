import { GOLD_GRADIENT_STOPS } from '../../lib/theme.js';
import { seededRandom } from '../../lib/math.js';

export const ART_SIZE = 1024;
export const ART_CENTER = 512;
export const UNIT = 64;

export const X = (v) => ART_CENTER + v * UNIT;
export const Y = (v) => ART_CENTER - v * UNIT;

export const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const goldStroke = (ctx, width) => {
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
  GOLD_GRADIENT_STOPS.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  ctx.strokeStyle = gradient;
  ctx.fillStyle = gradient;
  ctx.lineWidth = width || 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
};

export const sparkle = (ctx, cx, cy, r) => {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.fill();
};

export const circle = (ctx, cx, cy, r) => {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 7);
  ctx.stroke();
};

export const dotted = (ctx, draw) => {
  ctx.save();
  ctx.setLineDash([2, 12]);
  draw();
  ctx.restore();
};

export const withAlpha = (ctx, alpha, draw) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  draw();
  ctx.restore();
};

export const centeredText = (ctx, font, text, x, y) => {
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
};

export const scatterSparkles = (ctx, count, seed) => {
  const next = seededRandom(seed);
  for (let i = 0; i < count; i++) {
    const px = 60 + next() * 904;
    const py = 60 + next() * 904;
    const r = 4 + next() * 10;
    ctx.globalAlpha = 0.5 + next() * 0.5;
    sparkle(ctx, px, py, r);
  }
  ctx.globalAlpha = 1;
};
