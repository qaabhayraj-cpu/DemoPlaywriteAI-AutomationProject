import { expect, test } from '@fixtures';

test.describe('Visual Regression', () => {
  test('login page matches visual baseline @visual', async ({ loginPage }) => {
    await loginPage.navigate('/web/index.php/auth/login');
    await expect(loginPage.page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });

  test('dashboard layout matches visual baseline @visual', async ({ dashboardPage }) => {
    await dashboardPage.navigate('/web/index.php/dashboard/index');
    await expect(dashboardPage.page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });

  test('employee list page matches visual baseline @visual', async ({ employeePage }) => {
    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(employeePage.page).toHaveScreenshot('employee-list.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });

  test('leave page matches visual baseline @visual', async ({ leavePage }) => {
    await leavePage.navigate('/web/index.php/leave/viewLeaveList');
    await expect(leavePage.page).toHaveScreenshot('leave-page.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });
});
