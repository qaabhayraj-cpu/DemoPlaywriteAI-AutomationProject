import { expect, test } from '@fixtures';
import { Routes } from '@constants/Routes';

test.describe('Dashboard', () => {
  test('should display dashboard quick launch widgets', async ({ dashboardPage }) => {
    await dashboardPage.navigate(Routes.DASHBOARD);
    await dashboardPage.verifyWidgetsPresent();
  });

});

// ─── Canary ───────────────────────────────────────────────────────────────
// INTENTIONAL, KEPT ON PURPOSE. This test always fails — it is not a bug.
// It's a negative control: if this ever goes green, something is silently
// swallowing failures upstream (reporter misconfig, wrong exit code, etc.)
// and the rest of the suite's "all passing" result can no longer be trusted.
// Do not "fix" it by changing the assertion or the app.

test.describe('Canary', () => {
  // Guaranteed to fail — retrying it just burns time, so skip retries here.
  test.describe.configure({ retries: 0 });

  test('INTENTIONAL FAIL — proves the suite reports real failures', async ({ dashboardPage }) => {
    await dashboardPage.navigate(Routes.DASHBOARD);
    await expect(dashboardPage.page.getByText('QA-CANARY-INTENTIONAL-FAILURE-MARKER')).toBeVisible();
  });
});
