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

  await page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
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
