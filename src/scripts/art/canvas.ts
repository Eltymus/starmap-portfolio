import { GOLD_GRADIENT_STOPS } from '../../lib/theme';
import { seededRandom } from '../../lib/math';

/** Shorthand for the 2D context every drawing helper receives. */
export type Ctx = CanvasRenderingContext2D;

export const ART_SIZE = 1024;
export const ART_CENTER = 512;
export const UNIT = 64;

export const X = (v: number): number => ART_CENTER + v * UNIT;
export const Y = (v: number): number => ART_CENTER - v * UNIT;

export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/** The 2D context of a canvas; throws instead of returning null so callers stay simple. */
export const get2d = (canvas: HTMLCanvasElement): Ctx => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available');
  return ctx;
};

/** A new canvas of the given size together with its 2D context. */
export const createContext = (width: number, height: number): Ctx => get2d(createCanvas(width, height));

export const goldStroke = (ctx: Ctx, width?: number): void => {
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
  GOLD_GRADIENT_STOPS.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  ctx.strokeStyle = gradient;
  ctx.fillStyle = gradient;
  ctx.lineWidth = width || 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
};

export const sparkle = (ctx: Ctx, cx: number, cy: number, r: number): void => {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.fill();
};

export const circle = (ctx: Ctx, cx: number, cy: number, r: number): void => {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 7);
  ctx.stroke();
};

export const dotted = (ctx: Ctx, draw: () => void): void => {
  ctx.save();
  ctx.setLineDash([2, 12]);
  draw();
  ctx.restore();
};

export const withAlpha = (ctx: Ctx, alpha: number, draw: () => void): void => {
  ctx.save();
  ctx.globalAlpha = alpha;
  draw();
  ctx.restore();
};

export const centeredText = (ctx: Ctx, font: string, text: string, x: number, y: number): void => {
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
};

export const scatterSparkles = (ctx: Ctx, count: number, seed: number): void => {
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
