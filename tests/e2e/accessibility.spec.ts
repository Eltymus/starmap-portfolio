import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { goToChapter, openStarMap } from './fixtures';

const scan = (page: Page, include?: string) => {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']);
  return (include ? builder.include(include) : builder).analyze();
};

const describeViolations = (violations: Awaited<ReturnType<typeof scan>>['violations']) =>
  violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);

test.describe('axe-core scan', () => {
  test.beforeEach(async ({ page }) => {
    await openStarMap(page);
  });

  test('the page has no violations', async ({ page }) => {
    const { violations } = await scan(page);
    expect(describeViolations(violations)).toEqual([]);
  });

  test('the chart sheet has no violations', async ({ page }) => {
    await goToChapter(page, 6);
    await page.locator('.chapter').nth(6).locator('.open-chart').click();
    await page.locator('#chart-sheet .star-notes summary').click();
    await page.waitForTimeout(1200);
    const { violations } = await scan(page, '#chart-sheet');
    expect(describeViolations(violations)).toEqual([]);
  });

  test('the full map has no violations', async ({ page }) => {
    await page.locator('#full-map-button').click();
    await page.waitForTimeout(1500);
    const { violations } = await scan(page, '#full-map');
    expect(describeViolations(violations)).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('travels between chapters without smooth scrolling', async ({ page }) => {
    await openStarMap(page);
    await page.keyboard.press('ArrowDown');
    // The very next frame must already be at the target: no smooth scroll in between.
    const top = await page.locator('#scroller').evaluate((scroller) => scroller.scrollTop / scroller.clientHeight);
    expect(top).toBe(1);
  });

  test('stops decorative CSS animations', async ({ page }) => {
    await openStarMap(page);
    const iterations = await page
      .locator('h1')
      .evaluate(
        (heading) => getComputedStyle(heading).animationName + ' ' + getComputedStyle(heading).animationDuration
      );
    expect(iterations.startsWith('none') || iterations.endsWith('1e-05s')).toBe(true);
  });
});
