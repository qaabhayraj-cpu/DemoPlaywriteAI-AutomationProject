import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { Routes } from '@constants/Routes';
import { Timeouts } from '@constants/Timeouts';
import { envConfig } from '@config';

export class LoginPage extends BasePage {
  readonly usernameInput = this.page.getByPlaceholder('Username');
  readonly passwordInput = this.page.getByPlaceholder('Password');
  readonly loginButton = this.page.getByRole('button', { name: 'Login' });
  readonly errorAlert = this.page.getByRole('alert');
  readonly brandLogo = this.page.getByRole('img', { name: /orange/i });
  readonly fieldValidationMessage = this.page.getByText('Required').first();

  constructor(page: Page) {
    super(page);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.brandLogo).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.page.waitForURL(`**${Routes.DASHBOARD}`, { timeout: Timeouts.EXTRA_LONG }),
      this.loginButton.click(),
    ]);
  }

  async loginWithEnvCredentials(): Promise<void> {
    await this.navigate(Routes.LOGIN);
    await this.login(envConfig.username, envConfig.password);
  }

  async loginAndExpectError(username: string, password: string): Promise<string> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await expect(this.errorAlert).toBeVisible();
    return (await this.errorAlert.textContent())?.trim() ?? '';
  }

  async verifyLoginPageElements(): Promise<void> {
    await this.verifyPageLoaded();
    await expect(this.page).toHaveTitle(/OrangeHRM/);
  }

  async logout(): Promise<void> {
    const userMenu = this.page.locator('.oxd-userdropdown-tab').first();
    await userMenu.waitFor({ state: 'visible' });
    await userMenu.click();
    const logoutButton = this.page.getByRole('menuitem', { name: /Logout/i }).first();
    await Promise.all([
      this.page.waitForURL(`**${Routes.LOGIN}`, { timeout: Timeouts.EXTRA_LONG }),
      logoutButton.click(),
    ]);
  }
}
