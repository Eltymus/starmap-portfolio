type Scheduler = { yield?: () => Promise<void> };

/**
 * Hands the main thread back to the browser (input, painting) before the next piece of work, so that one long
 * start-up task becomes several short ones. Uses `scheduler.yield()` where available, which resumes ahead of other
 * queued tasks, and a zero-delay timeout elsewhere.
 */
export const yieldToMain = (): Promise<void> => {
  const scheduler = (globalThis as { scheduler?: Scheduler }).scheduler;
  if (typeof scheduler?.yield === 'function') return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
};
