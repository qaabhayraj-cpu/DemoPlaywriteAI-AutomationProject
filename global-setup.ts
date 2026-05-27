import { chromium } from '@playwright/test';
import { envConfig } from './config/env.config';
import fs from 'fs';

async function globalSetup(): Promise<void> {
  const authStatePath = envConfig.authStatePath;
  const authStateExists = fs.existsSync(authStatePath);

  if (authStateExists) {
    try {
      JSON.parse(fs.readFileSync(authStatePath, 'utf8'));
      // eslint-disable-next-line no-console
      console.log(`✅ Global setup skipped — existing auth state found at ${authStatePath}`);
      return;
    } catch {
      // invalid auth state, regenerate below
    }
  }

  const browser = await chromium.launch({ headless: envConfig.headless, slowMo: envConfig.slowMo });
  const context = await browser.newContext({ baseURL: envConfig.baseUrl });
  const page = await context.newPage();

  // Retry page.goto up to 3 times — the public demo site can be slow on CI runners
  const maxRetries = 3;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // eslint-disable-next-line no-console
      if (attempt > 1) console.log(`⟳ Global setup — goto attempt ${attempt}/${maxRetries}...`);
      await page.goto('/web/index.php/auth/login', {
        waitUntil: 'domcontentloaded',
        timeout: envConfig.navigationTimeout,
      });
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
      // eslint-disable-next-line no-console
      console.warn(`⚠️ Global setup — goto attempt ${attempt} failed: ${(err as Error).message}`);
      if (attempt < maxRetries) await page.waitForTimeout(5000);
    }
  }
  if (lastError) throw lastError;

  await page.getByPlaceholder('Username').fill(envConfig.username);
  await page.getByPlaceholder('Password').fill(envConfig.password);
  await Promise.all([
    page.waitForURL('**/dashboard/index', { timeout: envConfig.timeout }),
    page.getByRole('button', { name: 'Login' }).click(),
  ]);

  await page.getByRole('heading', { name: /Dashboard/i }).waitFor({ state: 'visible', timeout: envConfig.timeout });
  await context.storageState({ path: authStatePath });

  await browser.close();
  // eslint-disable-next-line no-console
  console.log(`✅ Global setup complete — auth state saved to ${authStatePath}`);
}

export default globalSetup;
