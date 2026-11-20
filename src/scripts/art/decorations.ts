import type { ChapterId } from '../../data/types';
import { fontCaps, fontClassic } from '../../lib/theme';
import { type Ctx, ART_CENTER as CENTER, UNIT as U, X, Y, circle, withAlpha, centeredText } from './canvas';
import { drawImageCentered } from './engravings';

type Vec2 = readonly [number, number];
type Link = readonly [number, number];

const caption = (ctx: Ctx, text: string, cx: number, cy: number, size: number, style?: string): void =>
  centeredText(ctx, fontClassic(size, style), text, X(cx), Y(cy));

const drawFineQuill = (ctx: Ctx, cx: number, cy: number, s: number, rotation: number): void => {
  ctx.save();
  ctx.translate(X(cx), Y(cy));
  ctx.rotate(rotation);
  const length = 3.6 * s * U;
  const shaft = (t: number): Vec2 => [Math.sin(t * Math.PI) * 0.12 * s * U * t, -t * length];
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let k = 0; k <= 30; k++) {
    const [a, b] = shaft(k / 30);
    if (k) ctx.lineTo(a, b);
    else ctx.moveTo(a, b);
  }
  ctx.stroke();
  const vane = (side: number, maxWidth: number): Vec2[] => {
    const points: Vec2[] = [];
    for (let k = 0; k <= 30; k++) {
      const t = 0.22 + (0.78 * k) / 30;
      const [a, b] = shaft(t);
      const w = Math.sin(Math.min(1, (t - 0.22) / 0.7) * Math.PI * 0.92) * maxWidth * (1 - Math.max(0, t - 0.85) * 3);
      points.push([a + side * w, b - w * 0.35]);
    }
    return points;
  };
  [
    [-1, 0.5 * s * U],
    [1, 0.32 * s * U]
  ].forEach(([side, maxWidth]) => {
    const edge = vane(side, maxWidth);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    edge.forEach((p, k) => {
      if (k) ctx.lineTo(p[0], p[1]);
      else ctx.moveTo(p[0], p[1]);
    });
    const [ea, eb] = shaft(1);
    ctx.lineTo(ea, eb);
    ctx.stroke();
    ctx.lineWidth = 0.55;
    for (let k = 2; k < 30; k += 1) {
      if (side < 0 && (k === 11 || k === 12 || k === 19)) continue;
      const t = 0.22 + (0.78 * k) / 30;
      const [a, b] = shaft(t);
      const p = edge[k];
      ctx.beginPath();
      ctx.moveTo(a, b);
      ctx.quadraticCurveTo((a + p[0]) / 2, b - Math.abs(p[0] - a) * 0.12, p[0], p[1]);
      ctx.stroke();
    }
  });
  ctx.save();
  ctx.globalAlpha *= 0.12;
  const left = vane(-1, 0.5 * s * U);
  const right = vane(1, 0.32 * s * U);
  ctx.beginPath();
  left.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  right.reverse().forEach((p) => ctx.lineTo(p[0], p[1]));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(0, 0.42 * s * U);
  ctx.lineTo(3, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0.12 * s * U);
  ctx.lineTo(0, 0.36 * s * U);
  ctx.stroke();
  ctx.lineWidth = 0.8;
  ctx.setLineDash([2, 5]);
  ctx.beginPath();
  ctx.moveTo(0, 0.5 * s * U);
  ctx.quadraticCurveTo(0.6 * s * U, 0.9 * s * U, 1.4 * s * U, 0.7 * s * U);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
};

const drawDivider = (ctx: Ctx, cx: number, cy: number, s: number): void => {
  ctx.beginPath();
  ctx.moveTo(X(cx), Y(cy + 1.4 * s));
  ctx.lineTo(X(cx - 0.7 * s), Y(cy - 1.1 * s));
  ctx.moveTo(X(cx), Y(cy + 1.4 * s));
  ctx.lineTo(X(cx + 0.7 * s), Y(cy - 1.1 * s));
  ctx.stroke();
  circle(ctx, X(cx), Y(cy + 1.4 * s), 0.14 * s * U);
  ctx.beginPath();
  ctx.arc(X(cx), Y(cy - 0.2 * s), 1.0 * s * U, 0.75, Math.PI - 0.75);
  ctx.stroke();
};

const drawEnvelope = (ctx: Ctx, cx: number, cy: number, w: number, h: number, rotation: number): void => {
  ctx.save();
  ctx.translate(X(cx), Y(cy));
  ctx.rotate(rotation || 0);
  ctx.strokeRect((-w * U) / 2, (-h * U) / 2, w * U, h * U);
  ctx.beginPath();
  ctx.moveTo((-w * U) / 2, (-h * U) / 2);
  ctx.lineTo(0, h * U * 0.1);
  ctx.lineTo((w * U) / 2, (-h * U) / 2);
  ctx.stroke();
  ctx.restore();
};

const drawWorkflow = (ctx: Ctx, points: readonly Vec2[], links: readonly Link[]): void => {
  links.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(X(points[a][0]), Y(points[a][1]));
    ctx.bezierCurveTo(
      X((points[a][0] + points[b][0]) / 2),
      Y(points[a][1]),
      X((points[a][0] + points[b][0]) / 2),
      Y(points[b][1]),
      X(points[b][0]),
      Y(points[b][1])
    );
    ctx.stroke();
  });
  points.forEach((p) => {
    ctx.strokeRect(X(p[0]) - 13, Y(p[1]) - 10, 26, 20);
  });
};

const drawBookplate = (ctx: Ctx): void => {
  drawImageCentered(ctx, 'bookplate', -5.6, 5.7, 3.8);
  ctx.save();
  ctx.translate(X(-5.6), Y(5.7));
  // The cartouche's opening sits below the middle of the image, under its top flourish.
  centeredText(ctx, fontCaps(22), 'EX LIBRIS', 0, 0.07 * U);
  centeredText(ctx, fontClassic(30, 'italic 600'), 'L. T.', 0, 0.59 * U);
  ctx.restore();
};

const drawGlobe = (ctx: Ctx): void => {
  circle(ctx, X(6.2), Y(5.6), 1.2 * U);
  ctx.beginPath();
  ctx.ellipse(X(6.2), Y(5.6), 0.5 * U, 1.2 * U, 0, 0, 7);
  ctx.stroke();
  [-0.6, 0, 0.6].forEach((o) => {
    ctx.beginPath();
    ctx.ellipse(X(6.2), Y(5.6 + o), Math.sqrt(1.44 - o * o) * U, 0.12 * U, 0, 0, 7);
    ctx.stroke();
  });
};

const drawWaxSeal = (ctx: Ctx): void => {
  circle(ctx, X(5.9), Y(-6.4), 0.42 * U);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    circle(ctx, X(5.9) + Math.cos(a) * 0.5 * U, Y(-6.4) + Math.sin(a) * 0.5 * U, 4);
  }
  centeredText(ctx, fontCaps(24), 'LT', X(5.9), Y(-6.4));
};

const engraved =
  (alpha: number, draw: (ctx: Ctx) => void) =>
  (ctx: Ctx): void =>
    withAlpha(ctx, alpha, () => draw(ctx));

export const DECORATIONS: Record<ChapterId, (ctx: Ctx) => void> = {
  laurentius: engraved(0.75, (ctx) => {
    ctx.lineWidth = 1.4;
    drawFineQuill(ctx, -6.4, -6.2, 1.15, 0.42);
    drawDivider(ctx, 6.4, -4.6, 0.9);
    caption(ctx, 'MMXXVI', 6.4, -6.6, 26, '600');
    ctx.font = fontCaps(26);
    ctx.fillText('EX ASTRIS · AD OPUS', CENTER, Y(7.3));
  }),
  turin: engraved(0.7, (ctx) => {
    ctx.lineWidth = 1.3;
    drawImageCentered(ctx, 'alpsLeft', -4.7, 4.7, 5.4);
    drawImageCentered(ctx, 'alpsRight', 4.9, 4.6, 3.4);
    drawImageCentered(ctx, 'superga', 5.6, -3.0, 3.0);
    drawImageCentered(ctx, 'po', 0, -7.3, 10);
    caption(ctx, 'Augusta Taurinorum', 0, 6.6, 30);
    caption(ctx, 'Superga', 5.6, -1.65, 22);
    caption(ctx, 'Padus', -5.8, -7.3, 22);
  }),
  stack: engraved(0.72, (ctx) => {
    ctx.lineWidth = 1.3;
    drawWorkflow(
      ctx,
      [
        [3.2, -5.4],
        [5.0, -4.4],
        [5.0, -6.4],
        [6.8, -5.4]
      ],
      [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3]
      ]
    );
    caption(ctx, 'workflow', 5.0, -7.2, 22);
    caption(ctx, '{ }', -6.4, -5.6, 64, 'italic 600');
    caption(ctx, '=>', 6.6, 5.6, 54, 'italic 600');
  }),
  siply: engraved(0.72, (ctx) => {
    ctx.lineWidth = 1.3;
    drawImageCentered(ctx, 'barrel', -6.3, -3.4, 1.9);
    drawImageCentered(ctx, 'corkscrew', 6.4, 4.7, 1.6, 0.5);
    caption(ctx, 'In vino veritas', 0, 6.9, 30);
  }),
  'book-relay': engraved(0.72, (ctx) => {
    ctx.lineWidth = 1.3;
    drawImageCentered(ctx, 'books', -6.2, -5.2, 2.7);
    drawImageCentered(ctx, 'quill', 6.3, -5.6, 2.4);
    drawBookplate(ctx);
    caption(ctx, 'Ex libris, ad amicos', 0, 7.0, 30);
  }),
  tavern: engraved(0.72, (ctx) => {
    ctx.lineWidth = 1.3;
    drawImageCentered(ctx, 'tankard', 6.3, 5.5, 1.5);
    drawImageCentered(ctx, 'flask', -6.3, -5.2, 1.2);
    drawImageCentered(ctx, 'dragon', 6.0, -5.1, 2.7);
    caption(ctx, 'Hic sunt dracones', -5.4, 6.6, 28);
  }),
  climb: engraved(0.72, (ctx) => {
    ctx.lineWidth = 1.3;
    drawImageCentered(ctx, 'telescope', -6.0, -4.6, 1.9);
    drawImageCentered(ctx, 'laurel', 6.2, -5.2, 2.4);
    caption(ctx, 'Per aspera ad astra', 0, 7.2, 32);
  }),
  contact: engraved(0.72, (ctx) => {
    ctx.lineWidth = 1.3;
    drawGlobe(ctx);
    drawEnvelope(ctx, -6.4, 5.8, 2.0, 1.3, -0.15);
    drawEnvelope(ctx, -5.4, 4.6, 1.5, 1.0, 0.2);
    drawWaxSeal(ctx);
    caption(ctx, 'Mittite verba', 0, 7.1, 30);
  })
};
