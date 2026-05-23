import type { Reporter, FullConfig, Suite, TestCase, TestResult } from '@playwright/test/reporter';

export default class CustomSlackReporter implements Reporter {
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private failures: string[] = [];
  private startTime = new Date();

  onBegin(_config: FullConfig, _suite: Suite): void {
    this.startTime = new Date();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'passed') {
      this.passed += 1;
    }

    if (result.status === 'failed') {
      this.failed += 1;
      this.failures.push(`${test.title} - ${result.status}`);
    }

    if (result.status === 'skipped') {
      this.skipped += 1;
    }
  }

  async onEnd(): Promise<void> {
    const duration = ((Date.now() - this.startTime.getTime()) / 1000).toFixed(1);
    const status = this.failed > 0 ? '❌ FAILED' : '✅ PASSED';
    const message: Record<string, unknown> = {
      text: `${status} | ${this.passed} passed | ${this.failed} failed | ${this.skipped} skipped | ${duration}s`,
    };

    if (this.failures.length > 0) {
      message.attachments = [{ text: this.failures.join('\n'), color: 'danger' }];
    }

    if (process.env.SLACK_WEBHOOK_URL !== undefined && process.env.SLACK_WEBHOOK_URL !== '') {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
