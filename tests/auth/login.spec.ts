import { expect, test } from '@fixtures';

test.describe('Authentication', () => {
  test('should show error with invalid password @regression', async ({ loginPage, invalidCredentials, adminUser }) => {
    await loginPage.navigate('/web/index.php/auth/login');
    const message = await loginPage.loginAndExpectError(adminUser.username, invalidCredentials.password);
    expect(message.toLowerCase()).toContain('invalid');
  });

  test('should show validation for empty username @regression', async ({ loginPage, adminUser }) => {
    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.passwordInput.fill(adminUser.password);
    await loginPage.loginButton.click();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.fieldValidationMessage).toBeVisible();
  });

  test('should show validation for empty password @regression', async ({ loginPage, adminUser }) => {
    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.usernameInput.fill(adminUser.username);
    await loginPage.loginButton.click();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.fieldValidationMessage).toBeVisible();
  });

  test('should show validation for both fields empty @regression', async ({ loginPage }) => {
    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.loginButton.click();
    await expect(loginPage.fieldValidationMessage).toBeVisible();
  });

  test('should display all login page elements correctly @regression', async ({ loginPage }) => {
    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.verifyLoginPageElements();
  });

  test('should pass accessibility audit on login page @a11y', async ({ loginPage }) => {
    await loginPage.navigate('/web/index.php/auth/login');
    await loginPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });
});
