import { clamp } from './math';

const pad2 = (value: number) => String(value).padStart(2, '0');

/**
 * Formats a view direction as celestial coordinates, e.g. "RA 05h 30m · DEC +12°".
 * Right ascension is measured from -Z towards +X; declination is the elevation above the XZ plane.
 */
export const formatSkyCoordinates = ({ x, y, z }: { x: number; y: number; z: number }): string => {
  let rightAscension = (Math.atan2(x, -z) / (Math.PI * 2)) * 24;
  if (rightAscension < 0) rightAscension += 24;
  const declination = (Math.asin(clamp(y, -1, 1)) * 180) / Math.PI;
  const hours = pad2(Math.floor(rightAscension));
  const minutes = pad2(Math.floor((rightAscension % 1) * 60));
  const sign = declination >= 0 ? '+' : '−';
  return `RA ${hours}h ${minutes}m · DEC ${sign}${pad2(Math.abs(Math.round(declination)))}°`;
};
