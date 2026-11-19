import { describe, expect, it } from 'vitest';
import { clamp, easeInOutCubic, gaussian, seededRandom } from '../../src/lib/math';

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('easeInOutCubic', () => {
  it('starts at 0, ends at 1 and is symmetric around the midpoint', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1);
  });

  it('is monotonic', () => {
    let previous = -Infinity;
    for (let t = 0; t <= 1; t += 0.01) {
      const value = easeInOutCubic(t);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe('seededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    for (let i = 0; i < 20; i++) expect(a()).toBe(b());
  });

  it('returns values in [0, 1)', () => {
    const next = seededRandom(42);
    for (let i = 0; i < 1000; i++) {
      const value = next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('gaussian', () => {
  it('stays within [-2, 2]', () => {
    for (let i = 0; i < 1000; i++) {
      const value = gaussian();
      expect(Math.abs(value)).toBeLessThanOrEqual(2);
    }
  });
});
