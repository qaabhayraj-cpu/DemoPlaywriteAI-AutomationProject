import { test as base, expect, type Page } from '@playwright/test';
import { AuthApi } from '@api/endpoints/AuthApi';
import { EmployeeApi } from '@api/endpoints/EmployeeApi';
import { ApiClient } from '@api/ApiClient';
import { DashboardPage } from '@pages/DashboardPage';
import { EmployeePage } from '@pages/EmployeePage';
import { LeavePage } from '@pages/LeavePage';
import { LoginPage } from '@pages/LoginPage';
import { ProfilePage } from '@pages/ProfilePage';
import { NavigationMenu } from '@components/NavigationMenu';
import { TopBar } from '@components/TopBar';
import { DataFactory } from '@helpers/DataFactory';
import { envConfig } from '@config';
import users from '../../test-data/users.json' with { type: 'json' };
import leaveTypes from '../../test-data/leave-types.json' with { type: 'json' };

export interface Fixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeePage: EmployeePage;
  leavePage: LeavePage;
  profilePage: ProfilePage;
  navMenu: NavigationMenu;
  topBar: TopBar;
  apiClient: ApiClient;
  authApi: AuthApi;
  employeeApi: EmployeeApi;
  employeeData: ReturnType<typeof DataFactory.generateEmployee>;
  leaveData: ReturnType<typeof DataFactory.generateLeaveRequest>;
  invalidCredentials: ReturnType<typeof DataFactory.generateInvalidCredentials>;
  adminUser: { username: string; password: string; role: string };
  leaveTypes: string[];
  authenticatedPage: Page;
}

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const fs = await import('fs/promises');
    const authStatePath = envConfig.authStatePath;

    try {
      await fs.access(authStatePath);
    } catch {
      throw new Error(
        `Auth state '${authStatePath}' was not found. Run global setup or set AUTH_STATE_PATH to a valid storage state file.`,
      );
    }

    const context = await browser.newContext({ storageState: authStatePath });
    const page = await context.newPage();

    page.on('response', async (response) => {
      if (response.status() === 401 || response.status() === 403) {
        // eslint-disable-next-line no-console
        console.warn(
          `⚠️  Auth failure detected (${response.status()} ${response.statusText()}) — invalidating auth state at ${authStatePath}`,
        );
        try {
          await fs.unlink(authStatePath);
          // eslint-disable-next-line no-console
          console.warn('🔄 Auth state invalidated. Global setup will regenerate on next run.');
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to invalidate auth state:', error);
        }
      }
    });

    await use(page);
    await context.close();
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ authenticatedPage }, use) => {
    await use(new DashboardPage(authenticatedPage));
  },

  employeePage: async ({ authenticatedPage }, use) => {
    await use(new EmployeePage(authenticatedPage));
  },

  leavePage: async ({ authenticatedPage }, use) => {
    await use(new LeavePage(authenticatedPage));
  },

  profilePage: async ({ authenticatedPage }, use) => {
    await use(new ProfilePage(authenticatedPage));
  },

  navMenu: async ({ authenticatedPage }, use) => {
    await use(new NavigationMenu(authenticatedPage));
  },

  topBar: async ({ authenticatedPage }, use) => {
    await use(new TopBar(authenticatedPage));
  },

  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    const fs = await import('fs/promises');
    let cookieHeader = '';
    try {
      const data = await fs.readFile('auth.json', 'utf8');
      const state = JSON.parse(data);
      const cookies = state.cookies ?? [];
      cookieHeader = cookies.map((c: { name: string; value: string }) => `${c.name}=${c.value}`).join('; ');
    } catch {
      // no auth.json — tests that need auth should call authApi.login directly
    }

    if (cookieHeader) {
      client.setAuthToken(cookieHeader);
    }

    await use(client);
  },

  authApi: async ({ apiClient }, use) => {
    await use(new AuthApi(apiClient));
  },

  employeeApi: async ({ apiClient }, use) => {
    await use(new EmployeeApi(apiClient));
  },

  employeeData: async ({}, use) => {
    await use(DataFactory.generateEmployee());
  },

  leaveData: async ({}, use) => {
    await use(DataFactory.generateLeaveRequest());
  },

  invalidCredentials: async ({}, use) => {
    await use(DataFactory.generateInvalidCredentials());
  },

  adminUser: async ({}, use) => {
    await use(users.admin);
  },

  leaveTypes: async ({}, use) => {
    await use(leaveTypes);
  },
});

export { expect } from '@playwright/test';
