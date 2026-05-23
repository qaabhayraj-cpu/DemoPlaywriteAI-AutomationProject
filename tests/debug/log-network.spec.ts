import { test } from '@playwright/test';

test('log network during login', async ({ page }) => {
  page.on('request', (req) => {
    // eslint-disable-next-line no-console
    console.log('REQUEST', req.method(), req.url());
  });

  page.on('response', (res) => {
    // eslint-disable-next-line no-console
    console.log('RESPONSE', res.status(), res.url());
  });

  await page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.getByRole('button', { name: 'Login' }).click(),
  ]);

  // wait briefly to ensure all network activity finishes
  await page.waitForTimeout(2000);
});
