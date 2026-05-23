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

test.describe('Authentication', () => {
  test('should login successfully with valid credentials @smoke @critical', async ({ loginPage, adminUser }) => {
    allure.feature('Authentication');
    allure.story('Valid Login');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify that valid OrangeHRM credentials successfully authenticate to the dashboard');
    allure.tag('smoke');

    await test.step('Navigate to login page', async () => {
      await loginPage.navigate('/web/index.php/auth/login');
      await loginPage.verifyPageLoaded();
    });

    await test.step('Submit valid credentials', async () => {
      await loginPage.login(adminUser.username, adminUser.password);
      await expect(loginPage.page).toHaveURL(/dashboard\/index/);
    });
  });

  test('should show error with invalid password @regression', async ({ loginPage, invalidCredentials, adminUser }) => {
    allure.feature('Authentication');
    allure.story('Invalid Login');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify invalid login credentials display an appropriate error message');
    allure.tag('regression');

    await loginPage.navigate('/web/index.php/auth/login');
    const message = await loginPage.loginAndExpectError(adminUser.username, invalidCredentials.password);
    await expect(message.toLowerCase()).toContain('invalid');
  });

  test('should show validation for empty username @regression', async ({ loginPage, adminUser }) => {
    allure.feature('Authentication');
    allure.story('Validation');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify login validation triggers when username is omitted');
    allure.tag('regression');

    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.passwordInput.fill(adminUser.password);
    await loginPage.loginButton.click();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test('should show validation for empty password @regression', async ({ loginPage, adminUser }) => {
    allure.feature('Authentication');
    allure.story('Validation');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify login validation triggers when password is omitted');
    allure.tag('regression');

    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.usernameInput.fill(adminUser.username);
    await loginPage.loginButton.click();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test('should show validation for both fields empty @regression', async ({ loginPage }) => {
    allure.feature('Authentication');
    allure.story('Validation');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify login validation triggers when both username and password are omitted');
    allure.tag('regression');

    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.loginButton.click();
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test('should logout and redirect to login page @smoke', async ({ loginPage, adminUser }) => {
    allure.feature('Authentication');
    allure.story('Logout');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify that logout returns the user to the login page');
    allure.tag('smoke');

    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.login(adminUser.username, adminUser.password);
    await loginPage.logout();
    await expect(loginPage.page).toHaveURL(/auth\/login/);
    await loginPage.verifyPageLoaded();
  });

  test('should display all login page elements correctly @regression', async ({ loginPage }) => {
    allure.feature('Authentication');
    allure.story('UI Verification');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify the login page renders all expected elements');
    allure.tag('regression');

    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.verifyLoginPageElements();
  });

  test('should pass accessibility audit on login page @a11y', async ({ loginPage }) => {
    allure.feature('Authentication');
    allure.story('Accessibility');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify login page has no critical or serious accessibility violations');
    allure.tag('a11y');

    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });
});
