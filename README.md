<div align="center">

# 🎭 OrangeHRM Playwright Automation Framework

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue?style=flat-square&logo=github)](https://github.com)
[![Node](https://img.shields.io/badge/Node-20.x-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![Playwright](https://img.shields.io/badge/Playwright-v1.57.0-blue?style=flat-square&logo=playwright)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-orange?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
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
- [📊 Reports & Analytics](#-reports--analytics)
- [🏗️ Project Structure](#-project-structure)
- [🚀 Running Tests](#-running-tests)
- [🔧 Advanced Usage](#-advanced-usage)
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
| **Docker** | Latest | Containerized execution |

---

## 📦 Installation

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** ≥ 20.0.0 ([Download](https://nodejs.org/))
- **npm** ≥ 9.0.0 (comes with Node.js)
- **Java** ≥ 11.0.0 (required for Allure CLI) ([Download](https://www.oracle.com/java/technologies/downloads/))
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

