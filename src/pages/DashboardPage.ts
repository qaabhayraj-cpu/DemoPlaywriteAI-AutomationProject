import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  readonly welcomeMessage = this.page.getByRole('heading', { level: 6 });
  readonly quickLaunchItems = this.page.getByRole('list').filter({ hasText: /My Actions|Time at Work|Assign Leave|Leave List/ });
  readonly timeAtWorkWidget = this.page.getByText('Time at Work');
  readonly myActionsWidget = this.page.getByText('My Actions');

  constructor(page: Page) {
    super(page);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard\/index/);
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.timeAtWorkWidget).toBeVisible();
  }

  async getWelcomeMessage(): Promise<string> {
    return this.getTextContent(this.welcomeMessage);
  }

  async getAllMenuLabels(): Promise<string[]> {
    // On mobile the nav is collapsed behind a hamburger — open it only when links are not yet visible
    const firstNavLink = this.page.getByRole('link', { name: 'Admin' });
    if (!await firstNavLink.isVisible()) {
      const hamburger = this.page.locator('.oxd-main-menu-button');
      if (await hamburger.isVisible()) {
        await hamburger.click();
        await firstNavLink.waitFor({ state: 'visible', timeout: 5000 });
      }
    }

    const items = this.page.getByRole('link').filter({ hasText: /Admin|PIM|Leave|Time|Recruitment|My Info|Performance|Directory|Maintenance/ });
    const labels: string[] = [];
    const count = await items.count();

    for (let index = 0; index < count; index += 1) {
      labels.push(((await items.nth(index).textContent()) ?? '').trim());
    }

    return labels;
  }

  async navigateToModule(moduleName: 'PIM' | 'Leave' | 'Time' | 'Recruitment' | 'My Info'): Promise<void> {
    const urlPatterns: Record<string, RegExp> = {
      PIM: /pim\/viewEmployeeList/,
      Leave: /leave\/viewLeaveList/,
      Time: /time\//,
      Recruitment: /recruitment\//,
      'My Info': /pim\/viewPersonalDetails/,
    };
    const link = this.page.getByRole('link', { name: moduleName });
    await Promise.all([
      this.page.waitForURL(urlPatterns[moduleName], { timeout: 30000 }),
      link.click(),
    ]);
  }

  async getQuickLaunchItems(): Promise<string[]> {
    const items: string[] = [];
    const count = await this.quickLaunchItems.count();

    for (let index = 0; index < count; index += 1) {
      items.push((await this.quickLaunchItems.nth(index).innerText()).trim());
    }

    return items;
  }

  async verifyWidgetsPresent(): Promise<void> {
    await expect(this.timeAtWorkWidget).toBeVisible();
    await expect(this.myActionsWidget).toBeVisible();
  }
}
