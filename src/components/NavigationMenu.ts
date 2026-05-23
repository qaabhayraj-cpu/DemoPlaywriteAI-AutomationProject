import { type Page } from '@playwright/test';

export class NavigationMenu {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickMenu(name: string): Promise<void> {
    const item = this.page.getByRole('link', { name });
    await item.click();
  }

  async clickSubMenu(menu: string, subMenu: string): Promise<void> {
    const parentItem = this.page.getByRole('link', { name: menu });
    await parentItem.hover();
    await this.page.getByRole('link', { name: subMenu }).click();
  }

  async getActiveMenuItem(): Promise<string> {
    const active = this.page.locator('[aria-current="page"]');
    return (await active.innerText()).trim();
  }

  async getAllTopLevelMenus(): Promise<string[]> {
    const items = this.page.getByRole('link').filter({ hasText: /Admin|PIM|Leave|Time|Recruitment|My Info|Performance|Directory|Maintenance/ });
    const labels: string[] = [];
    const count = await items.count();

    for (let index = 0; index < count; index += 1) {
      labels.push((await items.nth(index).innerText()).trim());
    }

    return labels;
  }

  async isMenuVisible(name: string): Promise<boolean> {
    const item = this.page.getByRole('link', { name });
    return item.isVisible();
  }
}
