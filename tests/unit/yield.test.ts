import { afterEach, describe, expect, it, vi } from 'vitest';
import { yieldToMain } from '../../src/lib/yield';

describe('yieldToMain', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('uses scheduler.yield() when the browser has it', async () => {
    const schedulerYield = vi.fn(() => Promise.resolve());
    vi.stubGlobal('scheduler', { yield: schedulerYield });
    await yieldToMain();
    expect(schedulerYield).toHaveBeenCalledOnce();
  });

  it('falls back to a zero-delay timeout, resolving only once the timer has run', async () => {
    vi.stubGlobal('scheduler', undefined);
    vi.useFakeTimers();
    let resolved = false;
    const pending = yieldToMain().then(() => (resolved = true));
    await Promise.resolve();
    expect(resolved).toBe(false);
    await vi.runAllTimersAsync();
    await pending;
    expect(resolved).toBe(true);
  });
});
