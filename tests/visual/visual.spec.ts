import { expect, test } from '@fixtures';

type AllureInterface = {
  feature: (name: string) => void;
  story: (name: string) => void;
  severity: (name: string) => void;
  owner: (name: string) => void;
  description: (text: string) => void;
  tag: (name: string) => void;
};

const { allure } = globalThis as unknown as { allure: AllureInterface };

test.describe('Visual Regression', () => {
  test('login page matches visual baseline @visual', async ({ loginPage }) => {
    allure.feature('Visual Regression');
    allure.story('Login Page');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify the login page visual appearance matches the baseline');
    allure.tag('visual');

    await loginPage.navigate('/web/index.php/auth/login');
    await expect(loginPage.page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });

  test('dashboard layout matches visual baseline @visual', async ({ dashboardPage }) => {
    allure.feature('Visual Regression');
    allure.story('Dashboard Page');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify the dashboard visual appearance matches the baseline');
    allure.tag('visual');

    await dashboardPage.navigate('/web/index.php/dashboard/index');
    await expect(dashboardPage.page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });

  test('employee list page matches visual baseline @visual', async ({ employeePage }) => {
    allure.feature('Visual Regression');
    allure.story('Employee List');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify the employee list visual appearance matches the baseline');
    allure.tag('visual');

    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(employeePage.page).toHaveScreenshot('employee-list.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });

  test('leave page matches visual baseline @visual', async ({ leavePage }) => {
    allure.feature('Visual Regression');
    allure.story('Leave Page');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify the leave page visual appearance matches the baseline');
    allure.tag('visual');

    await leavePage.navigate('/web/index.php/leave/viewLeaveList');
    await expect(leavePage.page).toHaveScreenshot('leave-page.png', {
      maxDiffPixelRatio: 0.2,
      threshold: 0.2,
      fullPage: true,
    });
  });
});
