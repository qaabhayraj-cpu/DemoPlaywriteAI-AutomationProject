import { expect, test } from '@fixtures';

test.describe('Smoke', () => {
  // ─── Authentication UI ──────────────────────────────────────────────────────

  test.describe('Authentication', () => {
    test('should login successfully with valid credentials @smoke @critical', async ({ loginPage, adminUser }) => {
      await test.step('Navigate to login page', async () => {
        await loginPage.navigate('/web/index.php/auth/login');
        await loginPage.verifyPageLoaded();
      });

      await test.step('Submit valid credentials', async () => {
        await loginPage.login(adminUser.username, adminUser.password);
        await expect(loginPage.page).toHaveURL(/dashboard\/index/);
      });
    });

    test('should logout and redirect to login page @smoke', async ({ loginPage, adminUser }) => {
      await loginPage.navigate('/web/index.php/auth/login');
      await loginPage.login(adminUser.username, adminUser.password);
      await loginPage.logout();
      await expect(loginPage.page).toHaveURL(/auth\/login/);
      await loginPage.verifyPageLoaded();
    });
  });

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  test.describe('Dashboard', () => {
    test('should display dashboard after login @smoke', async ({ dashboardPage }) => {
      await dashboardPage.navigate('/web/index.php/dashboard/index');
      await dashboardPage.verifyPageLoaded();
    });

    test('should display all top-level navigation menu items @smoke', async ({ dashboardPage }) => {
      await dashboardPage.navigate('/web/index.php/dashboard/index');
      const labels = await dashboardPage.getAllMenuLabels();
      const expected = ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance', 'Directory', 'Maintenance'];

      for (const label of expected) {
        expect(labels, `Menu should include ${label}`).toContain(label);
      }
    });
  });

  // ─── Employee ─────────────────────────────────────────────────────────────

  test.describe('Employee Management', () => {
    test('should add a new employee successfully @smoke @critical', async ({ employeePage, employeeData }) => {
      const employeeId = await employeePage.addEmployee(employeeData);
      expect(employeeId).not.toHaveLength(0);
    });

    test('should display employee list with records @smoke', async ({ employeePage }) => {
      await employeePage.page.goto('/web/index.php/pim/viewEmployeeList', { waitUntil: 'domcontentloaded' });
      await employeePage.waitForPageLoad();
      await employeePage.verifyPageLoaded();
      const names = await employeePage.getSearchResultNames();
      expect(names.length).toBeGreaterThan(0);
    });
  });

  // ─── Leave ────────────────────────────────────────────────────────────────

  test.describe('Leave Management', () => {
    test('should display leave entitlements page @smoke', async ({ leavePage }) => {
      await leavePage.navigate('/web/index.php/leave/viewLeaveList');
      await leavePage.verifyPageLoaded();
    });
  });

  // ─── API ─────────────────────────────────────────────────────────────────

  test.describe('API', () => {
    test('authenticated API session returns employee data @api @smoke', async ({ employeeApi }) => {
      const employees = await employeeApi.getAll();
      expect(employees.length).toBeGreaterThan(0);
    });

    test('GET /api/v2/pim/employees returns employee array @api @smoke', async ({ employeeApi }) => {
      const employees = await employeeApi.getAll();
      expect(Array.isArray(employees)).toBe(true);
      expect(employees.length).toBeGreaterThan(0);
    });
  });
});
