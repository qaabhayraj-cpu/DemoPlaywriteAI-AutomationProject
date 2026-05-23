import { readFile, writeFile } from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { join } from 'path';

interface JunitTestcase {
  '@_name': string;
  failure?: unknown;
}

interface JunitTestsuite {
  testcase: JunitTestcase[];
}

async function loadJUnit(): Promise<JunitTestsuite[]> {
  const xml = await readFile(join(process.cwd(), 'test-results', 'junit.xml'), 'utf8');
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const json = parser.parse(xml) as { testsuites: { testsuite: JunitTestsuite | JunitTestsuite[] } };
  const suites = Array.isArray(json.testsuites.testsuite) ? json.testsuites.testsuite : [json.testsuites.testsuite];
  return suites as JunitTestsuite[];
}

async function run(): Promise<void> {
  const suites = await loadJUnit();
  const results = new Map<string, { passed: number; failed: number }>();

  for (const suite of suites) {
    for (const testcase of suite.testcase) {
      const name = testcase['@_name'];
      const entry = results.get(name) ?? { passed: 0, failed: 0 };
      if (testcase.failure !== undefined && testcase.failure !== null) {
        entry.failed += 1;
      } else {
        entry.passed += 1;
      }
      results.set(name, entry);
    }
  }

  const report = Array.from(results.entries()).map(([name, stats]) => ({
    name,
    passed: stats.passed,
    failed: stats.failed,
    failRate: stats.failed / Math.max(1, stats.passed + stats.failed),
  }));

  const output = JSON.stringify(report, null, 2);
  await writeFile(join(process.cwd(), 'test-results', 'flaky-report.json'), output, 'utf8');
  // eslint-disable-next-line no-console
  console.table(report.map((item) => ({ name: item.name, failRate: item.failRate.toFixed(2), passed: item.passed, failed: item.failed })));
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
