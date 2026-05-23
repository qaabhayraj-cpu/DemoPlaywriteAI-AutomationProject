import { type Page } from '@playwright/test';

export class TopBar {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getUserName(): Promise<string> {
    const userName = this.page.getByText(/Welcome|Welcome Paul|Welcome Admin/i).first();
    return (await userName.textContent())?.trim() ?? '';
  }

  async openUserDropdown(): Promise<void> {
    const dropdown = this.page.getByRole('button', { name: /Me|Welcome/i });
    await dropdown.click();
  }

  async logout(): Promise<void> {
    await this.openUserDropdown();
    await this.page.getByRole('menuitem', { name: /Logout/i }).click();
  }

  async getNotificationCount(): Promise<number> {
    const badge = this.page.getByRole('status').filter({ hasText: /\d+/ }).first();
    const value = (await badge.textContent())?.trim() ?? '0';
    return Number(value.replace(/[^\d]/g, ''));
  }
}
