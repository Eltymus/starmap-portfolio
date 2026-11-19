import { CHAPTERS } from '../../data/chapters.js';
import { ART_SIZE, X, Y, createCanvas, goldStroke, sparkle } from './canvas.js';
import { ENGRAVINGS, drawRingFrame } from './engravings.js';
import { DECORATIONS } from './decorations.js';

const artCanvases = [];
const sheetArtCache = {};

export const hasAllChapterArt = () => artCanvases.filter(Boolean).length === CHAPTERS.length;

export const drawChapterArt = (index) => {
  const chapter = CHAPTERS[index];
  const canvas = createCanvas(ART_SIZE, ART_SIZE);
  const ctx = canvas.getContext('2d');
  if (chapter.frame) drawRingFrame(ctx, chapter.frame.radius, chapter.frame.center);
  ENGRAVINGS[chapter.id](ctx);
  goldStroke(ctx, 1.3);
  DECORATIONS[chapter.id](ctx);
  artCanvases[index] = canvas;
  return canvas;
};

export const chapterArtImageUrl = (index) => {
  if (sheetArtCache[index]) return sheetArtCache[index];
  const canvas = createCanvas(ART_SIZE, ART_SIZE);
  const ctx = canvas.getContext('2d');
  if (artCanvases[index]) ctx.drawImage(artCanvases[index], 0, 0);
  goldStroke(ctx, 2.4);
  const { points, edges } = CHAPTERS[index].figure;
  edges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(X(points[a][0]), Y(points[a][1]));
    ctx.lineTo(X(points[b][0]), Y(points[b][1]));
    ctx.stroke();
  });
  points.forEach((p) => sparkle(ctx, X(p[0]), Y(p[1]), 16));
  if (!artCanvases[index]) return '';
  return (sheetArtCache[index] = canvas.toDataURL('image/png'));
};
