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
  const selector = '.oxd-input-group:has-text("Employee Name") input';
  const count = await page.locator(selector).count();
  console.log('count', count);
  for (let i = 0; i < count; i++) {
    const loc = page.locator(selector).nth(i);
    console.log(i, 'visible', await loc.isVisible(), 'placeholder', await loc.getAttribute('placeholder'), 'value', await loc.inputValue(), 'class', await loc.getAttribute('class'));
  }
  await browser.close();
})();
