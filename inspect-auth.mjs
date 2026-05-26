import { request } from '@playwright/test';
(async () => {
  const api = await request.newContext({ baseURL: 'https://opensource-demo.orangehrmlive.com', extraHTTPHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  const body = new URLSearchParams({ username: 'Admin', password: 'admin123' }).toString();
  const res = await api.post('/web/index.php/auth/validate', { data: body, maxRedirects: 0 });
  console.log('status', res.status());
  console.log('headers', res.headers());
  console.log('bodyRaw', await res.text());
  await api.dispose();
})();
