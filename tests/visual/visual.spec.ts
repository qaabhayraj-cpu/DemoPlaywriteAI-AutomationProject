import { expect, test } from '@fixtures';
import { Routes } from '@constants/Routes';

test.describe('Visual Regression', () => {
  test('login page matches visual baseline @visual', async ({ loginPage }) => {
    await loginPage.navigate(Routes.LOGIN);
    await expect(loginPage.page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });

  test('dashboard layout matches visual baseline @visual', async ({ dashboardPage }) => {
    await dashboardPage.navigate(Routes.DASHBOARD);
    await expect(dashboardPage.page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });

  test('employee list page matches visual baseline @visual', async ({ employeePage }) => {
    await employeePage.page.goto(Routes.EMPLOYEE_LIST);
    await expect(employeePage.page).toHaveScreenshot('employee-list.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });

  test('leave page matches visual baseline @visual', async ({ leavePage }) => {
    await leavePage.navigate(Routes.LEAVE);
    await expect(leavePage.page).toHaveScreenshot('leave-page.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });
});
