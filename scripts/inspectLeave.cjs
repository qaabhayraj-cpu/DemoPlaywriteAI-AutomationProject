const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', { waitUntil: 'networkidle' });
    await page.fill('input[placeholder="Username"]', 'Admin');
    await page.fill('input[placeholder="Password"]', 'admin123');
    await Promise.all([
      page.waitForURL('**/dashboard/index'),
      page.click('button:has-text("Login")'),
    ]);
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const labels = ['Apply', 'My Leave', 'Entitlements', 'Leave Type', 'From Date', 'To Date', 'Comments'];
    for (const label of labels) {
      const el = page.locator(`text=${label}`).first();
      console.log('LABEL', label, 'count:', await el.count());
      if (await el.count() > 0) {
        console.log('tag:', await el.evaluate((node) => node.tagName));
        console.log('role:', await el.evaluate((node) => node.getAttribute('role')));
        console.log('outerHTML:', await el.evaluate((node) => node.outerHTML));
      }
    }
    const selects = await page.locator('div.oxd-select-text-input').all();
    console.log('div.oxd-select-text-input count:', await selects.length);
    for (let i = 0; i < selects.length; i++) {
      console.log('select', i, await selects[i].evaluate((node) => node.innerText));
    }
    const inputs = page.locator('input');
    for (let i = 0; i < await inputs.count(); i++) {
      console.log('INPUT', i, 'placeholder:', await inputs.nth(i).getAttribute('placeholder'), 'type:', await inputs.nth(i).getAttribute('type'), 'name:', await inputs.nth(i).getAttribute('name'));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();