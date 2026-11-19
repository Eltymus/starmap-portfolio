import { expect, test } from '@playwright/test';
import { goToChapter, openStarMap } from './fixtures';

test.beforeEach(async ({ page }) => {
  await openStarMap(page);
});

test('has a title and a main heading', async ({ page }) => {
  await expect(page).toHaveTitle(/Lorenzo Tripodi/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lorenzo Tripodi');
});

test('the moon navigation travels to a chapter', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the moon navigation is hidden on small screens');
  await page.getByRole('navigation', { name: 'Constellations' }).getByRole('button', { name: 'Racemus' }).click();
  await expect(page.locator('.chapter').nth(3)).toHaveClass(/is-active/);
  await expect(page.locator('#chapter-label')).toHaveText('Racemus');
});

test('arrow keys step through the chapters', async ({ page }) => {
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.chapter').nth(1)).toHaveClass(/is-active/);
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('.chapter').nth(0)).toHaveClass(/is-active/);
});

test.describe('chart sheet', () => {
  test('opens on the chapter, turns pages and closes with Escape', async ({ page }) => {
    await goToChapter(page, 2);
    const opener = page.locator('.chapter').nth(2).locator('.open-chart');
    await opener.click();

    const sheet = page.getByRole('dialog', { name: 'Chart' });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('heading', { level: 2 })).toHaveText('The stack');
    await expect(page.locator('.sheet-close')).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(sheet.getByRole('heading', { level: 2 })).toHaveText('Siply');
    await expect(sheet.locator('.sheet-footer span')).toHaveText('4 / 8');

    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(page.locator('.chapter').nth(3)).toHaveClass(/is-active/);
  });

  test('keeps keyboard focus inside while open', async ({ page }) => {
    await page.locator('.chapter').nth(0).locator('.open-chart').click();
    await expect(page.locator('.sheet-close')).toBeFocused();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('#chart-sheet'))).toBe(true);
    }
  });

  test('returns focus to the button that opened it', async ({ page }) => {
    const opener = page.locator('.chapter').nth(0).locator('.open-chart');
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.sheet-close')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
  });
});

test.describe('full map', () => {
  test('travels to the chosen constellation', async ({ page }) => {
    await page.locator('#full-map-button').click();
    const map = page.getByRole('dialog', { name: 'The complete chart' });
    await expect(map).toBeVisible();
    await map.getByRole('button', { name: 'Liber Apertus' }).click();
    await expect(map).toBeHidden();
    await expect(page.locator('.chapter').nth(4)).toHaveClass(/is-active/);
  });

  test('closes with Escape', async ({ page }) => {
    await page.locator('#full-map-button').click();
    const map = page.getByRole('dialog', { name: 'The complete chart' });
    await expect(map).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(map).toBeHidden();
  });
});
