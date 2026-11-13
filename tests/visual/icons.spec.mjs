import { test, expect } from '@playwright/test';

// Focus on hydration and interactions without cross-document transition races.
test.use({ reducedMotion: 'reduce' });

const number = (text) => Number(text.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, ''));

test('icon categories, Iranian search and SVG code hydrate without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/docs/icons/');
  await page.locator('astro-island[component-export="IconCatalog"]:not([ssr])').waitFor();
  const search = page.getByRole('textbox', { name: 'جستجوی آیکون' });
  const counts = await page.locator('.ic-cat__count').allTextContents();
  const total = counts.reduce((sum, text) => sum + number(text), 0);
  expect(total).toBe(number((await search.getAttribute('placeholder')).match(/[۰-۹٬,]+/)[0]));
  await search.fill('بانک ملی');
  await page.locator('.ib-cell[href="/docs/icons/brand-ir-banks-melli/"]').click();
  await page.locator('astro-island[component-export="IconDetail"]:not([ssr])').waitFor();
  await expect(page.locator('.ib-stage svg')).toHaveAttribute('data-kashi-icon', 'brand-ir-banks-melli');
  await page.goto('/docs/icons/crypto-wallet-trust/');
  await page.locator('astro-island[component-export="IconDetail"]:not([ssr])').waitFor();
  await page.getByRole('tab', { name: 'HTML', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'HTML', exact: true })).toContainText('mask=');
  expect(errors).toEqual([]);
});
