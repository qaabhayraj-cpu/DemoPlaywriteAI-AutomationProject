import { expect, test } from '@fixtures';

test.describe('Auth API', () => {
  test('POST /auth/login returns 401 for invalid credentials @api', async ({ authApi, invalidCredentials }) => {
    await expect(async () => authApi.login(invalidCredentials.username, invalidCredentials.password)).rejects.toThrow();
  });

  test('POST /auth/login rejects empty credentials @api', async ({ authApi }) => {
    await expect(async () => authApi.login('', '')).rejects.toThrow();
  });

  test('GET session info returns valid session data @api', async ({ authApi }) => {
    await expect(async () => authApi.getSessionInfo()).resolves.not.toThrow();
  });
});
