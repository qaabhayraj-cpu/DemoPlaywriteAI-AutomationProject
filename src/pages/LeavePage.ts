import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { Routes } from '@constants/Routes';
import { Timeouts } from '@constants/Timeouts';
import { LeaveData, LeaveRecord } from '@types';

export class LeavePage extends BasePage {
  readonly applyTab = this.page.getByRole('link', { name: 'Apply' });
  readonly myLeaveTab = this.page.getByRole('link', { name: 'My Leave' });
  readonly entitlementTab = this.page.getByRole('link', { name: 'My Entitlements' });
  readonly leaveTypeSelect = this.page.locator('.oxd-select-text').first();
  readonly fromDateInput = this.page.getByPlaceholder('From Date');
  readonly toDateInput = this.page.getByPlaceholder('To Date');
  readonly reasonInput = this.page.getByRole('textbox', { name: 'Comments' });
  readonly submitButton = this.page.getByRole('button', { name: 'Apply' });
  readonly successToast = this.page.getByRole('status');

  constructor(page: Page) {
    super(page);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/leave\/viewLeaveList/);
    await expect(this.applyTab).toBeVisible();
  }

  async navigateToApply(): Promise<void> {
    await this.page.goto(Routes.LEAVE_APPLY, { waitUntil: 'load' });
    await this.page.locator('.oxd-form-loader').waitFor({ state: 'hidden', timeout: Timeouts.EXTRA_LONG }).catch(() => {});
    // Page is ready when either the leave type select (normal) or the no-balance notice appears.
    // Use Promise.race so either condition resolves the wait regardless of element type.
    await Promise.race([
      this.leaveTypeSelect.waitFor({ state: 'visible', timeout: Timeouts.EXTRA_LONG }).catch(() => null),
      this.page.getByText('No Leave Types with Leave Balance').waitFor({ state: 'visible', timeout: Timeouts.EXTRA_LONG }).catch(() => null),
    ]);
  }

  async applyForLeave(data: LeaveData): Promise<void> {
    await this.navigateToApply();
    await this.leaveTypeSelect.click();
    await this.page.getByRole('option', { name: data.leaveType }).click();
    await this.fromDateInput.fill(data.fromDate);
    await this.toDateInput.fill(data.toDate);
    await this.reasonInput.fill(data.reason);
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.request().method() === 'POST' && response.ok(),
        { timeout: Timeouts.LONG },
      ),
      this.submitButton.click(),
    ]);
    await this.waitForPageLoad();
  }

  async getLeaveBalance(leaveType: string): Promise<number> {
    const row = this.page.locator('[role="row"]').filter({ hasText: leaveType }).first();
    if (!(await row.isVisible())) return 0;
    const lastCell = row.locator('[role="cell"]').last();
    const balanceText = (await lastCell.textContent()) ?? '0';
    const match = balanceText.match(/[\d.]+/);
    return match ? Number(match[0]) : 0;
  }

  async getLeaveList(): Promise<LeaveRecord[]> {
    await this.myLeaveTab.click();
    await this.waitForPageLoad();
    const rows = this.page.getByRole('row');
    const records: LeaveRecord[] = [];
    const rowCount = await rows.count();

    for (let index = 1; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const columns = row.getByRole('cell');
      const cells = await columns.allInnerTexts();
      records.push({
        type: cells[1]?.trim() ?? '',
        fromDate: cells[2]?.trim() ?? '',
        toDate: cells[3]?.trim() ?? '',
        days: Number(cells[4]?.trim() || '0'),
        status: (cells[5]?.trim() as LeaveRecord['status']) ?? 'Pending Approval',
      });
    }

    return records;
  }

  async verifyLeaveStatus(leaveType: string, status: string): Promise<void> {
    const records = await this.getLeaveList();
    const match = records.some((record) => record.type === leaveType && record.status.includes(status));
    expect(match).toBeTruthy();
  }

  async verifyLeaveSubmitted(): Promise<void> {
    const toast = await this.getToastMessage();
    expect(toast.toLowerCase()).toContain('success');
  }
}
