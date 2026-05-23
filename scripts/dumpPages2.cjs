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
    console.log('DASHBOARD URL:', page.url());
    await page.waitForLoadState('networkidle');

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/addEmployee');
    await page.waitForTimeout(2000);
    console.log('ADD EMPLOYEE URL:', page.url());
    console.log('BODY TEXT:', (await page.locator('body').innerText()).slice(0, 1200));
    console.log('INPUT COUNT:', await page.locator('input').count());
    const inputs = page.locator('input');
    for (let i = 0; i < await inputs.count(); i++) {
      console.log('--', i, await inputs.nth(i).getAttribute('name'), await inputs.nth(i).getAttribute('placeholder'), await inputs.nth(i).getAttribute('role'), await inputs.nth(i).getAttribute('type'));
    }

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
    await page.waitForTimeout(2000);
    console.log('EMP LIST URL:', page.url());
    console.log('BODY TEXT:', (await page.locator('body').innerText()).slice(0, 1200));
    console.log('INPUT COUNT:', await page.locator('input').count());

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveModule');
    await page.waitForTimeout(2000);
    console.log('LEAVE URL:', page.url());
    console.log('BODY TEXT:', (await page.locator('body').innerText()).slice(0, 1200));
    console.log('BUTTON COUNT:', await page.locator('button').count());
    console.log('BUTTON TEXTS:', await page.locator('button').allTextContents());
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();