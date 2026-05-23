# OrangeHRM Playwright Automation Framework

> Enterprise-grade Playwright framework for OrangeHRM demo automation.

## Badges

- ![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)
- ![Node](https://img.shields.io/badge/Node-20.x-green)
- ![Playwright](https://img.shields.io/badge/Playwright-v1.57.0-blue)
- ![TypeScript](https://img.shields.io/badge/TypeScript-strict-orange)
- ![License](https://img.shields.io/badge/License-MIT-green)

## Overview

This repository contains a full Playwright TypeScript automation framework for:

- URL: `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login`
- Username: `Admin`
- Password: `admin123`

Tech stack:

- Playwright
- TypeScript
- Allure reporting
- GitHub Actions
- Docker
- `axe-core`
- Faker.js
- Zod

## Prerequisites

- Node.js 20+
- npm
- Java 11+ for Allure CLI
- Docker (optional)

## Quick Start

```bash
git clone <repo-url>
cd orangehrm-playwright
cp .env.example .env
npm ci
npx playwright install
npm run test:smoke
```

## Scripts

| Script | Description |
|---|---|
| `npm test` | Run the full Playwright suite |
| `npm run test:smoke` | Run smoke tests |
| `npm run test:regression` | Run regression tests |
| `npm run test:api` | Run API tests |
| `npm run test:visual` | Run visual tests |
| `npm run test:a11y` | Run accessibility tests |
| `npm run test:network` | Run network interception tests |
| `npm run test:chrome` | Run Chromium project |
| `npm run test:firefox` | Run Firefox project |
| `npm run test:webkit` | Run WebKit project |
| `npm run test:mobile` | Run mobile projects |
| `npm run test:headed` | Run tests in headed mode |
| `npm run test:headless` | Run tests in headless mode |
| `npm run test:debug` | Run tests with Playwright inspector |
| `npm run test:slow` | Run tests with slow motion |
| `npm run test:env:dev` | Run tests against dev env |
| `npm run test:env:qa` | Run tests against qa env |
| `npm run test:env:staging` | Run tests against staging env |
| `npm run test:update-snapshots` | Update visual baseline snapshots |
| `npm run report` | Open Playwright HTML report |
| `npm run report:allure` | Generate Allure report |
| `npm run report:open` | Open Allure report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix lint issues |
| `npm run format` | Format files with Prettier |
| `npm run typecheck` | Run TypeScript type check |
| `npm run flaky-report` | Generate flaky test report |
| `npm run generate-env-report` | Generate Allure environment metadata |

## Running Modes

### Headed

```bash
npm run test:headed
npm run test:headed:chrome
```

### Headless

```bash
npm run test:headless
```

### Debug mode

```bash
npm run test:debug
```

### Slow motion

```bash
npm run test:slow
```

### Multi-environment

```bash
npm run test:env:qa
npm run test:env:staging
```

## Reports

### Playwright HTML report

```bash
npm run report
```

### Allure report

```bash
npm run report:allure
npm run report:open
```

## Docker

```bash
npm run test:docker
```

To run a specific command in Docker:

```bash
docker compose -f docker/docker-compose.yml run playwright npx playwright test --grep @smoke
```

## Folder Structure

- `.github/workflows/` — CI pipelines
- `config/environments/` — environment variable files
- `config/env.config.ts` — environment config loader
- `src/pages/` — page objects
- `src/components/` — reusable UI components
- `src/helpers/` — helper utilities
- `src/api/` — API client, endpoints, schemas
- `src/fixtures/` — Playwright fixtures and test data
- `tests/` — test suites by domain
- `test-data/` — static test data JSON
- `reporters/` — custom reporter implementations
- `scripts/` — CI/reporting utilities
- `docker/` — Docker build and compose files

## CI/CD

The framework includes three GitHub workflows:

- `playwright.yml` — main CI for push, PR, and manual runs
- `visual-regression.yml` — manual baseline update workflow
- `nightly.yml` — scheduled nightly regression

## Environment Variables

| Variable | Description |
|---|---|
| `BASE_URL` | Base application URL |
| `USERNAME` | Login user name |
| `PASSWORD` | Login password |
| `HEADLESS` | Run browsers headless |
| `SLOW_MO` | Playwright slow motion delay |
| `TIMEOUT` | Page timeout in ms |
| `EXPECT_TIMEOUT` | Playwright expect timeout in ms |
| `ACTION_TIMEOUT` | Default timeout for page actions |
| `NAVIGATION_TIMEOUT` | Default navigation timeout in ms |
| `RETRIES` | Test retry count |
| `WORKERS` | Parallel worker count |
| `AUTH_STATE_PATH` | Authentication storage state file path |
| `CLEANUP_AUTH` | Remove auth state file after the run |
| `CI` | CI environment flag |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |
| `TEST_ENV` | Environment label (dev/qa/staging) |

## Contributing

- Use branch names like `feature/TEST-123-description`
- Follow commit conventions: `feat:`, `fix:`, `test:`, `chore:`
- Run `npm run lint` and `npm run format` before committing
- Ensure tests pass locally before opening a PR

## Troubleshooting

- `auth.json not found` → run `npm test` once to regenerate auth state
- Visual baseline mismatch → run `npm run test:update-snapshots`
- CI failures due to environment variables → verify GitHub Secrets are configured
- Test stability issues → inspect `playwright-report` and `allure-results`
