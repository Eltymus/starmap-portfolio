import * as THREE from 'three';
import { COLORS, fontCaps, fontClassic } from '../../lib/theme';
import { type Ctx, createCanvas, get2d, goldStroke, sparkle, circle } from '../art/canvas';

export type OrnamentKind = 'saturn' | 'moon' | 'comet' | 'sun';

const HAIR_SPACE = String.fromCharCode(8202);

export const createHazeTexture = () => {
  const canvas = createCanvas(128, 128);
  const ctx = get2d(canvas);
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,225,170,0.5)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
};

export const createStripeTexture = () => {
  const canvas = createCanvas(8, 64);
  const ctx = get2d(canvas);
  const gradient = ctx.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, 'rgba(255,220,150,0)');
  gradient.addColorStop(0.5, 'rgba(255,226,160,1)');
  gradient.addColorStop(1, 'rgba(255,220,150,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 8, 64);
  return new THREE.CanvasTexture(canvas);
};

export const createRingTexture = () => {
  const canvas = createCanvas(128, 128);
  const ctx = get2d(canvas);
  ctx.strokeStyle = 'rgba(246,223,166,1)';
  ctx.lineWidth = 3;
  circle(ctx, 64, 64, 58);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  circle(ctx, 64, 64, 48);
  return new THREE.CanvasTexture(canvas);
};

export const createStarNameTexture = (text: string): THREE.CanvasTexture => {
  const canvas = createCanvas(512, 96);
  const ctx = get2d(canvas);
  ctx.fillStyle = COLORS.gold;
  ctx.font = fontClassic(52);
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 8, 50);
  return new THREE.CanvasTexture(canvas);
};

export const createConstellationLabelTexture = (name: string, subtitle: string): THREE.CanvasTexture => {
  const canvas = createCanvas(1024, 220);
  const ctx = get2d(canvas);
  goldStroke(ctx, 1.5);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = fontCaps(64);
  ctx.fillText(name.toUpperCase().split('').join(HAIR_SPACE), 512, 80);
  ctx.font = fontClassic(44);
  ctx.fillText(subtitle, 512, 160);
  const halfWidth = ctx.measureText(subtitle).width / 2;
  const ruleEnd = Math.min(460, halfWidth + 120);
  ctx.beginPath();
  ctx.moveTo(512 - ruleEnd, 160);
  ctx.lineTo(512 - halfWidth - 26, 160);
  ctx.moveTo(512 + halfWidth + 26, 160);
  ctx.lineTo(512 + ruleEnd, 160);
  ctx.stroke();
  return new THREE.CanvasTexture(canvas);
};

const ORNAMENT_DRAWINGS: Record<OrnamentKind, (ctx: Ctx) => void> = {
  saturn: (ctx) => {
    circle(ctx, 256, 256, 90);
    ctx.lineWidth = 1.5;
    for (let i = -60; i <= 60; i += 30) {
      ctx.beginPath();
      ctx.ellipse(256, 256 + i, Math.sqrt(90 * 90 - i * i), 10, 0, 0, Math.PI);
      ctx.stroke();
    }
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(256, 256, 200, 48, -0.35, 0.15, Math.PI * 2 - 0.15 + Math.PI * 0);
    ctx.stroke();
  },
  moon: (ctx) => {
    ctx.beginPath();
    ctx.arc(256, 256, 150, -1.2, 1.2 + Math.PI, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(330, 220, 130, -1.75, 1.95, true);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      const a = 1.9 + i * 0.13;
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(a) * 146, 256 + Math.sin(a) * 146);
      ctx.lineTo(256 + Math.cos(a) * 118, 256 + Math.sin(a) * 118);
      ctx.stroke();
    }
    sparkle(ctx, 400, 120, 22);
    sparkle(ctx, 430, 360, 12);
  },
  comet: (ctx) => {
    circle(ctx, 380, 150, 34);
    ctx.lineWidth = 1.5;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(380 - 30, 150 + i * 9);
      ctx.quadraticCurveTo(250, 220 + i * 18, 70, 400 + i * 22);
      ctx.stroke();
    }
  },
  sun: (ctx) => {
    circle(ctx, 256, 256, 70);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const length = i % 2 ? 130 : 170;
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(a - 0.08) * 90, 256 + Math.sin(a - 0.08) * 90);
      ctx.lineTo(256 + Math.cos(a) * length, 256 + Math.sin(a) * length);
      ctx.lineTo(256 + Math.cos(a + 0.08) * 90, 256 + Math.sin(a + 0.08) * 90);
      ctx.stroke();
    }
    ctx.lineWidth = 1.2;
    circle(ctx, 256, 256, 54);
  }
};

export const createOrnamentTexture = (kind: OrnamentKind): THREE.CanvasTexture => {
  const canvas = createCanvas(512, 512);
  const ctx = get2d(canvas);
  goldStroke(ctx, 3);
  ORNAMENT_DRAWINGS[kind](ctx);
  return new THREE.CanvasTexture(canvas);
};
