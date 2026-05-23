import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { Routes } from '@constants/Routes';

export class ProfilePage extends BasePage {
  readonly profileHeading = this.page.getByRole('heading', { name: /Personal Details|My Info/i });
  readonly nameField = this.page.getByRole('textbox', { name: 'Full Name' }).first();
  readonly employeeIdField = this.page.getByRole('textbox', { name: 'Employee Id' }).first();
  readonly jobTitleField = this.page.getByRole('textbox', { name: 'Job Title' }).first();

  constructor(page: Page) {
    super(page);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${Routes.PROFILE}`));
    await expect(this.profileHeading).toBeVisible();
  }

  async getDisplayName(): Promise<string> {
    return this.getTextContent(this.profileHeading);
  }

  async verifyProfileFields(): Promise<void> {
    await expect(this.nameField).toBeVisible();
    await expect(this.employeeIdField).toBeVisible();
    await expect(this.jobTitleField).toBeVisible();
  }
}
