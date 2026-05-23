import { APIRequestContext, APIResponse } from '@playwright/test';
import { ZodSchema } from 'zod';
import { ApiResponse } from '@types';

export class ApiClient {
  private request: APIRequestContext;
  private authToken?: string;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken !== undefined && this.authToken !== '') {
      // If the auth token looks like a cookie string (contains '='), send it as Cookie header
      if (this.authToken.includes('=') || this.authToken.includes(';')) {
        headers.Cookie = this.authToken;
      } else {
        headers.Authorization = `Bearer ${this.authToken}`;
      }
    }

    return headers;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? new URLSearchParams(params).toString() : '';
    const url = query ? `${endpoint}?${query}` : endpoint;
    const response = await this.request.get(url, { headers: this.getHeaders() });
    return this.buildResponse<T>(response);
  }

  async post<T>(endpoint: string, body: unknown, extraHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    const payload = typeof body === 'string' || body instanceof Buffer ? body : JSON.stringify(body ?? {});
    const headers = { ...this.getHeaders(), ...(extraHeaders ?? {}) };
    const response = await this.request.post(endpoint, {
      headers,
      data: payload,
    });
    return this.buildResponse<T>(response);
  }

  async put<T>(endpoint: string, body: unknown, extraHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    const payload = typeof body === 'string' || body instanceof Buffer ? body : JSON.stringify(body ?? {});
    const headers = { ...this.getHeaders(), ...(extraHeaders ?? {}) };
    const response = await this.request.put(endpoint, {
      headers,
      data: payload,
    });
    return this.buildResponse<T>(response);
  }

  async delete(endpoint: string): Promise<ApiResponse<void>> {
    const response = await this.request.delete(endpoint, { headers: this.getHeaders() });
    return this.buildResponse<void>(response);
  }

  validateSchema<T>(data: unknown, schema: ZodSchema<T>): T {
    return schema.parse(data);
  }

  async assertStatus(response: APIResponse, expected: number): Promise<void> {
    const status = response.status();
    if (status !== expected) {
      throw new Error(`Expected status ${expected} but got ${status}`);
    }
  }

  private async buildResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    const responseText = await response.text();
    let body: unknown;

    if (responseText === '') {
      body = undefined;
    } else {
      try {
        body = JSON.parse(responseText);
      } catch {
        body = responseText;
      }
    }

    if (!response.ok()) {
      throw new Error(`API request failed with status ${response.status()}: ${JSON.stringify(body)}`);
    }

    const headers = response.headers();
    return {
      data: body as T,
      status: response.status(),
      headers,
    };
  }
}
