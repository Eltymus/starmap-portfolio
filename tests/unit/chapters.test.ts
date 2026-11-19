import { describe, expect, it } from 'vitest';
import { CHAPTERS, CHAPTER_COUNT, chapterSkyAngles } from '../../src/data/chapters.js';

describe('chapter data', () => {
  it('has unique ids', () => {
    const ids = CHAPTERS.map((chapter) => chapter.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CHAPTER_COUNT).toBe(CHAPTERS.length);
  });

  describe.each(CHAPTERS.map((chapter) => [chapter.id, chapter] as const))('%s', (_, chapter) => {
    const pointCount = chapter.figure.points.length;

    it('connects only existing stars, never a star to itself', () => {
      chapter.figure.edges.forEach(([a, b]) => {
        expect(a).not.toBe(b);
        expect(a).toBeGreaterThanOrEqual(0);
        expect(b).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThan(pointCount);
        expect(b).toBeLessThan(pointCount);
      });
    });

    it('has no duplicated edges', () => {
      const keys = chapter.figure.edges.map(([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`));
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('attaches star notes only to existing stars', () => {
      Object.keys(chapter.starNotes).forEach((key) => {
        expect(Number.isInteger(+key)).toBe(true);
        expect(+key).toBeLessThan(pointCount);
      });
    });

    it('keeps every star inside the engraving (±8 units)', () => {
      chapter.figure.points.forEach(([x, y]) => {
        expect(Math.abs(x)).toBeLessThanOrEqual(8);
        expect(Math.abs(y)).toBeLessThanOrEqual(8);
      });
    });

    it('uses only absolute or mailto links', () => {
      (chapter.sheet.links || []).forEach(([, href]) => expect(href).toMatch(/^(https:\/\/|mailto:)/));
    });
  });

  it('places chapters at distinct points of the sky', () => {
    const angles = CHAPTERS.map((_, i) => chapterSkyAngles(i));
    angles.forEach((angle, i) => {
      expect(Math.abs(angle.elevation)).toBeLessThan(Math.PI / 2);
      if (i) expect(angle.azimuth).not.toBe(angles[i - 1].azimuth);
    });
  });
});

describe('chapter art', () => {
  it('has an engraving and decorations for every chapter', async () => {
    const { ENGRAVINGS } = await import('../../src/scripts/art/engravings.js');
    const { DECORATIONS } = await import('../../src/scripts/art/decorations.js');
    CHAPTERS.forEach(({ id }) => {
      expect(ENGRAVINGS).toHaveProperty(id);
      expect(DECORATIONS).toHaveProperty(id);
    });
  });
});
