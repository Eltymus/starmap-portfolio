import { CHAPTERS } from '../../data/chapters';
import { ART_SIZE, X, Y, createCanvas, get2d, goldStroke, sparkle } from './canvas';
import { ENGRAVINGS, drawRingFrame } from './engravings';
import { DECORATIONS } from './decorations';

const artCanvases: (HTMLCanvasElement | undefined)[] = [];
const sheetArtCache: Record<number, string> = {};

export const hasAllChapterArt = (): boolean => artCanvases.filter(Boolean).length === CHAPTERS.length;

export const drawChapterArt = (index: number): HTMLCanvasElement => {
  const chapter = CHAPTERS[index];
  const canvas = createCanvas(ART_SIZE, ART_SIZE);
  const ctx = get2d(canvas);
  if (chapter.frame) drawRingFrame(ctx, chapter.frame.radius, chapter.frame.center);
  ENGRAVINGS[chapter.id](ctx);
  goldStroke(ctx, 1.3);
  DECORATIONS[chapter.id](ctx);
  artCanvases[index] = canvas;
  return canvas;
};

export const chapterArtImageUrl = (index: number): string => {
  if (sheetArtCache[index]) return sheetArtCache[index];
  const canvas = createCanvas(ART_SIZE, ART_SIZE);
  const ctx = get2d(canvas);
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
