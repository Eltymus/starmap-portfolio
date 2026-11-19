import { describe, expect, it } from 'vitest';
import { formatSkyCoordinates } from '../../src/lib/sky-coordinates.js';

const direction = (azimuthHours: number, declinationDegrees: number) => {
  const azimuth = (azimuthHours / 24) * Math.PI * 2;
  const elevation = (declinationDegrees * Math.PI) / 180;
  return {
    x: Math.sin(azimuth) * Math.cos(elevation),
    y: Math.sin(elevation),
    z: -Math.cos(azimuth) * Math.cos(elevation)
  };
};

describe('formatSkyCoordinates', () => {
  it('reads the origin straight ahead', () => {
    expect(formatSkyCoordinates({ x: 0, y: 0, z: -1 })).toBe('RA 00h 00m · DEC +00°');
  });

  it('formats hours, minutes and a positive declination', () => {
    expect(formatSkyCoordinates(direction(5.5, 12))).toBe('RA 05h 30m · DEC +12°');
  });

  it('wraps negative right ascension into 0–24h and uses a true minus sign', () => {
    expect(formatSkyCoordinates(direction(-1, -30))).toBe('RA 23h 00m · DEC −30°');
  });

  it('clamps vertical components outside [-1, 1]', () => {
    expect(formatSkyCoordinates({ x: 0, y: 1.0000001, z: 0 })).toMatch(/DEC \+90°$/);
  });
});
