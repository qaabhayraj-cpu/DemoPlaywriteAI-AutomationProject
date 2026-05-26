import { chromium } from '@playwright/test';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: 'https://opensource-demo.orangehrmlive.com' });
  const page = await context.newPage();
  await page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await Promise.all([
    page.waitForURL('**/dashboard/index', { timeout: 60000 }),
    page.getByRole('button', { name: 'Login' }).click(),
  ]);
  await page.waitForLoadState('networkidle');
  console.log('page url', page.url());
  const nav = await page.locator('nav').allInnerTexts();
  console.log('nav text', nav.slice(0, 20));
  const anchors = await page.locator('a').allInnerTexts();
  console.log('links', anchors.filter((t) => t.trim()).slice(0, 40));
  const loginImg = await page.getByRole('img', { name: /orange/i }).count();
  console.log('logo count', loginImg);
  await browser.close();
})();
