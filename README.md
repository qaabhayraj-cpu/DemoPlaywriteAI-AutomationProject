<div align="center">

# 🎭 OrangeHRM Playwright Automation Framework

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue?style=flat-square&logo=github)](https://github.com)
[![Node](https://img.shields.io/badge/Node-20.x-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![Playwright](https://img.shields.io/badge/Playwright-v1.57.0-blue?style=flat-square&logo=playwright)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-orange?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![JMeter](https://img.shields.io/badge/JMeter-5.6.3-red?style=flat-square&logo=apachejmeter)](https://jmeter.apache.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Enterprise-grade end-to-end automation framework** for OrangeHRM using Playwright, TypeScript, and modern testing best practices.

[📖 Documentation](#-documentation) • [🚀 Quick Start](#-quick-start) • [📦 Installation](#-installation) • [🧪 Testing](#-testing-modes) • [📊 Reports](#-reports--analytics)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🧪 Testing](#-testing-modes)
- [⚡ Performance Testing](#-performance-testing)
- [📊 Reports & Analytics](#-reports--analytics)
- [🏗️ Project Structure](#-project-structure)
- [🚀 Running Tests](#-running-tests)
- [🔧 Advanced Usage](#-advanced-usage)
- [🔗 Jira-Integrated QA Workflow](#-jira-integrated-qa-workflow)
- [🐳 Docker](#-docker)
- [📝 Contributing](#-contributing)
- [🆘 Troubleshooting](#-troubleshooting)

---

## ✨ Features

✅ **Page Object Model** — Clean separation of test logic and UI interactions  
✅ **Comprehensive Test Coverage** — Unit, API, visual, and accessibility tests  
✅ **Multi-Environment Support** — Dev, QA, Staging configurations  
✅ **Smart Retry Logic** — Automatic retries for flaky test detection  
✅ **Visual Regression Testing** — Baseline comparisons with Playwright  
✅ **Accessibility Testing** — axe-core integration for WCAG compliance  
✅ **Network Mocking** — Intercept, mock, and simulate network conditions  
✅ **Comprehensive Reporting** — Allure, HTML, JUnit, and Slack notifications  
✅ **CI/CD Ready** — GitHub Actions workflows included  
✅ **TypeScript Strict Mode** — Full type safety for enterprise reliability  
✅ **Data Factory Pattern** — Faker.js for realistic test data  
✅ **API Testing** — Dedicated REST API client with schema validation  
✅ **Performance Testing** — JMeter load tests with PDF + HTML reports and email/Slack notifications  
✅ **Smoke Tests** — Fast critical-path tests mirrored by JMeter performance suite  

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Playwright** | ^1.57.0 | Cross-browser automation |
| **TypeScript** | ^5.6.0 | Type-safe test development |
| **Node.js** | 20.x | JavaScript runtime |
| **Allure** | ^2.15.0 | Rich test reporting |
| **axe-core** | ^4.11.3 | Accessibility testing |
| **Faker.js** | ^8.0.2 | Test data generation |
| **Zod** | ^4.4.3 | Schema validation |
| **Apache JMeter** | 5.6.3 | Performance & load testing |
| **Docker** | Latest | Containerized execution |

---

## 📦 Installation

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** ≥ 20.0.0 ([Download](https://nodejs.org/))
- **npm** ≥ 9.0.0 (comes with Node.js)
- **Java** ≥ 11.0.0 (required for Allure CLI and JMeter) ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Git** (for cloning the repository)
- **Docker** (optional, for containerized testing)

### Step 1: Clone the Repository

```bash
git clone https://github.com/abhayraj/DemoPlaywriteAI-AutomationProject.git
cd DemoPlaywriteAI-AutomationProject
```

### Step 2: Install Dependencies

```bash
# Install project dependencies
npm ci

# Install Playwright browsers
npx playwright install

# Optional: Install Allure CLI globally
npm install -g allure-commandline
```

### Step 3: Verify Installation

```bash
# Verify Node.js version
node --version    # Should be v20.0.0 or higher

# Verify npm version
npm --version     # Should be 9.0.0 or higher

# Verify Playwright installation
npx playwright --version
```

---

## ⚙️ Configuration

### Environment Setup

Create a `.env` file in the project root (or use environment variables):

```bash
# Application Configuration
BASE_URL=https://opensource-demo.orangehrmlive.com
USERNAME=Admin
PASSWORD=admin123

# Browser Configuration
HEADLESS=true
SLOW_MO=0

# Timeout Configuration (milliseconds)
TIMEOUT=30000
EXPECT_TIMEOUT=5000
ACTION_TIMEOUT=5000
NAVIGATION_TIMEOUT=30000

# Test Execution
RETRIES=2
WORKERS=4

# Authentication
AUTH_STATE_PATH=auth.json
CLEANUP_AUTH=false

# Reporting
TEST_ENV=qa
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# CI/CD
CI=false
```

### Environment Files

The framework supports multiple environment configurations:

```
config/environments/
├── dev.env          # Development environment
├── qa.env           # QA environment
└── staging.env      # Staging environment
```

To use a specific environment:

```bash
TEST_ENV=qa npm test
```

---

## 🧪 Testing Modes

### Standard Test Execution

```bash
# Run all tests
npm test

# Run smoke tests only
npm run test:smoke

# Run regression test suite
npm run test:regression

# Run API tests
npm run test:api
```

### Browser-Specific Testing

```bash
# Chromium (Default)
npm run test:chrome

# Firefox
npm run test:firefox

# WebKit (Safari)
npm run test:webkit

# Mobile Chrome & Safari
npm run test:mobile
```

### Specialized Testing

```bash
# Visual regression tests
npm run test:visual

# Accessibility tests (WCAG compliance)
npm run test:a11y

# Network interception tests
npm run test:network

# Update visual baselines
npm run test:update-snapshots
```

### Smoke Tests

```bash
# Run the fast smoke suite (login + dashboard critical path)
npm run test:smoke

# Or directly
npx playwright test tests/smoke/smoke.spec.ts
```

---

### Headed Mode (See Browser)

```bash
# All tests in headed mode
npm run test:headed

# Specific browser in headed mode
npm run test:headed:chrome
npm run test:headed:firefox
npm run test:headed:webkit
```

### Debug Mode (Interactive)

```bash
# Run with Playwright Inspector
npm run test:debug

# Run with slow motion (500ms between actions)
npm run test:slow

# UI Mode (interactive test runner)
npm run test:ui
```

### Shard Testing (Parallel Execution)

```bash
# Run 3 shards on separate machines
npm run test:shard:1    # Shard 1/3
npm run test:shard:2    # Shard 2/3
npm run test:shard:3    # Shard 3/3
```

---

## ⚡ Performance Testing

Performance testing uses **Apache JMeter 5.6.3** to simulate concurrent users against OrangeHRM and automatically generates a professional PDF report plus an interactive HTML dashboard.

### How It Works

```
jmeter/test-plans/login.jmx   ← JMeter test plan (the "what to run")
        │
        ▼
bash jmeter/scripts/run.sh    ← Orchestration script
        │
        ├── Runs JMeter in headless mode (-n flag)
        ├── Writes raw results → jmeter/results/<plan>-summary.jtl
        ├── Generates HTML dashboard → jmeter/reports/<plan>/index.html
        └── Auto-generates PDF report → jmeter/reports/<plan>/<plan>-performance-report.pdf
```

### Prerequisites

- **Java 8+** must be installed (`java -version` to verify)
- **Node.js 20+** for PDF generation
- JMeter is downloaded automatically by the setup script

### Step 1 — Install JMeter (one-time)

```bash
# Downloads Apache JMeter 5.6.3 into jmeter/bin/ (~60 MB)
npm run perf:setup
```

This runs [jmeter/scripts/setup.sh](jmeter/scripts/setup.sh) which:
1. Verifies Java is installed
2. Downloads JMeter 5.6.3 from the Apache CDN
3. Extracts it to `jmeter/bin/apache-jmeter-5.6.3/`

> If JMeter is already installed system-wide, the setup script is skipped and the system binary is used automatically.

### Step 2 — Run a Test Plan

```bash
# Run the login performance test (default: 1 user, 1 loop, 1s ramp-up)
npm run perf:login

# Custom load: 10 concurrent users, 5 loops, 30s ramp-up
bash jmeter/scripts/run.sh login -Jthreads=10 -Jloops=5 -Jramp_up=30
```

#### Available Parameters

| Parameter | Flag | Default | Description |
|---|---|---|---|
| Virtual users | `-Jthreads=N` | `1` | Number of concurrent simulated users |
| Iterations | `-Jloops=N` | `1` | How many times each user repeats the flow |
| Ramp-up | `-Jramp_up=N` | `1` | Seconds to reach full thread count (gradual load) |
| Host | `-JHOST=host` | `opensource-demo.orangehrmlive.com` | Target server hostname |
| Protocol | `-JPROTOCOL=https` | `https` | HTTP or HTTPS |

**Example load profiles:**

```bash
# Smoke — verify single user works
bash jmeter/scripts/run.sh login -Jthreads=1 -Jloops=1

# Baseline — 5 users, 10 iterations
bash jmeter/scripts/run.sh login -Jthreads=5 -Jloops=10 -Jramp_up=10

# Stress — 50 concurrent users, 20 loops, 60s ramp-up
bash jmeter/scripts/run.sh login -Jthreads=50 -Jloops=20 -Jramp_up=60
```

### Step 3 — View Reports

```bash
# Open the interactive HTML dashboard in your browser
npm run perf:report:login

# Regenerate the PDF report from existing results
npm run perf:pdf
```

### Understanding the Results

#### Output Files

| File | Description |
|---|---|
| `jmeter/results/login-summary.jtl` | Raw CSV results — one row per request, contains timestamp, response time, status, bytes, latency, etc. |
| `jmeter/reports/login/index.html` | Interactive HTML dashboard with charts: response times, throughput, error rates, percentiles |
| `jmeter/reports/login/statistics.json` | Machine-readable summary used by CI to post metrics to GitHub Actions job summary |
| `jmeter/reports/login/login-performance-report.pdf` | Professional PDF report for stakeholder sharing — includes all charts and a summary table |

#### Key Metrics Explained

| Metric | What It Means | Target |
|---|---|---|
| **Average Response Time** | Mean time (ms) to get a complete HTTP response | < 2,000 ms |
| **90th Percentile (P90)** | 90% of requests completed within this time — a better real-world measure than average | < 3,000 ms |
| **99th Percentile (P99)** | Worst-case time experienced by 1% of users | < 5,000 ms |
| **Throughput** | Requests per second the server handled | As high as possible |
| **Error Rate** | Percentage of requests that returned HTTP 4xx/5xx | < 1% |
| **Latency** | Time until the first byte arrives from the server | < 500 ms |

#### What the Login Test Plan Does

The [login.jmx](jmeter/test-plans/login.jmx) plan runs the following HTTP requests in sequence, exactly mirroring the smoke test flow:

1. **GET** `/web/index.php/auth/login` — Load the login page
2. **POST** `/web/index.php/auth/validateCredentials` — Submit credentials (Admin / admin123)
3. **GET** `/web/index.php/dashboard/index` — Verify dashboard loads after login
4. **GET** `/web/index.php/auth/logout` — Clean logout

Each virtual user runs this full sequence independently and concurrently.

### CI/CD Integration

The [.github/workflows/performance.yml](.github/workflows/performance.yml) workflow runs performance tests on:

- **Nightly schedule** — every day at 01:00 UTC automatically
- **Manual trigger** — run from the GitHub Actions UI with custom `threads`, `loops`, and `ramp_up` inputs
- **Workflow call** — can be triggered by other workflows (e.g. after smoke tests pass)

```yaml
# Trigger manually from GitHub Actions UI:
# Actions → Performance Tests — JMeter → Run workflow
# Fill in: plan=login, threads=5, loops=3, ramp_up=10
```

After each run, the workflow:
1. Uploads PDF + HTML dashboard + JTL file as downloadable artifacts (retained 30 days)
2. Posts a metrics summary table directly into the GitHub Actions job summary
3. Sends an email report (if `MAIL_*` secrets are configured)
4. Posts a Slack notification (if `SLACK_WEBHOOK_URL` secret is configured)

#### GitHub Actions Secrets for Performance CI

| Secret | Required | Description |
|---|---|---|
| `BASE_URL` | No | Target URL — defaults to the OrangeHRM demo site |
| `USERNAME` | No | Login username — defaults to `Admin` |
| `PASSWORD` | No | Login password — defaults to `admin123` |
| `MAIL_HOST` | Optional | SMTP host for email reports |
| `MAIL_PORT` | Optional | SMTP port (e.g. `587`) |
| `MAIL_USER` | Optional | SMTP username |
| `MAIL_PASS` | Optional | SMTP password |
| `MAIL_TO` | Optional | Recipient email address |
| `SLACK_WEBHOOK_URL` | Optional | Slack incoming webhook URL for notifications |

### Email Report (Local)

```bash
# Set env vars, then send the report email manually
MAIL_HOST=smtp.gmail.com MAIL_PORT=587 \
MAIL_USER=you@gmail.com MAIL_PASS=apppassword \
MAIL_TO=team@company.com \
npm run perf:email
```

### Performance Test File Structure

```
jmeter/
├── bin/                          # JMeter binary (created by setup.sh, git-ignored)
│   └── apache-jmeter-5.6.3/
├── test-plans/
│   └── login.jmx                 # Login flow performance test plan
├── scripts/
│   ├── setup.sh                  # One-time JMeter installer
│   ├── run.sh                    # Test runner + report orchestrator
│   ├── generate-pdf.mjs          # Converts HTML dashboard to PDF via Playwright
│   └── send-report-email.mjs     # Sends PDF report via SMTP
├── results/                      # Raw JTL files (git-ignored)
│   └── login-summary.jtl
└── reports/                      # Generated reports (git-ignored)
    └── login/
        ├── index.html            # Interactive HTML dashboard
        ├── statistics.json       # Machine-readable summary
        └── login-performance-report.pdf
```

---

## 📊 Reports & Analytics

### HTML Report

```bash
# Generate and open Playwright HTML report
npm run report
```

### Allure Report

```bash
# Generate Allure report from test results
npm run report:allure

# Open generated Allure report
npm run report:open

# View JUnit XML results
npm run report:junit
```

### Viewing a Report Downloaded from GitHub Actions

The smoke, regression, and performance workflows all upload the Allure report as
a build artifact (`*-allure-report-*.zip`). **Don't double-click `index.html`
after extracting it** — Allure loads its test data via `fetch()`, which every
browser blocks for the `file://` protocol, so you'll see a "data could not be
loaded" error even though the report itself downloaded fine.

Every artifact now includes a launcher right next to `index.html` — double-click
that instead:

- **Mac / Linux** → `OPEN-REPORT.command`
- **Windows** → `OPEN-REPORT.bat`

It starts a local server and opens the report correctly. See `README.txt`
inside the extracted folder if double-clicking doesn't work (e.g. macOS
Gatekeeper blocking an unsigned script the first time — right-click → Open).

No launcher handy (e.g. an older artifact)? Serve it manually instead:

```bash
# after extracting the zip, from inside that folder:
python3 -m http.server 8080          # then open http://localhost:8080
# — or, if you have Node but not Python —
npx --yes http-server . -p 8080 -o
```

This isn't specific to this project — it's how every Allure report behaves,
including the ones generated locally by `npm run report:allure` (which is why
`npm run report:open` exists — it runs `allure open`, a tiny local server,
instead of opening the file directly).

### Flaky Test Analysis

```bash
# Generate flaky test report
npm run flaky-report
```

### Environment Report

```bash
# Generate environment metadata for Allure
npm run generate-env-report
```

---

## 🏗️ Project Structure

```
DemoPlaywriteAI-AutomationProject/
├── 📁 src/
│   ├── pages/                 # Page Object Model classes
│   │   ├── BasePage.ts       # Abstract base class with utilities
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   └── EmployeePage.ts
│   ├── components/            # Reusable UI components
│   │   ├── NavigationMenu.ts
│   │   └── TopBar.ts
│   ├── fixtures/              # Playwright test fixtures
│   │   └── index.ts
│   ├── api/                   # API testing client
│   │   ├── ApiClient.ts
│   │   └── endpoints/
│   │       ├── AuthApi.ts
│   │       └── EmployeeApi.ts
│   ├── helpers/               # Utility functions
│   │   ├── WaitHelper.ts
│   │   ├── NetworkHelper.ts
│   │   ├── DataFactory.ts
│   │   └── FormHelper.ts
│   ├── constants/             # Constants & timeouts
│   │   ├── Routes.ts
│   │   ├── Timeouts.ts
│   │   └── TestData.ts
│   └── types/                 # TypeScript interfaces
│       └── index.ts
├── 📁 tests/
│   ├── smoke/                 # Smoke tests — critical path, fast
│   │   └── smoke.spec.ts
│   ├── auth/                  # Authentication tests
│   │   └── login.spec.ts
│   ├── dashboard/             # Dashboard tests
│   ├── employee/              # Employee CRUD tests
│   ├── leave/                 # Leave management tests
│   ├── api/                   # API integration tests
│   ├── visual/                # Visual regression tests
│   ├── network/               # Network mocking tests
│   ├── a11y/                  # Accessibility tests
│   └── debug/                 # Debug utilities
├── 📁 config/
│   ├── env.config.ts         # Environment configuration loader
│   └── environments/          # Environment-specific configs
│       ├── dev.env
│       ├── qa.env
│       └── staging.env
├── 📁 test-data/              # Static test data (JSON fixtures)
├── 📁 jmeter/                 # Performance testing (JMeter)
│   ├── test-plans/           # JMX test plans
│   │   └── login.jmx
│   ├── scripts/              # Run, setup, PDF, email scripts
│   │   ├── setup.sh
│   │   ├── run.sh
│   │   ├── generate-pdf.mjs
│   │   └── send-report-email.mjs
│   ├── results/              # Raw JTL output (git-ignored)
│   └── reports/              # HTML + PDF reports (git-ignored)
├── 📁 reporters/              # Custom reporters
│   └── CustomSlackReporter.ts
├── 📁 scripts/                # CI/CD utility scripts
├── 📁 docker/                 # Docker configuration
├── 📁 allure-results/         # Allure report data
├── 📁 playwright-report/      # Playwright HTML report
├── 📁 visual-baselines/       # Visual regression baselines
│
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project dependencies
├── global-setup.ts            # Authentication state setup
├── global-teardown.ts         # Cleanup after tests
├── eslint.config.mjs          # ESLint configuration
└── README.md                  # This file
```

---

## 🚀 Running Tests

### Basic Test Execution

```bash
# Run all tests
npm test

# Run with specific grep pattern
npx playwright test --grep "@smoke"

# Run specific test file
npx playwright test tests/auth/login.spec.ts

# Run specific test
npx playwright test --grep "User can login with valid credentials"
```

### Test Filtering by Tags

Tests are organized using Allure tags:

```bash
# Run smoke tests
npm run test:smoke              # @smoke tag

# Run regression tests
npm run test:regression         # @regression tag

# Run critical tests only
npx playwright test --grep "@critical"

# Run tests by feature
npx playwright test --grep "@employee"
```

### Running Against Different Environments

```bash
# Development
TEST_ENV=dev npm test

# QA
TEST_ENV=qa npm test

# Staging
TEST_ENV=staging npm test
```

---

## 🔧 Advanced Usage

### Custom Test Fixtures

All tests have access to custom fixtures:

```typescript
import { test } from '@fixtures';

test('example test', async ({ loginPage, dashboardPage, employeeData }) => {
  await loginPage.login(employeeData.username, employeeData.password);
  await dashboardPage.verifyPageLoaded();
});
```

Available fixtures:
- `loginPage` — LoginPage instance
- `dashboardPage` — DashboardPage instance
- `employeePage` — EmployeePage instance
- `apiClient` — REST API client
- `employeeData` — Generated employee data
- `authenticatedPage` — Pre-authenticated browser page

### Writing Tests

Example test structure:

```typescript
import { test } from '@fixtures';

test.describe('Employee Management', () => {
  test('should add new employee', async ({ employeePage, employeeData }) => {
    await employeePage.navigate();
    await employeePage.clickAddButton();
    await employeePage.fillEmployeeForm(employeeData);
    await employeePage.submitForm();
    
    const successMessage = await employeePage.getToastMessage();
    expect(successMessage).toContain('Successfully');
  });
});
```

### API Testing

```typescript
import { test } from '@fixtures';

test('should fetch employees via API', async ({ employeeApi }) => {
  const employees = await employeeApi.getAllEmployees();
  expect(employees).toHaveLength(5);
});
```

### Code Quality

```bash
# Run TypeScript type check
npm run typecheck

# Run ESLint
npm run lint

# Fix lint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check
```

---

## 🔗 Jira-Integrated QA Workflow

This framework supports a repeatable **Jira → Playwright → Jira** loop, driven through Claude Code and the Atlassian Remote MCP Server. Give it a ticket key (e.g. `KAN-1`) — or say "continue with KAN-1" — and it processes the ticket end to end without re-explaining the process each time:

1. **Retrieve** the Jira issue — summary, description/acceptance criteria, existing comments. The ticket is the source of truth; nothing about expected behavior is assumed.
2. **Reuse first** — search existing Page Objects and specs (`src/pages/`, `tests/`) for related coverage and extend it before adding anything new.
3. **Design scenarios** directly from the ticket's repro steps / expected result, including the negative and edge cases the AC implies.
4. **Implement** Playwright TypeScript tests named with the ticket ID, e.g. `should show all employees again after clearing search name and searching (KAN-1)`.
5. **Actually execute** the tests (`npx playwright test <spec> --project=<name>`) plus `npm run typecheck` / `npm run lint` on the changed files — a result is never reported without having been run.
6. **Classify any failure** as an *Application Defect*, *Automation Defect*, *Environment Issue*, or *Test Data Issue* before deciding what to do about it (see [Notes on the app under test](#notes-on-the-app-under-test) below — this matters a lot for this particular target app).
7. **Comment back on the ticket** with one structured `QA VALIDATION` block (scope tested, AC-by-AC verdict, execution counts, assessment, recommendation). Existing comments are checked first so results are never posted twice.
8. **File a Jira Bug only** for a reproducible, confirmed application defect — after searching for an existing duplicate first. No defect, no bug.
9. **Transition the ticket** (e.g. → *Done*) when asked, and attach supporting evidence — since the MCP toolset here has no native file-attachment call, screenshots are instead embedded in a small self-contained HTML report and linked from a Jira comment.

### Prerequisites

- The **Atlassian Remote MCP Server** connected in Claude Code, scoped to the Jira site with `read:jira-work` / `write:jira-work`. This is configured at the Claude Code / IDE level — there's nothing to install in this repo, and no Jira credentials are ever stored here.

### Example

```
continue with KAN-1
```

Claude Code looks up `KAN-1`, reuses `EmployeePage` / `tests/employee/*`, extends the relevant spec with a `(KAN-1)`-tagged test, runs it, and posts the QA validation comment — the same flow works unchanged for `KAN-2`, `KAN-3`, etc.

### Notes on the app under test

- `opensource-demo.orangehrmlive.com` is a **shared public demo instance** — its employee record count fluctuates significantly from concurrent global test traffic (observed swinging between roughly 2 and 640 records within minutes in a single session). Treat sudden count changes as environment noise, not a product defect: prefer state-transition assertions (`No Records Found` → results present) over exact record counts when writing tests against this data, and rerun before concluding a genuine regression.
- Manual reproduction against the live app (via the Playwright MCP browser tools) before trusting or writing a test is cheap and catches false positives early — see [`EmployeePage.clearNameFieldAndSearchAgain()`](src/pages/EmployeePage.ts) for an example of a scenario that was hand-verified live before being automated.

---

## 🐳 Docker

### Run Tests in Docker

```bash
# Run full test suite in Docker
npm run test:docker

# Run specific test in Docker
docker compose -f docker/docker-compose.yml run playwright \
  npx playwright test --grep @smoke
```

### Docker Compose Services

```yaml
services:
  playwright:
    build: .
    environment:
      - BASE_URL=https://opensource-demo.orangehrmlive.com
      - HEADLESS=true
    volumes:
      - ./playwright-report:/app/playwright-report
      - ./allure-results:/app/allure-results
```

---

## 📝 Contributing

### Branch Naming Convention

```
feature/TEST-123-feature-description
bugfix/TEST-456-bug-fix-description
hotfix/production-issue-name
```

### Commit Message Convention

```
feat: add employee search functionality
fix: resolve flaky navigation waits
test: add tests for leave management
chore: update dependencies
docs: update README with new examples
```

### Pull Request Process

1. Create a feature branch from `main`
2. Write/update tests for your changes
3. Ensure all tests pass locally
4. Run `npm run lint` and `npm run format`
5. Submit PR with clear description
6. Wait for CI/CD pipeline to pass
7. Request review from team members

### Code Style Guidelines

- Use TypeScript strict mode
- Follow POM (Page Object Model) pattern
- Write descriptive test names
- Add JSDoc comments for public methods
- Use async/await (not callbacks)
- Group related tests with `test.describe()`

---

## 🆘 Troubleshooting

### Common Issues & Solutions

#### Issue: "auth.json not found"

**Solution:** Run the global setup to generate auth state:

```bash
npm test
# OR manually trigger setup:
npx playwright test --project=chromium
```

#### Issue: "Port 3000 already in use" (MCP Server)

**Solution:** Use a different port:

```bash
node node_modules/@playwright/mcp/cli.js --port 3001
```

#### Issue: Visual baseline mismatch

**Solution:** Update visual baselines:

```bash
npm run test:update-snapshots
```

#### Issue: Tests fail on CI but pass locally

**Debugging:**

```bash
# Download the artifact from CI
# Run with trace enabled
npx playwright show-trace trace.zip
```

#### Issue: Accessibility violations detected

**Solution:** Fix the violations in your app or update baseline:

```bash
# View detailed accessibility report
npm run test:a11y
```

#### Issue: Timeout errors on slow connections

**Solution:** Increase timeout in .env:

```env
TIMEOUT=60000
ACTION_TIMEOUT=10000
```

#### Issue: "Cannot find module '@fixtures'"

**Solution:** Rebuild TypeScript paths:

```bash
npm run typecheck
```

#### Issue: "ERROR: JMeter not found. Run: bash jmeter/scripts/setup.sh"

**Solution:** JMeter has not been downloaded yet. Run the one-time setup:

```bash
npm run perf:setup
```

#### Issue: "ERROR: Java is required but not found"

**Solution:** Install Java 8 or higher before running JMeter:

- macOS: `brew install openjdk@17`
- Ubuntu/Debian: `sudo apt-get install -y openjdk-17-jre`
- Verify: `java -version`

#### Issue: JMeter HTML report fails with "Output folder is not empty"

**Solution:** The `run.sh` script clears stale reports automatically. If you see this manually, delete the folder:

```bash
rm -rf jmeter/reports/login
npm run perf:login
```

#### Issue: PDF report not generated

**Solution:** PDF generation requires Node.js and the Playwright Chromium binary:

```bash
npx playwright install chromium
npm run perf:pdf
```

---

## 📞 Support & Resources

### Documentation

- [Playwright Official Docs](https://playwright.dev)
- [Allure Report Documentation](https://docs.qameta.io/allure/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Getting Help

- Check existing [GitHub Issues](https://github.com/issues)
- Review [Troubleshooting](#-troubleshooting) section
- Consult test examples in `tests/` directory
- Review Playwright Inspector with `npm run test:debug`

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using Playwright & TypeScript**

[⬆ back to top](#-orangehrm-playwright-automation-framework)

