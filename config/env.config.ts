import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

export interface EnvConfig {
  baseUrl: string;
  username: string;
  password: string;
  headless: boolean;
  slowMo: number;
  timeout: number;
  expectTimeout: number;
  actionTimeout: number;
  navigationTimeout: number;
  retries: number;
  workers: number;
  authStatePath: string;
  cleanupAuth: boolean;
}

const env = process.env.TEST_ENV?.trim();
const resolvedEnv = env === undefined || env === '' ? 'qa' : env.toLowerCase();
const envFile = path.resolve(process.cwd(), 'config', 'environments', `${resolvedEnv}.env`);

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const EnvVariables = z.object({
  BASE_URL: z.string().url().default('https://opensource-demo.orangehrmlive.com'),
  USERNAME: z.string().default('Admin'),
  PASSWORD: z.string().default('admin123'),
  HEADLESS: z.string().optional(),
  SLOW_MO: z.string().optional(),
  TIMEOUT: z.string().optional(),
  EXPECT_TIMEOUT: z.string().optional(),
  ACTION_TIMEOUT: z.string().optional(),
  NAVIGATION_TIMEOUT: z.string().optional(),
  RETRIES: z.string().optional(),
  WORKERS: z.string().optional(),
  AUTH_STATE_PATH: z.string().default('auth.json'),
  CLEANUP_AUTH: z.string().optional(),
});

const parsedEnv = EnvVariables.parse(process.env);

function getBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  return ['true', '1', 'yes'].includes(value.toLowerCase().trim());
}

function getNumber(value: string | undefined, fallback: number): number {
  if (typeof value === 'undefined' || value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const authStatePath = path.resolve(process.cwd(), parsedEnv.AUTH_STATE_PATH);

export const envConfig: EnvConfig = {
  baseUrl: parsedEnv.BASE_URL,
  username: parsedEnv.USERNAME,
  password: parsedEnv.PASSWORD,
  headless: getBoolean(parsedEnv.HEADLESS, true),
  slowMo: getNumber(parsedEnv.SLOW_MO, 0),
  timeout: getNumber(parsedEnv.TIMEOUT, 30000),
  expectTimeout: getNumber(parsedEnv.EXPECT_TIMEOUT, 5000),
  actionTimeout: getNumber(parsedEnv.ACTION_TIMEOUT, 10000),
  navigationTimeout: getNumber(parsedEnv.NAVIGATION_TIMEOUT, 15000),
  retries: getNumber(parsedEnv.RETRIES, 2),
  workers: getNumber(parsedEnv.WORKERS, 4),
  authStatePath,
  cleanupAuth: getBoolean(parsedEnv.CLEANUP_AUTH, true),
};
