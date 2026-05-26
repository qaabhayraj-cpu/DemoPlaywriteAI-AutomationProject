import { chromium } from '@playwright/test';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: 'https://opensource-demo.orangehrmlive.com' });
  const page = await context.newPage();
  await page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
  const images = await page.locator('img').allInnerTexts();
  console.log('img count', await page.locator('img').count());
  const imgs = await page.locator('img').evaluateAll((els) => els.map((el)=>({ alt: el.getAttribute('alt'), src: el.getAttribute('src'), role: el.getAttribute('role')})));
  console.log(JSON.stringify(imgs, null, 2));
  const headings = await page.locator('h1,h2,h3,h4,h5,h6').allInnerTexts();
  console.log('headings', headings);
  await browser.close();
})();
