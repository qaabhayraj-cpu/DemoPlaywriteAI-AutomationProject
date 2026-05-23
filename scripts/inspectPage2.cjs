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

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/addEmployee', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('ADD EMPLOYEE FIELD GROUPS');
    const groups = page.locator('.oxd-input-group');
    for (let i = 0; i < await groups.count(); i++) {
      const group = groups.nth(i);
      console.log('GROUP', i, 'outerHTML:', await group.evaluate((el) => el.outerHTML));
    }

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('EMPLOYEE LIST FIELD GROUPS');
    const searchGroups = page.locator('.oxd-form-row');
    for (let i = 0; i < await searchGroups.count(); i++) {
      const group = searchGroups.nth(i);
      console.log('SEARCH GROUP', i, 'outerHTML:', await group.evaluate((el) => el.outerHTML));
    }

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('LEAVE PAGE NAV');
    const navItems = page.locator('.oxd-topbar-body-nav-slot');
    for (let i = 0; i < await navItems.count(); i++) {
      console.log('NAV', i, await navItems.nth(i).innerText());
    }
    console.log('BUTTONS:', await page.locator('button').allTextContents());
    console.log('SELECTS:', await page.locator('select').allTextContents());
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();