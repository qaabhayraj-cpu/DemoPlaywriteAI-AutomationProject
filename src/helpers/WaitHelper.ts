import { Locator, Page } from '@playwright/test';
import { Timeouts } from '@constants/Timeouts';

export class WaitHelper {
  static async waitForNetworkIdle(page: Page, timeout = Timeouts.SHORT): Promise<void> {
    try {
      await page.waitForLoadState('networkidle', { timeout });
    } catch {
      // Demo site has background polling that prevents networkidle; domcontentloaded is already satisfied
      await page.waitForLoadState('domcontentloaded', { timeout: Timeouts.SHORT });
    }
  }

  static async waitForSpinner(page: Page): Promise<void> {
    const spinner = page.getByRole('progressbar');
    if (await spinner.count() > 0) {
      await spinner.first().waitFor({ state: 'hidden', timeout: Timeouts.LONG });
    }
  }

  static async waitForToast(page: Page): Promise<string> {
    const toast = page.getByRole('status').first();
    await toast.waitFor({ state: 'visible', timeout: Timeouts.MEDIUM });
    const message = await toast.textContent() ?? '';
    await toast.waitFor({ state: 'hidden', timeout: Timeouts.LONG });
    return message.trim();
  }

  static async retryAction(fn: () => Promise<void>, retries = 3, delay = 1000): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        await fn();
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown retry error');
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  static async waitForTableRows(page: Page): Promise<void> {
    const rows = page.getByRole('row');
    await rows.first().waitFor({ state: 'visible', timeout: Timeouts.MEDIUM });
  }

  static async waitForLocatorCount(locator: Locator, expectedCount: number): Promise<void> {
    await locator.first().waitFor({ state: 'visible', timeout: Timeouts.MEDIUM });
    await locator.nth(expectedCount - 1).waitFor({ state: 'visible', timeout: Timeouts.MEDIUM });
  }
}
