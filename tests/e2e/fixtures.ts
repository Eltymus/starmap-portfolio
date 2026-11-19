import { expect, type Page } from '@playwright/test';

/** Opens the page and waits until the intro has gone, the engravings are drawn and the fonts are ready. */
export const openStarMap = async (page: Page) => {
  await page.goto('./');
  await expect(page.locator('#intro')).toHaveClass(/is-done/, { timeout: 15_000 });
  await expect(page.locator('html')).toHaveAttribute('data-art-ready', '', { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready);
};

/** Scrolls the page to a chapter and waits for it to become the active one. */
export const goToChapter = async (page: Page, index: number) => {
  await page.locator('#scroller').evaluate((scroller, i) => {
    scroller.scrollTo({ top: i * scroller.clientHeight, behavior: 'instant' });
  }, index);
  await expect(page.locator('.chapter').nth(index)).toHaveClass(/is-active/);
};

/**
 * The WebGL sky is animated and random: screenshots hide it, stop its render loop
 * (software WebGL in CI is slow) and compare only the DOM on top.
 */
export const hideSky = async (page: Page) => {
  await page.addStyleTag({ content: '#sky-canvas,#coords{visibility:hidden!important}' });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
};
