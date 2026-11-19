import { expect, test } from '@playwright/test';
import { MISSING_PAGE } from './fixtures';

const SITE = 'https://eltymus.github.io/starmap-portfolio/';

test.describe('sharing and search', () => {
  test('the home page has a canonical URL, Open Graph and Twitter cards', async ({ page }) => {
    await page.goto('./');
    const head = page.locator('head');
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE);
    await expect(head.locator('meta[property="og:url"]')).toHaveAttribute('content', SITE);
    await expect(head.locator('meta[property="og:image"]')).toHaveAttribute('content', `${SITE}og-image.jpg`);
    await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  });

  test('the share image is a 1200x630 JPEG', async ({ page, request }) => {
    const response = await request.get('og-image.jpg');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toBe('image/jpeg');
    await page.goto('./');
    const size = await page.evaluate(async () => {
      const image = new Image();
      image.src = 'og-image.jpg';
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    });
    expect(size).toEqual([1200, 630]);
  });

  test('describes the author as a schema.org Person', async ({ page }) => {
    await page.goto('./');
    const person = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    expect(person).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Lorenzo Tripodi',
      jobTitle: 'Software Developer',
      address: { addressLocality: 'Turin', addressCountry: 'IT' }
    });
    expect(person.sameAs).toEqual(
      expect.arrayContaining([expect.stringContaining('github.com/'), expect.stringContaining('linkedin.com/')])
    );
  });

  test('publishes a sitemap and robots.txt', async ({ request }) => {
    const sitemap = await (await request.get('sitemap-0.xml')).text();
    expect(sitemap).toContain(`<loc>${SITE}</loc>`);
    expect(sitemap).not.toContain('404');
    const robots = await (await request.get('robots.txt')).text();
    expect(robots).toContain(`Sitemap: ${SITE}sitemap-index.xml`);
  });
});

test.describe('404 page', () => {
  test('answers a missing address with status 404 and the themed page', async ({ page }) => {
    const response = await page.goto(MISSING_PAGE);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Uncharted sky');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test('leads back to the star map', async ({ page }) => {
    await page.goto(MISSING_PAGE);
    await page.getByRole('link', { name: 'BACK TO THE STAR MAP' }).click();
    await expect(page).toHaveURL(/\/starmap-portfolio\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lorenzo Tripodi');
  });
});
