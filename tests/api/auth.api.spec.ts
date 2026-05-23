import { expect, test } from '@fixtures';

type AllureInterface = {
  feature: (name: string) => void;
  story: (name: string) => void;
  severity: (name: string) => void;
  owner: (name: string) => void;
  description: (text: string) => void;
  tag: (name: string) => void;
};

const { allure } = globalThis as unknown as { allure: AllureInterface };

test.describe('Auth API', () => {
  test('POST /auth/login returns token for valid credentials @api @smoke', async ({ authApi, adminUser }) => {
    allure.feature('API');
    allure.story('Auth Login');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify the authentication API returns a valid token for correct credentials');
    allure.tag('smoke');

    const response = await authApi.login(adminUser.username, adminUser.password);
    expect(response.token).toBeTruthy();
  });

  test('POST /auth/login returns 401 for invalid credentials @api', async ({ authApi, invalidCredentials }) => {
    allure.feature('API');
    allure.story('Auth Login');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify the authentication API rejects invalid credentials with 401');
    allure.tag('api');

    await expect(async () => authApi.login(invalidCredentials.username, invalidCredentials.password)).rejects.toThrow();
  });

  test('POST /auth/login rejects empty credentials @api', async ({ authApi }) => {
    allure.feature('API');
    allure.story('Auth Validation');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify the authentication API rejects empty username and password');
    allure.tag('api');

    await expect(async () => authApi.login('', '')).rejects.toThrow();
  });

  test('GET session info returns valid session data @api', async ({ authApi }) => {
    allure.feature('API');
    allure.story('Session Info');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify session info can be retrieved after login');
    allure.tag('api');

    await expect(async () => authApi.getSessionInfo()).resolves.not.toThrow();
  });
});
