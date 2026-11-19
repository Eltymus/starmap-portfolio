const reducedMotionQuery =
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

/** True when the visitor asked the system for less motion. Read live, so changing the setting applies at once. */
export const prefersReducedMotion = (): boolean => reducedMotionQuery?.matches ?? false;
