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

    // Employee add page
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/addEmployee', { waitUntil: 'domcontentloaded' });
    console.log('--- ADD EMPLOYEE SELECTORS ---');
    console.log('First name labels:');
    console.log(await page.locator('label:has-text("First Name")').allTextContents());
    console.log('Last name labels:');
    console.log(await page.locator('label:has-text("Last Name")').allTextContents());
    console.log('Employee id labels:');
    console.log(await page.locator('label:has-text("Employee Id")').allTextContents());
    console.log('employeeId field count:');
    console.log(await page.locator('input[name="employeeId"]').count());
    console.log('all inputs with placeholder:');
    const inputs = await page.locator('input[placeholder]').all();
    for (let i = 0; i < inputs.length; ++i) {
      console.log(i, await inputs.nth(i).getAttribute('placeholder'), await inputs.nth(i).getAttribute('name'), await inputs.nth(i).getAttribute('type'));
    }

    // Employee list page
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList', { waitUntil: 'domcontentloaded' });
    console.log('--- EMPLOYEE LIST SCREEN ---');
    console.log('Search labels:');
    console.log(await page.locator('label').filter({ hasText: 'Employee Name' }).allTextContents());
    console.log(await page.locator('label').filter({ hasText: 'Employee Id' }).allTextContents());
    console.log('Textboxes count:', await page.locator('input[type="text"]').count());
    console.log('Textbox names:');
    const textboxes = await page.locator('input[type="text"]').all();
    for (let i = 0; i < await page.locator('input[type="text"]').count(); ++i) {
      console.log(i, await textboxes.nth(i).getAttribute('placeholder'), await textboxes.nth(i).getAttribute('name'), await textboxes.nth(i).getAttribute('aria-label'));
    }

    // Leave page
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveModule', { waitUntil: 'domcontentloaded' });
    console.log('--- LEAVE PAGE ---');
    console.log('Links and buttons text:');
    const controls = await page.locator('a, button, label, span, div').filter({ hasText: /Apply|My Leave|My Entitlements|Leave Type|From Date|To Date|Comments|Apply/ }).allTextContents();
    console.log(controls);
    console.log('Apply button text:', await page.locator('button').filter({ hasText: 'Apply' }).allTextContents());
    console.log('Comments labels:', await page.locator('label:has-text("Comments")').allTextContents());
    console.log('Select count:', await page.locator('select').count());
    console.log('Input placeholders:');
    const leaveInputs = await page.locator('input[placeholder]').all();
    for (let i = 0; i < await leaveInputs.count(); ++i) {
      console.log(i, await leaveInputs.nth(i).getAttribute('placeholder'), await leaveInputs.nth(i).getAttribute('name'));
    }

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
