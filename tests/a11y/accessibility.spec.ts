import { test } from '@fixtures';

type AllureInterface = {
  feature: (name: string) => void;
  story: (name: string) => void;
  severity: (name: string) => void;
  owner: (name: string) => void;
  description: (text: string) => void;
  tag: (name: string) => void;
};

const { allure } = globalThis as unknown as { allure: AllureInterface };

test.describe('Accessibility', () => {
  test('login page has no critical WCAG violations @a11y', async ({ loginPage }) => {
    allure.feature('Accessibility');
    allure.story('Login Page');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify no critical accessibility violations exist on the login page');
    allure.tag('a11y');

    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });

  test('dashboard has no critical WCAG violations @a11y', async ({ dashboardPage }) => {
    allure.feature('Accessibility');
    allure.story('Dashboard');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify no critical accessibility violations exist on the dashboard');
    allure.tag('a11y');

    await dashboardPage.navigate('/web/index.php/dashboard/index');
    await dashboardPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });

  test('employee list page has no critical WCAG violations @a11y', async ({ employeePage }) => {
    allure.feature('Accessibility');
    allure.story('Employee List');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify no critical accessibility violations exist on the employee list page');
    allure.tag('a11y');

    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    await employeePage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });

  test('leave page has no critical WCAG violations @a11y', async ({ leavePage }) => {
    allure.feature('Accessibility');
    allure.story('Leave Page');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify no critical accessibility violations exist on the leave page');
    allure.tag('a11y');

    await leavePage.navigate('/web/index.php/leave/viewLeaveList');
    await leavePage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });
});
