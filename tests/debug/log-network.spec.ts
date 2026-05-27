import { test } from '@playwright/test';
import { envConfig } from '../../config/env.config';
import { Routes } from '../../src/constants/Routes';

test('log network during login', async ({ page }) => {
  page.on('request', (req) => {
    // eslint-disable-next-line no-console
    console.log('REQUEST', req.method(), req.url());
  });

  page.on('response', (res) => {
    // eslint-disable-next-line no-console
    console.log('RESPONSE', res.status(), res.url());
  });

  await page.goto(Routes.LOGIN, { waitUntil: 'load' });
  await page.getByPlaceholder('Username').fill(envConfig.username);
  await page.getByPlaceholder('Password').fill(envConfig.password);
  await Promise.all([
    page.waitForURL(/dashboard\/index/, { waitUntil: 'load' }),
    page.getByRole('button', { name: 'Login' }).click(),
  ]);

  // Wait for page to fully load instead of hard waiting
  await page.waitForLoadState('load');
});
