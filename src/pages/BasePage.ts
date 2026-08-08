import { AxeBuilder } from '@axe-core/playwright';
import { expect, Locator, Page } from '@playwright/test';
import { Timeouts } from '@constants/Timeouts';
import { Routes } from '@constants/Routes';
import { WaitHelper } from '@helpers/WaitHelper';
import { envConfig } from '@config';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.gotoWithRecovery(path);
    await this.waitForPageLoad();
  }

  /**
   * Navigate with one automatic recovery attempt.
   *
   * The shared public demo host (opensource-demo.orangehrmlive.com) occasionally:
   *  a) fails the navigation outright (e.g. net::ERR_HTTP_RESPONSE_CODE_FAILURE), or
   *  b) resolves the session to a different demo persona that renders a
   *     "403 Module Forbidden" page instead of the requested module.
   * Neither is a defect in the app under test or in this suite — it's session
   * pooling on a shared, publicly-hammered demo instance. Re-authenticating and
   * retrying once absorbs that noise so real assertions aren't drowned out by it.
   */
  protected async gotoWithRecovery(path: string): Promise<void> {
    try {
      await this.page.goto(path, { waitUntil: 'load', timeout: Timeouts.EXTRA_LONG });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Navigation to ${path} failed (${(error as Error).message}) — retrying once`);
      // If the login page itself is what failed to load, re-authenticating would just
      // repeat the same navigation — skip straight to a plain retry.
      if (path !== Routes.LOGIN) {
        await this.reauthenticate();
      }
      await this.page.goto(path, { waitUntil: 'load', timeout: Timeouts.EXTRA_LONG });
      return;
    }

    if (await this.isAccessForbidden()) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  ${path} rendered "Module Forbidden" — session resolved to the wrong persona; re-authenticating and retrying once`);
      await this.reauthenticate();
      await this.page.goto(path, { waitUntil: 'load', timeout: Timeouts.EXTRA_LONG });
    }
  }

  private async isAccessForbidden(): Promise<boolean> {
    return this.page.getByText('Module Forbidden').isVisible({ timeout: 1000 }).catch(() => false);
  }

  private async reauthenticate(): Promise<void> {
    await this.page.goto(Routes.LOGIN, { waitUntil: 'load', timeout: Timeouts.EXTRA_LONG });
    await this.page.getByPlaceholder('Username').fill(envConfig.username);
    await this.page.getByPlaceholder('Password').fill(envConfig.password);
    await Promise.all([
      this.page.waitForURL('**/dashboard/index', { timeout: Timeouts.EXTRA_LONG }),
      this.page.getByRole('button', { name: 'Login' }).click(),
    ]);
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
