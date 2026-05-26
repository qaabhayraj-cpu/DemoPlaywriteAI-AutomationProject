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
  await page.goto('/web/index.php/pim/viewEmployeeList', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  console.log('employee list url', page.url());
  const inputs = await page.locator('input').allInnerTexts();
  console.log('input count', await page.locator('input').count());
  const placeholders = await page.locator('input').evaluateAll((els) => els.map((el) => el.getAttribute('placeholder')));
  console.log('placeholders', placeholders);
  const groups = await page.locator('.oxd-input-group').allInnerTexts();
  console.log('groups', groups);
  const tableHeaders = await page.locator('.oxd-table-header-cell').allInnerTexts();
  console.log('headers', tableHeaders);
  await browser.close();
})();
