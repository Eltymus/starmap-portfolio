import { expect, test } from '@playwright/test';
import { goToChapter, hideSky, openStarMap } from './fixtures';

const CHAPTERS = [0, 1, 2, 3, 4, 5, 6, 7];

test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await openStarMap(page);
    await hideSky(page);
  });

  for (const index of CHAPTERS) {
    test(`chapter ${index}`, async ({ page }) => {
      await goToChapter(page, index);
      await page.waitForTimeout(1500);
      await expect(page).toHaveScreenshot(`chapter-${index}.png`);
    });
  }

  test('chart sheet', async ({ page }) => {
    await page.locator('.chapter').nth(0).locator('.open-chart').click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('chart-sheet.png');
  });

  test('chart sheet, second page', async ({ page }) => {
    await page.locator('.chapter').nth(0).locator('.open-chart').click();
    await page.locator('.sheet-next').click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('chart-sheet-2.png');
  });

  test('full map', async ({ page }) => {
    await page.locator('#full-map-button').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('full-map.png');
  });
});
