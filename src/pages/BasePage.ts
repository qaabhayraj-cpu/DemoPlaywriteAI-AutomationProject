import { AxeBuilder } from '@axe-core/playwright';
import { expect, Locator, Page } from '@playwright/test';
import { Timeouts } from '@constants/Timeouts';
import { WaitHelper } from '@helpers/WaitHelper';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: Timeouts.EXTRA_LONG });
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await WaitHelper.waitForNetworkIdle(this.page);
    await WaitHelper.waitForSpinner(this.page);
  }

  async getToastMessage(): Promise<string> {
    return WaitHelper.waitForToast(this.page);
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true, animations: 'disabled', path: undefined });
  }

  async checkA11y(options?: { tags?: string[] }): Promise<void> {
    const builder = new AxeBuilder({ page: this.page });

    if (options?.tags) {
      builder.withTags(options.tags);
    }

    const results = await builder.analyze();
    const violations = results.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious');

    if (violations.length > 0) {
      const report = JSON.stringify(violations, null, 2);
      await this.page.context().storageState();
      throw new Error(`Accessibility violations found: ${report}`);
    }
  }

  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent())?.trim() ?? '';
  }

  protected async waitForResponse(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForResponse((response) => {
      const url = response.url();
      return typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
    }, { timeout: Timeouts.LONG });
  }

  async softAssert(fn: () => Promise<void>, description?: string): Promise<boolean> {
    try {
      await fn();
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const logMsg = description ? `Soft assertion failed [${description}]: ${errorMsg}` : `Soft assertion failed: ${errorMsg}`;
      // eslint-disable-next-line no-console
      console.warn(`⚠️  ${logMsg}`);
      return false;
    }
  }

  abstract verifyPageLoaded(): Promise<void>;
}
