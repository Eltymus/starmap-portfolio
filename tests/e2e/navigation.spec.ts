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

    const sheet = page.locator('#chart-sheet');
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

  test('is a modal dialog named after the page being read', async ({ page }) => {
    await page.locator('.chapter').nth(0).locator('.open-chart').click();
    await expect(page.getByRole('dialog', { name: 'Lorenzo Tripodi' })).toBeVisible();
    expect(await page.locator('#chart-sheet').evaluate((dialog) => dialog.matches(':modal'))).toBe(true);
  });

  test('never lets Tab reach the page behind it', async ({ page }) => {
    await page.locator('.chapter').nth(0).locator('.open-chart').click();
    await expect(page.locator('.sheet-close')).toBeFocused();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const outside = await page.evaluate(() => {
        const active = document.activeElement;
        return !!active && active !== document.body && !active.closest('#chart-sheet');
      });
      expect(outside).toBe(false);
    }
  });

  test('keeps its buttons out of the Tab order while closed', async ({ page }) => {
    await page.locator('.chapter').nth(0).locator('.open-chart').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#chart-sheet')).toBeHidden();
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('#chart-sheet, #full-map'))).toBe(false);
    }
  });

  test('lists the star notes for keyboard and screen reader users', async ({ page }) => {
    await page.locator('.chapter').nth(0).locator('.open-chart').click();
    const notes = page.locator('#chart-sheet .star-notes');
    await notes.getByText('THE STARS').click();
    await expect(notes.getByRole('listitem')).toHaveText([
      'Lorenzo Tripodi',
      'Software Developer — full-stack',
      'AI & Automation — n8n and LLM agents',
      'Vue · Nuxt · React · Node.js',
      'Based in Turin, Italy · Remote / Hybrid'
    ]);
  });

  test('Space presses a focused button instead of scrolling', async ({ page }) => {
    await page.locator('.chapter').nth(0).locator('.open-chart').focus();
    await page.keyboard.press(' ');
    await expect(page.locator('#chart-sheet')).toBeVisible();
    await expect(page.locator('.chapter').nth(0)).toHaveClass(/is-active/);
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
