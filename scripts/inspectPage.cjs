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
    console.log('ADD EMPLOYEE URL:', page.url());
    const eid = page.locator('text=Employee Id').first();
    console.log('Employee Id text exists:', await eid.count());
    if (await eid.count() > 0) {
      console.log('Employee Id outerHTML:', await eid.evaluate((el) => el.outerHTML));
      const parent = await eid.evaluateHandle((el) => el.closest('div'));
      console.log('Employee Id parent outerHTML:', await parent.evaluate((el) => el.outerHTML));
    }
    const firstName = page.locator('text=First Name').first();
    console.log('First Name outerHTML:', await firstName.evaluate((el) => el.outerHTML));
    const lastName = page.locator('text=Last Name').first();
    console.log('Last Name outerHTML:', await lastName.evaluate((el) => el.outerHTML));

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList', { waitUntil: 'networkidle' });
    console.log('EMP LIST URL:', page.url());
    const empNameLabel = page.locator('text=Employee Name').first();
    console.log('Employee Name label count:', await empNameLabel.count());
    if (await empNameLabel.count() > 0) {
      console.log('Employee Name outerHTML:', await empNameLabel.evaluate((el) => el.outerHTML));
      const parent = await empNameLabel.evaluateHandle((el) => el.closest('div'));
      console.log('Employee Name parent outerHTML:', await parent.evaluate((el) => el.outerHTML));
    }
    const empIdLabel = page.locator('text=Employee Id').first();
    console.log('Employee Id label count:', await empIdLabel.count());
    if (await empIdLabel.count() > 0) {
      console.log('Employee Id outerHTML:', await empIdLabel.evaluate((el) => el.outerHTML));
      const parent = await empIdLabel.evaluateHandle((el) => el.closest('div'));
      console.log('Employee Id parent outerHTML:', await parent.evaluate((el) => el.outerHTML));
    }

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList', { waitUntil: 'networkidle' });
    console.log('LEAVE URL:', page.url());
    const apply = page.locator('text=Apply').nth(0);
    console.log('Apply text count:', await apply.count());
    if (await apply.count() > 0) {
      console.log('Apply outerHTML:', await apply.evaluate((el) => el.outerHTML));
    }
    const status = page.locator('text=Leave Type').first();
    console.log('Leave Type count:', await status.count());
    if (await status.count() > 0) {
      console.log('Leave Type outerHTML:', await status.evaluate((el) => el.outerHTML));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();