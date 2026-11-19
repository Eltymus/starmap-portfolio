export const random = Math.random;

export const gaussian = () => (random() + random() + random() + random() - 2) / 2;

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const seededRandom = (seed) => {
  let state = seed;
  return () => (state = (state * 9301 + 49297) % 233280) / 233280;
};
