import { expect, test, type Page } from '@playwright/test';
import { openStarMap } from './fixtures';

const collectPageErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

/** True once the static sky picture is shown and has finished loading. */
const staticSkyIsShown = (page: Page) =>
  page
    .locator('img.static-sky')
    .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0 && getComputedStyle(image).display);

test.describe('without WebGL', () => {
  test.beforeEach(async ({ page }) => {
    // As in a browser with WebGL turned off or unsupported: every WebGL context request fails.
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (/webgl/i.test(type)) return null;
        return (getContext as (...args: unknown[]) => RenderingContext | null).call(this, type, ...rest);
      } as typeof getContext;
    });
  });

  test('shows a static sky, closes the intro and keeps the page working', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openStarMap(page);

    await expect(page.locator('html')).toHaveAttribute('data-static-sky', '');
    await expect.poll(() => staticSkyIsShown(page)).toBe('block');
    await expect(page.locator('#sky-canvas')).toBeHidden();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lorenzo Tripodi');

    // The engravings are still drawn for the chart sheet.
    await page.locator('.chapter').nth(0).locator('.open-chart').click();
    await expect(page.locator('#chart-sheet .sheet-art')).toHaveCSS('background-image', /^url\("data:image\/png/);
    expect(errors).toEqual([]);
  });
});

test.describe('WebGL context loss', () => {
  /** Counts the lit pixels of the frame the sky is about to show (read before the browser clears it). */
  const litPixels = (page: Page) =>
    page.locator('#sky-canvas').evaluate(
      (canvas: HTMLCanvasElement) =>
        new Promise<number>((resolve) =>
          requestAnimationFrame(() => {
            const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
            const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
            gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            let lit = 0;
            for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) lit++;
            resolve(lit);
          })
        )
    );

  // A lost context hands out no extensions: keep the one used to lose it, to restore it later.
  const loseContext = (page: Page, restore: boolean) =>
    page.locator('#sky-canvas').evaluate((canvas: HTMLCanvasElement, restore) => {
      const store = window as unknown as { loseContextExtension?: WEBGL_lose_context | null };
      store.loseContextExtension ??= (canvas.getContext('webgl2') as WebGL2RenderingContext).getExtension(
        'WEBGL_lose_context'
      );
      const extension = store.loseContextExtension;
      if (!extension) throw new Error('WEBGL_lose_context is not available');
      if (restore) extension.restoreContext();
      else extension.loseContext();
    }, restore);

  test('shows the static sky while the context is lost and draws again once it is back', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openStarMap(page);
    expect(await litPixels(page)).toBeGreaterThan(0);

    await loseContext(page, false);
    await expect(page.locator('html')).toHaveAttribute('data-static-sky', '');
    await expect.poll(() => staticSkyIsShown(page)).toBe('block');

    await loseContext(page, true);
    await expect(page.locator('html')).not.toHaveAttribute('data-static-sky');
    await expect(page.locator('#sky-canvas')).toBeVisible();
    await expect.poll(() => litPixels(page)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
});
