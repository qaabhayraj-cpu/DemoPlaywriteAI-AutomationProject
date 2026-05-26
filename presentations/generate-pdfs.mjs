import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const presentations = [
  { file: 'automation-framework.html',  label: 'Automation Framework' },
  { file: 'performance-testing.html',   label: 'Performance Testing' },
];

console.log('Launching Chromium...');
const browser = await chromium.launch({ headless: true });

for (const { file, label } of presentations) {
  const htmlPath = path.join(__dirname, file);
  const pdfPath  = path.join(__dirname, file.replace('.html', '.pdf'));

  console.log(`\nGenerating PDF: ${label}`);
  const page = await browser.newPage();

  // Set viewport to 16:9 presentation size
  await page.setViewportSize({ width: 1200, height: 700 });

  // ?print-pdf tells Reveal.js to stack all slides for printing
  await page.goto(`file://${htmlPath}?print-pdf`, { waitUntil: 'networkidle', timeout: 30000 });

  // Give Reveal.js time to layout all slides
  await page.waitForTimeout(3000);

  await page.pdf({
    path: pdfPath,
    width:  '1200px',
    height: '700px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  const size = (fs.statSync(pdfPath).size / 1024).toFixed(0);
  console.log(`  Saved: ${path.basename(pdfPath)} (${size} KB)`);
  await page.close();
}

await browser.close();
console.log('\nDone. PDFs are in presentations/');
