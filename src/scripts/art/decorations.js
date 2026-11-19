import { fontCaps, fontClassic } from '../../lib/theme.js';
import { ART_CENTER as CENTER, UNIT as U, X, Y, sparkle, circle, dotted, withAlpha, centeredText } from './canvas.js';

const caption = (ctx, text, cx, cy, size, style) => centeredText(ctx, fontClassic(size, style), text, X(cx), Y(cy));

const drawFineQuill = (ctx, cx, cy, s, rotation) => {
  ctx.save();
  ctx.translate(X(cx), Y(cy));
  ctx.rotate(rotation);
  const length = 3.6 * s * U;
  const shaft = (t) => [Math.sin(t * Math.PI) * 0.12 * s * U * t, -t * length];
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let k = 0; k <= 30; k++) {
    const [a, b] = shaft(k / 30);
    if (k) ctx.lineTo(a, b);
    else ctx.moveTo(a, b);
  }
  ctx.stroke();
  const vane = (side, maxWidth) => {
    const points = [];
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

const drawQuill = (ctx, cx, cy, s, rotation) => {
  ctx.save();
  ctx.translate(X(cx), Y(cy));
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-0.35 * s * U, -1.2 * s * U, 0.05 * s * U, -2.6 * s * U);
  ctx.quadraticCurveTo(0.45 * s * U, -1.2 * s * U, 0, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0.2 * s * U);
  ctx.lineTo(0.02 * s * U, -2.4 * s * U);
  ctx.stroke();
  for (let k = 1; k < 9; k++) {
    const yy = -k * 0.26 * s * U;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo(-0.22 * s * U * Math.sin((k / 9) * Math.PI), yy - 0.12 * s * U);
    ctx.moveTo(0, yy);
    ctx.lineTo(0.22 * s * U * Math.sin((k / 9) * Math.PI), yy - 0.12 * s * U);
    ctx.stroke();
  }
  ctx.restore();
};

const drawDivider = (ctx, cx, cy, s) => {
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

const drawBook = (ctx, cx, cy, w, h, rotation) => {
  ctx.save();
  ctx.translate(X(cx), Y(cy));
  ctx.rotate(rotation || 0);
  ctx.strokeRect((-w * U) / 2, (-h * U) / 2, w * U, h * U);
  ctx.beginPath();
  ctx.moveTo((-w * U) / 2 + 6, (-h * U) / 2);
  ctx.lineTo((-w * U) / 2 + 6, (h * U) / 2);
  ctx.stroke();
  ctx.restore();
};

const drawEnvelope = (ctx, cx, cy, w, h, rotation) => {
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

const drawWorkflow = (ctx, points, links) => {
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

const ALPINE_RANGES = [
  [
    [-7.6, 3.5],
    [-6.3, 5.0],
    [-5.5, 4.2],
    [-4.2, 5.5],
    [-3.0, 4.3],
    [-2.2, 4.7],
    [-1.3, 3.6]
  ],
  [
    [1.3, 3.6],
    [2.4, 4.6],
    [3.3, 4.1],
    [4.6, 5.6],
    [5.6, 4.4],
    [6.5, 5.0],
    [7.6, 3.5]
  ]
];

const drawMountainRange = (ctx, range) => {
  ctx.beginPath();
  range.forEach((p, k) => (k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
  ctx.stroke();
  range.forEach((p, k) => {
    const isPeak = k && k < range.length - 1 && p[1] > range[k - 1][1] && p[1] > range[k + 1][1];
    if (!isPeak) return;
    ctx.beginPath();
    ctx.moveTo(X(p[0] - 0.35), Y(p[1] - 0.4));
    ctx.lineTo(X(p[0] - 0.15), Y(p[1] - 0.25));
    ctx.lineTo(X(p[0]), Y(p[1] - 0.42));
    ctx.lineTo(X(p[0] + 0.18), Y(p[1] - 0.26));
    ctx.lineTo(X(p[0] + 0.32), Y(p[1] - 0.4));
    ctx.stroke();
    ctx.save();
    ctx.lineWidth = 0.7;
    for (let h = 0.5; h < 1.2; h += 0.18) {
      ctx.beginPath();
      ctx.moveTo(X(p[0] - h * 0.5), Y(p[1] - h));
      ctx.lineTo(X(p[0] - h * 0.2), Y(p[1] - h - 0.15));
      ctx.stroke();
    }
    ctx.restore();
  });
};

const drawSuperga = (ctx) => {
  ctx.beginPath();
  ctx.moveTo(X(4.1), Y(-4.35));
  ctx.quadraticCurveTo(X(5.6), Y(-2.9), X(7.4), Y(-3.6));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(X(5.6), Y(-2.95), 0.32 * U, Math.PI, 0);
  ctx.stroke();
  ctx.strokeRect(X(5.28), Y(-2.95), 0.64 * U, 0.3 * U);
  ctx.beginPath();
  ctx.moveTo(X(5.6), Y(-2.63));
  ctx.lineTo(X(5.6), Y(-2.25));
  ctx.stroke();
};

const drawRiver = (ctx) => {
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    const yy = -5.1 - k * 0.3;
    ctx.moveTo(X(-7.5), Y(yy));
    for (let i = 0; i <= 30; i++) ctx.lineTo(X(-7.5 + i * 0.5), Y(yy + Math.sin(i * 0.9 + k) * 0.08));
    ctx.stroke();
  }
};

const drawBarrel = (ctx) => {
  ctx.beginPath();
  ctx.ellipse(X(-6.3), Y(-4.7), 1.1 * U, 0.35 * U, 0, 0, 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(X(-7.4), Y(-4.7));
  ctx.quadraticCurveTo(X(-7.65), Y(-3.4), X(-7.4), Y(-2.1));
  ctx.moveTo(X(-5.2), Y(-4.7));
  ctx.quadraticCurveTo(X(-4.95), Y(-3.4), X(-5.2), Y(-2.1));
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(X(-6.3), Y(-2.1), 1.1 * U, 0.35 * U, 0, 0, 7);
  ctx.stroke();
  [-4.1, -2.7].forEach((yy) => {
    ctx.beginPath();
    ctx.ellipse(X(-6.3), Y(yy), 1.18 * U, 0.33 * U, 0, 0, Math.PI);
    ctx.stroke();
  });
};

const drawCorkscrew = (ctx) => {
  ctx.save();
  ctx.translate(X(6.4), Y(4.6));
  ctx.rotate(0.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 1.6 * U);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const yy = 0.4 * U + i * 0.05 * U;
    ctx.lineTo(Math.sin(i * 1.1) * 0.18 * U, yy);
  }
  ctx.stroke();
  ctx.strokeRect(-0.7 * U, -0.18 * U, 1.4 * U, 0.18 * U);
  ctx.restore();
};

const drawBookplate = (ctx) => {
  ctx.save();
  ctx.translate(X(-5.9), Y(5.7));
  ctx.strokeRect(-1.25 * U, -0.95 * U, 2.5 * U, 1.9 * U);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-1.1 * U, -0.8 * U, 2.2 * U, 1.6 * U);
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
  ].forEach(([a, b]) => circle(ctx, a * 1.1 * U, b * 0.8 * U, 0.16 * U));
  centeredText(ctx, fontCaps(22), 'EX LIBRIS', 0, -0.32 * U);
  centeredText(ctx, fontClassic(30, 'italic 600'), 'L. T.', 0, 0.22 * U);
  ctx.beginPath();
  ctx.moveTo(-0.6 * U, 0.55 * U);
  ctx.lineTo(0.6 * U, 0.55 * U);
  ctx.stroke();
  ctx.restore();
};

const drawDie = (ctx) => {
  ctx.save();
  ctx.translate(X(6.3), Y(5.6));
  ctx.rotate(-0.25);
  ctx.strokeRect(-0.7 * U, -0.7 * U, 1.4 * U, 1.4 * U);
  ctx.beginPath();
  ctx.moveTo(-0.7 * U, -0.7 * U);
  ctx.lineTo(-0.35 * U, -1.05 * U);
  ctx.lineTo(1.05 * U, -1.05 * U);
  ctx.lineTo(0.7 * U, -0.7 * U);
  ctx.moveTo(1.05 * U, -1.05 * U);
  ctx.lineTo(1.05 * U, 0.35 * U);
  ctx.lineTo(0.7 * U, 0.7 * U);
  ctx.stroke();
  [
    [-0.35, -0.35],
    [0, 0],
    [0.35, 0.35]
  ].forEach(([a, b]) => {
    ctx.beginPath();
    ctx.arc(a * U, b * U, 5, 0, 7);
    ctx.fill();
  });
  ctx.restore();
};

const potionSurface = (ctx) => {
  ctx.moveTo(-0.8 * U, 0.35 * U);
  ctx.bezierCurveTo(-0.4 * U, 0.15 * U, 0.3 * U, 0.5 * U, 0.8 * U, 0.3 * U);
};

const drawPotionFlask = (ctx) => {
  ctx.save();
  ctx.translate(X(-6.3), Y(-5.4));
  ctx.beginPath();
  ctx.arc(0, 0.25 * U, 0.85 * U, -Math.PI / 2 + 0.42, Math.PI * 1.5 - 0.42);
  ctx.lineTo(-0.3 * U, -1.15 * U);
  ctx.lineTo(0.3 * U, -1.15 * U);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeRect(-0.36 * U, -1.38 * U, 0.72 * U, 0.23 * U);
  ctx.beginPath();
  potionSurface(ctx);
  ctx.stroke();
  ctx.save();
  ctx.globalAlpha *= 0.25;
  ctx.beginPath();
  potionSurface(ctx);
  ctx.arc(0, 0.25 * U, 0.85 * U, 0.1, Math.PI - 0.1);
  ctx.fill();
  ctx.restore();
  [
    [-0.2, -0.1, 5],
    [0.15, -0.45, 4],
    [-0.05, -0.8, 3],
    [0.25, 0.05, 3]
  ].forEach(([a, b, r]) => circle(ctx, a * U, b * U, r));
  sparkle(ctx, 0.7 * U, -1.3 * U, 10);
  ctx.restore();
};

const drawHeraldicShield = (ctx) => {
  ctx.save();
  ctx.translate(X(6.2), Y(-5.4));
  ctx.beginPath();
  ctx.moveTo(-0.85 * U, -0.95 * U);
  ctx.lineTo(0.85 * U, -0.95 * U);
  ctx.lineTo(0.85 * U, 0.1 * U);
  ctx.quadraticCurveTo(0.8 * U, 0.85 * U, 0, 1.2 * U);
  ctx.quadraticCurveTo(-0.8 * U, 0.85 * U, -0.85 * U, 0.1 * U);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-0.7 * U, -0.82 * U);
  ctx.lineTo(0.7 * U, -0.82 * U);
  ctx.lineTo(0.7 * U, 0.08 * U);
  ctx.quadraticCurveTo(0.66 * U, 0.72 * U, 0, 1.03 * U);
  ctx.quadraticCurveTo(-0.66 * U, 0.72 * U, -0.7 * U, 0.08 * U);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-0.7 * U, 0.45 * U);
  ctx.lineTo(0, -0.15 * U);
  ctx.lineTo(0.7 * U, 0.45 * U);
  ctx.stroke();
  [
    [-0.4, -0.5],
    [0.4, -0.5],
    [0, 0.6]
  ].forEach(([a, b]) => sparkle(ctx, a * U, b * U, 9));
  ctx.restore();
};

const drawTelescope = (ctx) => {
  ctx.save();
  ctx.translate(X(-6.0), Y(-5.0));
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-0.75 * U, 1.6 * U);
  ctx.moveTo(0, 0);
  ctx.lineTo(0.75 * U, 1.6 * U);
  ctx.moveTo(0, 0);
  ctx.lineTo(0.1 * U, 1.7 * U);
  ctx.stroke();
  circle(ctx, 0, 0, 0.1 * U);
  ctx.rotate(-0.62);
  ctx.strokeRect(-1.0 * U, -0.17 * U, 1.3 * U, 0.34 * U);
  ctx.strokeRect(0.3 * U, -0.23 * U, 0.85 * U, 0.46 * U);
  ctx.strokeRect(1.15 * U, -0.3 * U, 0.35 * U, 0.6 * U);
  ctx.strokeRect(-1.25 * U, -0.11 * U, 0.25 * U, 0.22 * U);
  [-0.4, 0.75].forEach((a) => {
    ctx.beginPath();
    ctx.moveTo(a * U, -0.2 * U);
    ctx.lineTo(a * U, 0.2 * U);
    ctx.stroke();
  });
  ctx.restore();
  dotted(ctx, () => {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(-4.7), Y(-3.75));
    ctx.quadraticCurveTo(X(-4.2), Y(-2.6), X(-4.6), Y(-1.6));
    ctx.stroke();
  });
  sparkle(ctx, X(-4.7), Y(-1.3), 12);
};

const drawLaurelWreath = (ctx) => {
  ctx.save();
  ctx.translate(X(6.2), Y(-5.3));
  const radius = 0.95 * U;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI / 2 - side * 0.2, Math.PI / 2 - side * 2.3, side > 0);
    ctx.stroke();
    for (let k = 0; k < 8; k++) {
      const a = Math.PI / 2 - side * (0.3 + k * 0.26);
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;
      const tangent = Math.atan2(-Math.cos(a) * side, Math.sin(a) * side);
      [-1, 1].forEach((io) => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(tangent + io * 0.55);
        ctx.beginPath();
        ctx.ellipse(9, 0, 9, 3.6, 0, 0, 7);
        ctx.stroke();
        ctx.restore();
      });
    }
  });
  ctx.beginPath();
  ctx.moveTo(-0.3 * U, 1.05 * U);
  ctx.quadraticCurveTo(0, 0.85 * U, 0.3 * U, 1.05 * U);
  ctx.stroke();
  sparkle(ctx, 0, -0.05 * U, 14);
  ctx.restore();
};

const drawGlobe = (ctx) => {
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

const drawWaxSeal = (ctx) => {
  circle(ctx, X(5.9), Y(-6.4), 0.42 * U);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    circle(ctx, X(5.9) + Math.cos(a) * 0.5 * U, Y(-6.4) + Math.sin(a) * 0.5 * U, 4);
  }
  centeredText(ctx, fontCaps(24), 'LT', X(5.9), Y(-6.4));
};

const engraved = (alpha, draw) => (ctx) => withAlpha(ctx, alpha, () => draw(ctx));

export const DECORATIONS = {
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
    ALPINE_RANGES.forEach((range) => drawMountainRange(ctx, range));
    drawSuperga(ctx);
    drawRiver(ctx);
    caption(ctx, 'Augusta Taurinorum', 0, 6.6, 30);
    caption(ctx, 'Superga', 5.6, -1.75, 22);
    caption(ctx, 'Padus', -6.2, -6.0, 22);
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
    drawBarrel(ctx);
    drawCorkscrew(ctx);
    caption(ctx, 'In vino veritas', 0, 6.9, 30);
  }),
  'book-relay': engraved(0.72, (ctx) => {
    ctx.lineWidth = 1.3;
    drawBook(ctx, -6.4, -5.6, 2.4, 0.42, 0.04);
    drawBook(ctx, -6.2, -5.15, 2.1, 0.42, -0.05);
    drawBook(ctx, -6.5, -4.72, 2.2, 0.4, 0.03);
    drawQuill(ctx, 6.8, -6.4, 1.1, 0.35);
    drawBookplate(ctx);
    caption(ctx, 'Ex libris, ad amicos', 0, 7.0, 30);
  }),
  tavern: engraved(0.72, (ctx) => {
    ctx.lineWidth = 1.3;
    drawDie(ctx);
    drawPotionFlask(ctx);
    drawHeraldicShield(ctx);
    caption(ctx, 'Hic sunt dracones', -5.4, 6.6, 28);
  }),
  climb: engraved(0.72, (ctx) => {
    ctx.lineWidth = 1.3;
    drawTelescope(ctx);
    drawLaurelWreath(ctx);
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
