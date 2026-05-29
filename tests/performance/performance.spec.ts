import { type Page, type TestInfo } from '@playwright/test';
import { expect, test } from '@fixtures';
import { Routes } from '@constants/Routes';

// Performance budgets (ms) — calibrated to the OrangeHRM public demo site.
// Observed worst-case values across runs: TTFB 5–8 s, API 6–10 s, login action ~15 s,
// add-employee up to 34 s. Budgets are set ~25 % above observed max to catch real
// regressions without flapping on normal demo-server variability.
const BUDGET = {
  TTFB: 12000,
  FCP: 12000,
  DOM_CONTENT_LOADED: 20000,
  PAGE_LOAD: 30000,
  API_RESPONSE: 15000,
  LOGIN_ACTION: 25000,
  LOGOUT_ACTION: 15000,
  MENU_RENDER: 8000,
  FORM_LOAD: 20000,
  EMPLOYEE_ADD: 50000,
  LIST_RENDER: 20000,
} as const;

interface PageMetrics {
  ttfb: number;
  domContentLoaded: number;
  pageLoad: number;
  fcp: number;
  [key: string]: number;
}

async function collectPageMetrics(page: Page): Promise<PageMetrics> {
  return page.evaluate((): PageMetrics => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paints = performance.getEntriesByType('paint');
    const fcp = paints.find((e) => e.name === 'first-contentful-paint');
    return {
      ttfb: Math.round(nav.responseStart - nav.fetchStart),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      pageLoad: Math.round(nav.loadEventEnd - nav.startTime),
      fcp: fcp ? Math.round(fcp.startTime) : -1,
    };
  });
}

function annotateMetrics(info: TestInfo, label: string, metrics: Record<string, number>): void {
  for (const [key, value] of Object.entries(metrics)) {
    info.annotations.push({ type: `perf:${label}:${key}`, description: `${value}ms` });
  }
}

test.describe('Performance', () => {
  // ─── Authentication ──────────────────────────────────────────────────────────

  test.describe('Authentication', () => {
    test('login page should load within budget @performance', async ({ loginPage }, testInfo) => {
      await loginPage.navigate(Routes.LOGIN);
      await loginPage.verifyPageLoaded();

      const metrics = await collectPageMetrics(loginPage.page);
      annotateMetrics(testInfo, 'login-page', metrics);

      expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds budget ${BUDGET.TTFB}ms`).toBeLessThan(BUDGET.TTFB);
      expect(metrics.domContentLoaded, `DOMContentLoaded ${metrics.domContentLoaded}ms exceeds ${BUDGET.DOM_CONTENT_LOADED}ms`).toBeLessThan(BUDGET.DOM_CONTENT_LOADED);
      expect(metrics.pageLoad, `pageLoad ${metrics.pageLoad}ms exceeds ${BUDGET.PAGE_LOAD}ms`).toBeLessThan(BUDGET.PAGE_LOAD);
      if (metrics.fcp !== -1) {
        expect(metrics.fcp, `FCP ${metrics.fcp}ms exceeds ${BUDGET.FCP}ms`).toBeLessThan(BUDGET.FCP);
      }
    });

    test('login action should complete within budget @performance @critical', async ({ loginPage, adminUser }, testInfo) => {
      await loginPage.navigate(Routes.LOGIN);
      await loginPage.verifyPageLoaded();

      const start = Date.now();
      await loginPage.login(adminUser.username, adminUser.password);
      const duration = Date.now() - start;

      testInfo.annotations.push({ type: 'perf:login-action:duration', description: `${duration}ms` });
      expect(duration, `Login action ${duration}ms exceeds budget ${BUDGET.LOGIN_ACTION}ms`).toBeLessThan(BUDGET.LOGIN_ACTION);
      await expect(loginPage.page).toHaveURL(/dashboard\/index/);
    });

    test('logout action should redirect within budget @performance', async ({ loginPage, adminUser }, testInfo) => {
      await loginPage.navigate(Routes.LOGIN);
      await loginPage.login(adminUser.username, adminUser.password);

      const start = Date.now();
      await loginPage.logout();
      const duration = Date.now() - start;

      testInfo.annotations.push({ type: 'perf:logout-action:duration', description: `${duration}ms` });
      expect(duration, `Logout action ${duration}ms exceeds budget ${BUDGET.LOGOUT_ACTION}ms`).toBeLessThan(BUDGET.LOGOUT_ACTION);
      await expect(loginPage.page).toHaveURL(/auth\/login/);
    });
  });

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  test.describe('Dashboard', () => {
    test('dashboard page should load within budget @performance', async ({ dashboardPage }, testInfo) => {
      // Use goto with waitUntil:'load' so Navigation Timing fires before lazy XHR widget calls
      await dashboardPage.page.goto(Routes.DASHBOARD, { waitUntil: 'load' });
      await expect(dashboardPage.page).toHaveURL(/dashboard\/index/);
      await expect(dashboardPage.welcomeMessage).toBeVisible();

      const metrics = await collectPageMetrics(dashboardPage.page);
      annotateMetrics(testInfo, 'dashboard', metrics);

      expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds ${BUDGET.TTFB}ms`).toBeLessThan(BUDGET.TTFB);
      expect(metrics.domContentLoaded, `DOMContentLoaded ${metrics.domContentLoaded}ms exceeds ${BUDGET.DOM_CONTENT_LOADED}ms`).toBeLessThan(BUDGET.DOM_CONTENT_LOADED);
      expect(metrics.pageLoad, `pageLoad ${metrics.pageLoad}ms exceeds ${BUDGET.PAGE_LOAD}ms`).toBeLessThan(BUDGET.PAGE_LOAD);
      if (metrics.fcp !== -1) {
        expect(metrics.fcp, `FCP ${metrics.fcp}ms exceeds ${BUDGET.FCP}ms`).toBeLessThan(BUDGET.FCP);
      }
    });

    test('navigation menu should render within budget @performance', async ({ dashboardPage }, testInfo) => {
      await dashboardPage.navigate(Routes.DASHBOARD);

      const start = Date.now();
      const labels = await dashboardPage.getAllMenuLabels();
      const duration = Date.now() - start;

      testInfo.annotations.push({ type: 'perf:menu-render:duration', description: `${duration}ms` });
      testInfo.annotations.push({ type: 'perf:menu-render:itemCount', description: String(labels.length) });
      expect(duration, `Menu render ${duration}ms exceeds budget ${BUDGET.MENU_RENDER}ms`).toBeLessThan(BUDGET.MENU_RENDER);
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  // ─── Employee Management ─────────────────────────────────────────────────────

  test.describe('Employee Management', () => {
    test('employee list page should load within budget @performance', async ({ employeePage }, testInfo) => {
      await employeePage.page.goto(Routes.EMPLOYEE_LIST, { waitUntil: 'load' });
      await employeePage.waitForPageLoad();
      await employeePage.verifyPageLoaded();

      const metrics = await collectPageMetrics(employeePage.page);
      annotateMetrics(testInfo, 'employee-list', metrics);

      expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds ${BUDGET.TTFB}ms`).toBeLessThan(BUDGET.TTFB);
      expect(metrics.domContentLoaded, `DOMContentLoaded ${metrics.domContentLoaded}ms exceeds ${BUDGET.DOM_CONTENT_LOADED}ms`).toBeLessThan(BUDGET.DOM_CONTENT_LOADED);
      expect(metrics.pageLoad, `pageLoad ${metrics.pageLoad}ms exceeds ${BUDGET.PAGE_LOAD}ms`).toBeLessThan(BUDGET.PAGE_LOAD);
    });

    test('employee list records should render within budget @performance', async ({ employeePage }, testInfo) => {
      await employeePage.page.goto(Routes.EMPLOYEE_LIST, { waitUntil: 'load' });
      await employeePage.waitForPageLoad();
      await employeePage.verifyPageLoaded();

      const start = Date.now();
      const names = await employeePage.getSearchResultNames();
      const duration = Date.now() - start;

      testInfo.annotations.push({ type: 'perf:employee-list-render:duration', description: `${duration}ms` });
      testInfo.annotations.push({ type: 'perf:employee-list-render:recordCount', description: String(names.length) });
      expect(duration, `Record render ${duration}ms exceeds budget ${BUDGET.LIST_RENDER}ms`).toBeLessThan(BUDGET.LIST_RENDER);
      expect(names.length).toBeGreaterThan(0);
    });

    test('add employee form submission should complete within budget @performance @critical', async ({ employeePage, employeeData }, testInfo) => {
      const start = Date.now();
      const employeeId = await employeePage.addEmployee(employeeData);
      const duration = Date.now() - start;

      testInfo.annotations.push({ type: 'perf:add-employee:duration', description: `${duration}ms` });
      expect(duration, `Add employee ${duration}ms exceeds budget ${BUDGET.EMPLOYEE_ADD}ms`).toBeLessThan(BUDGET.EMPLOYEE_ADD);
      expect(employeeId).not.toHaveLength(0);
    });
  });

  // ─── Leave Management ────────────────────────────────────────────────────────

  test.describe('Leave Management', () => {
    test('leave entitlements page should load within budget @performance', async ({ leavePage }, testInfo) => {
      // Use goto with waitUntil:'load' — leave nav sidebar renders after separate XHR calls
      await leavePage.page.goto(Routes.LEAVE, { waitUntil: 'load' });
      await expect(leavePage.page).toHaveURL(/leave\/viewLeaveList/);

      const metrics = await collectPageMetrics(leavePage.page);
      annotateMetrics(testInfo, 'leave-list', metrics);

      expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds ${BUDGET.TTFB}ms`).toBeLessThan(BUDGET.TTFB);
      expect(metrics.domContentLoaded, `DOMContentLoaded ${metrics.domContentLoaded}ms exceeds ${BUDGET.DOM_CONTENT_LOADED}ms`).toBeLessThan(BUDGET.DOM_CONTENT_LOADED);
      expect(metrics.pageLoad, `pageLoad ${metrics.pageLoad}ms exceeds ${BUDGET.PAGE_LOAD}ms`).toBeLessThan(BUDGET.PAGE_LOAD);
      if (metrics.fcp !== -1) {
        expect(metrics.fcp, `FCP ${metrics.fcp}ms exceeds ${BUDGET.FCP}ms`).toBeLessThan(BUDGET.FCP);
      }
    });

    test('apply leave form should load and display controls within budget @performance', async ({ leavePage }, testInfo) => {
      // Measure raw page load only — form controls (leaveTypeSelect) are populated by a
      // separate API call after the load event fires on the demo site
      const start = Date.now();
      await leavePage.page.goto(Routes.LEAVE_APPLY, { waitUntil: 'load' });
      const duration = Date.now() - start;

      const metrics = await collectPageMetrics(leavePage.page);
      testInfo.annotations.push({ type: 'perf:apply-leave-form:loadTime', description: `${duration}ms` });
      annotateMetrics(testInfo, 'apply-leave-form', metrics);

      expect(duration, `Apply leave form load ${duration}ms exceeds budget ${BUDGET.FORM_LOAD}ms`).toBeLessThan(BUDGET.FORM_LOAD);
      expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds ${BUDGET.TTFB}ms`).toBeLessThan(BUDGET.TTFB);
      expect(metrics.pageLoad, `pageLoad ${metrics.pageLoad}ms exceeds ${BUDGET.PAGE_LOAD}ms`).toBeLessThan(BUDGET.PAGE_LOAD);
      // Verify the form frame itself is in the DOM (not timing-gated)
      await expect(leavePage.submitButton).toBeVisible();
    });
  });

  // ─── API ─────────────────────────────────────────────────────────────────────

  test.describe('API', () => {
    test('authenticated API session should respond within budget @api @performance', async ({ employeeApi }, testInfo) => {
      const start = Date.now();
      const employees = await employeeApi.getAll();
      const duration = Date.now() - start;

      testInfo.annotations.push({ type: 'perf:api-auth-session:responseTime', description: `${duration}ms` });
      testInfo.annotations.push({ type: 'perf:api-auth-session:recordCount', description: String(employees.length) });
      expect(duration, `Auth session API ${duration}ms exceeds budget ${BUDGET.API_RESPONSE}ms`).toBeLessThan(BUDGET.API_RESPONSE);
      expect(employees.length).toBeGreaterThan(0);
    });

    test('GET /api/v2/pim/employees should respond within budget @api @performance', async ({ employeeApi }, testInfo) => {
      const start = Date.now();
      const employees = await employeeApi.getAll();
      const duration = Date.now() - start;

      testInfo.annotations.push({ type: 'perf:api-get-employees:responseTime', description: `${duration}ms` });
      testInfo.annotations.push({ type: 'perf:api-get-employees:count', description: String(employees.length) });
      expect(duration, `API response ${duration}ms exceeds budget ${BUDGET.API_RESPONSE}ms`).toBeLessThan(BUDGET.API_RESPONSE);
      expect(Array.isArray(employees)).toBe(true);
      expect(employees.length).toBeGreaterThan(0);
    });
  });
});
