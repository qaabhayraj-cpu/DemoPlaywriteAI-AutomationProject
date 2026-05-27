import { test } from '@fixtures';
import { Routes } from '@constants/Routes';

test.describe('Accessibility', () => {
  test('login page has no critical WCAG violations @a11y', async ({ loginPage }) => {
    await loginPage.navigate(Routes.LOGIN);
    await loginPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });

  test('dashboard has no critical WCAG violations @a11y', async ({ dashboardPage }) => {
    await dashboardPage.navigate(Routes.DASHBOARD);
    await dashboardPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });

  test('employee list page has no critical WCAG violations @a11y', async ({ employeePage }) => {
    await employeePage.page.goto(Routes.EMPLOYEE_LIST);
    await employeePage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });

  test('leave page has no critical WCAG violations @a11y', async ({ leavePage }) => {
    await leavePage.navigate(Routes.LEAVE);
    await leavePage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });
});
