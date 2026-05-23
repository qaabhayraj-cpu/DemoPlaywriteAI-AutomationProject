import { Locator, Page, Request, Route } from '@playwright/test';

export class NetworkHelper {
  static async mockApiResponse(page: Page, urlPattern: string | RegExp, response: { status: number; body: unknown }): Promise<void> {
    await page.route(urlPattern, async (route) => {
      await route.fulfill({ status: response.status, body: JSON.stringify(response.body), headers: { 'Content-Type': 'application/json' } });
    });
  }

  static async blockRequests(page: Page, urlPattern: string | RegExp): Promise<void> {
    await page.route(urlPattern, async (route) => {
      await route.abort();
    });
  }

  static async captureRequests(page: Page, urlPattern: string | RegExp): Promise<Request[]> {
    const requests: Request[] = [];
    page.on('requestfinished', (request) => {
      const url = request.url();
      if (typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url)) {
        requests.push(request);
      }
    });
    return requests;
  }

  static async simulateSlowNetwork(page: Page, urlPattern: string | RegExp, delayMs: number): Promise<void> {
    await page.route(urlPattern, async (route) => {
      const request = route.request();
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await route.continue();
    });
  }

  static async mockFailedRequest(page: Page, urlPattern: string | RegExp): Promise<void> {
    await page.route(urlPattern, async (route) => {
      await route.fulfill({ status: 500, body: JSON.stringify({ message: 'Simulated server error' }), headers: { 'Content-Type': 'application/json' } });
    });
  }
}
