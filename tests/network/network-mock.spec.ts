import { expect, test } from '@fixtures';
import { NetworkHelper } from '@helpers/NetworkHelper';

test.describe('Network Interception', () => {
  test('should handle failed login API gracefully @network', async ({ loginPage }) => {
    await NetworkHelper.mockFailedRequest(loginPage.page, /auth\/login/);
    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.usernameInput.fill('Admin');
    await loginPage.passwordInput.fill('admin123');
    await loginPage.loginButton.click();
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test('should display loading state during slow network @network', async ({ employeePage }) => {
    await NetworkHelper.simulateSlowNetwork(employeePage.page, /pim\/viewEmployeeList/, 3000);
    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    const spinner = employeePage.page.getByRole('progressbar');
    await expect(spinner).toBeVisible();
  });

  test('should display empty employee list response @network', async ({ employeePage }) => {
    await NetworkHelper.mockApiResponse(employeePage.page, /pim\/employees/, { status: 200, body: { employees: [] } });
    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(employeePage.noRecordsText).toBeVisible();
  });

  test('should recover from network timeout @network', async ({ employeePage }) => {
    await NetworkHelper.blockRequests(employeePage.page, /pim\/viewEmployeeList/);
    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(employeePage.page).toHaveURL(/viewEmployeeList/);
  });
});
