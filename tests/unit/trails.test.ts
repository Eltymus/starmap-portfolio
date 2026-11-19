import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../../src/data/chapters.js';
import { buildPenTrails } from '../../src/scripts/scene/trails.js';

type Figure = { points: number[][]; edges: number[][] };

const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

const oddVertexCount = ({ points, edges }: Figure) => {
  const degree = new Array(points.length).fill(0);
  edges.forEach(([a, b]) => {
    degree[a]++;
    degree[b]++;
  });
  return degree.filter((d) => d % 2).length;
};

const square: Figure = {
  points: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1]
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0]
  ]
};

const star: Figure = {
  points: [
    [0, 0],
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
  ],
  edges: [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4]
  ]
};

const figures: [string, Figure][] = [
  ['a closed square', square],
  ['a four-armed star', star],
  ...CHAPTERS.map((chapter): [string, Figure] => [chapter.id, chapter.figure])
];

describe('buildPenTrails', () => {
  it.each(figures)('draws every edge of %s exactly once', (_, figure) => {
    const drawn = buildPenTrails(figure)
      .flat()
      .map((step) => edgeKey(step.a, step.b));
    expect(drawn.sort()).toEqual(figure.edges.map(([a, b]) => edgeKey(a, b)).sort());
  });

  it.each(figures)('keeps each trail of %s continuous', (_, figure) => {
    buildPenTrails(figure).forEach((trail) => {
      for (let i = 1; i < trail.length; i++) expect(trail[i].a).toBe(trail[i - 1].b);
    });
  });

  it.each(figures)('uses the fewest pen strokes for %s', (_, figure) => {
    expect(buildPenTrails(figure)).toHaveLength(Math.max(1, oddVertexCount(figure) / 2));
  });

  it('draws a closed loop in one stroke that ends where it began', () => {
    const [trail] = buildPenTrails(square);
    expect(trail[trail.length - 1].b).toBe(trail[0].a);
  });
});
