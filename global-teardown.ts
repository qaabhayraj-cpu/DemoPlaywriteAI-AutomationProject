import { unlink } from 'fs/promises';
import { envConfig } from './config/env.config';

async function globalTeardown(): Promise<void> {
  const filePath = envConfig.authStatePath;

  if (!envConfig.cleanupAuth) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️ Global teardown skipped cleanup for ${filePath}`);
    return;
  }

  try {
    await unlink(filePath);
    // eslint-disable-next-line no-console
    console.log('✅ Global teardown complete');
  } catch {
    // eslint-disable-next-line no-console
    console.warn(`⚠️ Global teardown skipped because auth state was not present at ${filePath}`);
  }
}

export default globalTeardown;
