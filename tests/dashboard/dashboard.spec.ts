import { expect, test } from '@fixtures';
import { Routes } from '@constants/Routes';

test.describe('Dashboard', () => {
  test('should display dashboard quick launch widgets', async ({ dashboardPage }) => {
    await dashboardPage.navigate(Routes.DASHBOARD);
    await dashboardPage.verifyWidgetsPresent();
  });

  test('should navigate to PIM module from menu', async ({ dashboardPage }) => {
    await dashboardPage.navigate(Routes.DASHBOARD);
    await dashboardPage.navigateToModule('PIM');
    await expect(dashboardPage.page).toHaveURL(/pim\/viewEmployeeList/);
  });

  test('should navigate to Leave module from menu', async ({ dashboardPage }) => {
    await dashboardPage.navigate(Routes.DASHBOARD);
    await dashboardPage.navigateToModule('Leave');
    await expect(dashboardPage.page).toHaveURL(/leave\/viewLeaveList/);
  });

  test('should pass accessibility audit on dashboard @a11y', async ({ dashboardPage }) => {
    await dashboardPage.navigate(Routes.DASHBOARD);
    await dashboardPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });
});
