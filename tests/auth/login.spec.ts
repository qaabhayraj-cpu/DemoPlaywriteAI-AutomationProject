import { expect, test } from '@fixtures';
import { Routes } from '@constants/Routes';

test.describe('Authentication', () => {
  test('should show error with invalid password', async ({ loginPage, invalidCredentials, adminUser }) => {
    await loginPage.navigate(Routes.LOGIN);
    const message = await loginPage.loginAndExpectError(adminUser.username, invalidCredentials.password);
    expect(message.toLowerCase()).toContain('invalid');
  });

  test('should show validation for empty username', async ({ loginPage, adminUser }) => {
    await loginPage.navigate(Routes.LOGIN);
    await loginPage.passwordInput.fill(adminUser.password);
    await loginPage.loginButton.click();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.fieldValidationMessage).toBeVisible();
  });

  test('should show validation for empty password', async ({ loginPage, adminUser }) => {
    await loginPage.navigate(Routes.LOGIN);
    await loginPage.usernameInput.fill(adminUser.username);
    await loginPage.loginButton.click();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.fieldValidationMessage).toBeVisible();
  });

  test('should show validation for both fields empty', async ({ loginPage }) => {
    await loginPage.navigate(Routes.LOGIN);
    await loginPage.loginButton.click();
    await expect(loginPage.fieldValidationMessage).toBeVisible();
  });

  test('should display all login page elements correctly', async ({ loginPage }) => {
    await loginPage.navigate(Routes.LOGIN);
    await loginPage.verifyLoginPageElements();
  });

  test('should pass accessibility audit on login page @a11y', async ({ loginPage }) => {
    await loginPage.navigate(Routes.LOGIN);
    await loginPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });
});
