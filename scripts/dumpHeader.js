const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.fill('input[placeholder="Username"]', 'Admin');
    await page.fill('input[placeholder="Password"]', 'admin123');
    await Promise.all([
      page.waitForURL('**/dashboard/index'),
      page.click('button:has-text("Login")'),
    ]);
    const headerHTML = await page.locator('header').first().innerHTML();
    console.log(headerHTML);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
