import { expect, test, type Page } from '@playwright/test';
import { MISSING_PAGE, openStarMap } from './fixtures';

/** Records every Content-Security-Policy violation the page reports, from the very first byte. */
const recordViolations = async (page: Page) => {
  const violations: string[] = [];
  page.on('console', (message) => {
    if (message.text().includes('Content Security Policy')) violations.push(message.text());
  });
  await page.exposeFunction('reportCspViolation', (violation: string) => violations.push(violation));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      (window as unknown as { reportCspViolation: (v: string) => void }).reportCspViolation(
        `${event.violatedDirective} blocked ${event.blockedURI || 'inline'}`
      );
    });
  });
  return violations;
};

test.describe('Content-Security-Policy', () => {
  test('is set on every page', async ({ page }) => {
    for (const path of ['./', MISSING_PAGE]) {
      await page.goto(path);
      await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
        'content',
        /script-src 'self'/
      );
    }
  });

  test('lets the whole star map work without a single violation', async ({ page }) => {
    const violations = await recordViolations(page);
    await openStarMap(page);

    // The 3D sky renders through WebGL.
    const webgl = await page.locator('#sky-canvas').evaluate((canvas: HTMLCanvasElement) => {
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      return !!context && !context.isContextLost();
    });
    expect(webgl).toBe(true);

    // The chart sheet shows an engraving rendered to a data: URL, and turns its pages.
    await page.locator('.chapter').nth(0).locator('.open-chart').click();
    await expect(page.locator('#chart-sheet .sheet-art')).toHaveCSS('background-image', /^url\("data:image\/png/);
    await page.locator('.sheet-next').click();
    await expect(page.locator('#chart-sheet .sheet-counter')).toHaveText(/^2 \//);
    await page.keyboard.press('Escape');

    await page.locator('#full-map-button').click();
    await expect(page.locator('#full-map')).toBeVisible();
    await page.keyboard.press('Escape');

    expect(violations).toEqual([]);
  });

  test('lets the 404 page render without a violation', async ({ page }) => {
    const violations = await recordViolations(page);
    await page.goto(MISSING_PAGE);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.nf-sky')).toBeVisible();
    expect(violations).toEqual([]);
  });
});
