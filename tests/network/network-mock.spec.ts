import { expect, test } from '@fixtures';
import { Routes } from '@constants/Routes';
import { NetworkHelper } from '@helpers/NetworkHelper';

test.describe('Network Interception', () => {
  test('should handle failed login API gracefully @network', async ({ loginPage, adminUser }) => {
    await NetworkHelper.mockFailedRequest(loginPage.page, /auth\/login/);
    await loginPage.navigate(Routes.LOGIN);
    await loginPage.usernameInput.fill(adminUser.username);
    await loginPage.passwordInput.fill(adminUser.password);
    await loginPage.loginButton.click();
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test('should display loading state during slow network @network', async ({ employeePage }) => {
    await NetworkHelper.simulateSlowNetwork(employeePage.page, /pim\/viewEmployeeList/, 3000);
    await employeePage.page.goto(Routes.EMPLOYEE_LIST);
    const spinner = employeePage.page.getByRole('progressbar');
    await expect(spinner).toBeVisible();
  });

  test('should display empty employee list response @network', async ({ employeePage }) => {
    await NetworkHelper.mockApiResponse(employeePage.page, /pim\/employees/, { status: 200, body: { employees: [] } });
    await employeePage.page.goto(Routes.EMPLOYEE_LIST);
    await expect(employeePage.noRecordsText).toBeVisible();
  });

  test('should recover from network timeout @network', async ({ employeePage }) => {
    await NetworkHelper.blockRequests(employeePage.page, /pim\/viewEmployeeList/);
    await employeePage.page.goto(Routes.EMPLOYEE_LIST);
    await expect(employeePage.page).toHaveURL(/viewEmployeeList/);
  });
});
