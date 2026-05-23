import { ApiClient } from '@api/ApiClient';
import { LoginResponseSchema } from '@api/schemas/AuthSchema';

export class AuthApi {
  constructor(private client: ApiClient) {}

  async login(username: string, password: string): Promise<{ token: string }> {
    // The public site exposes a UI validate endpoint for session login.
    // Use form-encoded POST to authenticate and capture the session cookie as a token.
    const form = new URLSearchParams({ username, password }).toString();
    const response = await this.client.post<Record<string, unknown>>('/web/index.php/auth/validate', form, {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    if (response.status === 200 || response.status === 302) {
      const setCookie = response.headers['set-cookie'] ?? response.headers['Set-Cookie'];
      const token = Array.isArray(setCookie) ? setCookie[0] : (setCookie ?? '');
      this.client.setAuthToken(token as string);
      return { token: token as string };
    }

    throw new Error(`Login failed with status ${response.status}`);
  }

  async logout(): Promise<void> {
    await this.client.post<void>('/web/index.php/api/v1/auth/logout', {});
  }

  async getSessionInfo(): Promise<unknown> {
    const response = await this.client.get<unknown>('/web/index.php/api/v1/auth/session');
    return response.data;
  }
}
