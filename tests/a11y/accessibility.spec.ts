import { test } from '@fixtures';

test.describe('Accessibility', () => {
  test('login page has no critical WCAG violations @a11y', async ({ loginPage }) => {
    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });

  test('dashboard has no critical WCAG violations @a11y', async ({ dashboardPage }) => {
    await dashboardPage.navigate('/web/index.php/dashboard/index');
    await dashboardPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });

  test('employee list page has no critical WCAG violations @a11y', async ({ employeePage }) => {
    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    await employeePage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });

  test('leave page has no critical WCAG violations @a11y', async ({ leavePage }) => {
    await leavePage.navigate('/web/index.php/leave/viewLeaveList');
    await leavePage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });
});
