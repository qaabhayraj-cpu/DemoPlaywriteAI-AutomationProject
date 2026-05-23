import { expect, test } from '@fixtures';
import { NetworkHelper } from '@helpers/NetworkHelper';

type AllureInterface = {
  feature: (name: string) => void;
  story: (name: string) => void;
  severity: (name: string) => void;
  owner: (name: string) => void;
  description: (text: string) => void;
  tag: (name: string) => void;
};

const { allure } = globalThis as unknown as { allure: AllureInterface };

test.describe('Network Interception', () => {
  test('should handle failed login API gracefully @network', async ({ loginPage }) => {
    allure.feature('Network');
    allure.story('Error Handling');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify the UI shows an error message when login API returns a server error');
    allure.tag('network');

    await NetworkHelper.mockFailedRequest(loginPage.page, /auth\/login/);
    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.usernameInput.fill('Admin');
    await loginPage.passwordInput.fill('admin123');
    await loginPage.loginButton.click();
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test('should display loading state during slow network @network', async ({ employeePage }) => {
    allure.feature('Network');
    allure.story('Slow Network');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify the application displays a loading indicator during slow responses');
    allure.tag('network');

    await NetworkHelper.simulateSlowNetwork(employeePage.page, /pim\/viewEmployeeList/, 3000);
    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    const spinner = employeePage.page.getByRole('progressbar');
    await expect(spinner).toBeVisible();
  });

  test('should display empty employee list response @network', async ({ employeePage }) => {
    allure.feature('Network');
    allure.story('Mock Response');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify the UI renders an empty state when the employee API returns no records');
    allure.tag('network');

    await NetworkHelper.mockApiResponse(employeePage.page, /pim\/employees/, { status: 200, body: { employees: [] } });
    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(employeePage.noRecordsText).toBeVisible();
  });

  test('should recover from network timeout @network', async ({ employeePage }) => {
    allure.feature('Network');
    allure.story('Retry');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify the application recovers when a timed out request is retried');
    allure.tag('network');

    await NetworkHelper.blockRequests(employeePage.page, /pim\/viewEmployeeList/);
    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(employeePage.page).toHaveURL(/viewEmployeeList/);
  });
});
