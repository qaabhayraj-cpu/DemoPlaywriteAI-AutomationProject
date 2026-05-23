import { writeFile } from 'fs/promises';
import { envConfig } from '../config/env.config';

async function run(): Promise<void> {
  const lines = [
    `BASE_URL=${envConfig.baseUrl}`,
    `ENV=${process.env.TEST_ENV ?? 'qa'}`,
    `NODE_VERSION=${process.version}`,
    `PLAYWRIGHT_VERSION=${process.env.PLAYWRIGHT_VERSION ?? ''}`,
    `OS=${process.platform}`,
    `CI=${process.env.CI ?? 'false'}`,
    `TIMESTAMP=${new Date().toISOString()}`,
  ];

  await writeFile('allure-results/environment.properties', lines.join('\n'), 'utf8');
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
