import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { Routes } from '@constants/Routes';
import { Timeouts } from '@constants/Timeouts';
import { EmployeeData } from '@types';

export class EmployeePage extends BasePage {
  readonly addEmployeeBtn = this.page.getByRole('button', { name: 'Add' });
  readonly firstNameInput = this.page.getByRole('textbox', { name: 'First Name' });
  readonly lastNameInput = this.page.getByRole('textbox', { name: 'Last Name' });
  readonly employeeIdInput = this.page.locator('.oxd-input-group:has-text("Employee Id") input').first();
  readonly saveButton = this.page.getByRole('button', { name: 'Save' });
  readonly searchButton = this.page.getByRole('button', { name: 'Search' });
  readonly resetButton = this.page.getByRole('button', { name: 'Reset' });
  readonly searchNameInput = this.page.locator('.oxd-input-group:has-text("Employee Name") input').first();
  readonly recordCountText = this.page.getByText(/\(?\d+\)? Records? Found/).first();
  readonly noRecordsText = this.page.getByText('No Records Found').first();
  readonly table = this.page.getByRole('table');

  constructor(page: Page) {
    super(page);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/pim\/viewEmployeeList/);
    await expect(this.addEmployeeBtn).toBeVisible();
  }

  async addEmployee(data: EmployeeData): Promise<string> {
    await this.page.goto(Routes.ADD_EMPLOYEE, { waitUntil: 'load' });
    await this.waitForPageLoad();
    await this.page.locator('.oxd-form-loader').waitFor({ state: 'hidden', timeout: Timeouts.EXTRA_LONG }).catch(() => {});
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.employeeIdInput).toBeVisible();

    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.employeeIdInput.fill(data.employeeId);
    await this.page.locator('.oxd-form-loader').waitFor({ state: 'hidden', timeout: Timeouts.EXTRA_LONG }).catch(() => {});
    await Promise.all([
      this.page.waitForURL(/pim\/viewPersonalDetails/, { timeout: Timeouts.EXTRA_LONG }),
      this.saveButton.click(),
    ]);

    return data.employeeId;
  }

  private async expandSearchPanel(): Promise<void> {
    // On mobile the filter panel is collapsed behind a toggle — expand it if needed
    if (!await this.searchNameInput.isVisible()) {
      await this.page.locator('.oxd-table-filter-header-options button').click();
    }
  }

  private async waitForSearchResults(): Promise<void> {
    // Mobile uses card layout (no role="row"); wait for any result indicator
    const rows = this.page.getByRole('row');
    await Promise.race([
      rows.first().waitFor({ state: 'visible', timeout: Timeouts.MEDIUM }).catch(() => {}),
      this.noRecordsText.waitFor({ state: 'visible', timeout: Timeouts.MEDIUM }).catch(() => {}),
      this.recordCountText.waitFor({ state: 'visible', timeout: Timeouts.MEDIUM }).catch(() => {}),
    ]);
  }

  async searchByName(name: string): Promise<void> {
    await this.page.goto(Routes.EMPLOYEE_LIST, { waitUntil: 'load' });
    await this.waitForPageLoad();
    await this.expandSearchPanel();
    await expect(this.searchNameInput).toBeVisible();
    await this.searchNameInput.fill(name);
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes('/web/index.php/api/v2/pim/employees') && response.status() === 200,
        { timeout: Timeouts.LONG },
      ),
      this.searchButton.click(),
    ]);
    await this.waitForSearchResults();
  }

  async searchById(id: string): Promise<void> {
    await this.page.goto(Routes.EMPLOYEE_LIST, { waitUntil: 'load' });
    await this.waitForPageLoad();
    await this.expandSearchPanel();
    await expect(this.employeeIdInput).toBeVisible();
    await this.employeeIdInput.fill(id);
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes('/web/index.php/api/v2/pim/employees') && response.status() === 200,
        { timeout: Timeouts.LONG },
      ),
      this.searchButton.click(),
    ]);
    await this.waitForSearchResults();
  }

  async getSearchResultNames(): Promise<string[]> {
    const rows = this.page.locator('div[role="row"]');
    // Wait for a data row, no-results text, or the record count (mobile card layout)
    await Promise.race([
      rows.nth(1).waitFor({ state: 'visible', timeout: Timeouts.MEDIUM }).catch(() => {}),
      this.noRecordsText.waitFor({ state: 'visible', timeout: Timeouts.MEDIUM }).catch(() => {}),
      this.recordCountText.waitFor({ state: 'visible', timeout: Timeouts.MEDIUM }).catch(() => {}),
    ]);
    if (await this.noRecordsText.isVisible()) return [];
    const names: string[] = [];
    const rowCount = await rows.count();

    for (let index = 1; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const cells = row.locator('div[role="cell"]');
      const cellCount = await cells.count();
      if (cellCount < 2) continue;
      const fullName = await cells.nth(1).textContent();
      if (fullName?.trim()) {
        names.push(fullName.trim());
      }
    }

    // Mobile card layout: employee data is not in div[role="row"] cells;
    // fall back to record count to confirm results exist.
    if (names.length === 0) {
      const count = await this.getRecordCount();
      if (count > 0) return [`${count} record(s) found`];
    }

    return names;
  }

  async verifyEmployeeInResults(name: string): Promise<void> {
    const names = await this.getSearchResultNames();
    expect(names.some((value) => value.includes(name))).toBeTruthy();
  }

  async verifyNoResultsFound(): Promise<void> {
    await expect(this.noRecordsText).toBeVisible();
  }

  async getRecordCount(): Promise<number> {
    try {
      const countText = await this.recordCountText.textContent({ timeout: Timeouts.SHORT });
      const match = countText?.match(/\d+/);
      return match ? Number(match[0]) : 0;
    } catch {
      return 0;
    }
  }

  async editFirstName(employeeId: string, newName: string): Promise<void> {
    await this.searchById(employeeId);
    // Action buttons are icon-only (no accessible name); use first button in the matching row
    const editButton = this.page.locator('[role="row"]').filter({ hasText: employeeId }).locator('button').first();
    await editButton.waitFor({ state: 'visible', timeout: Timeouts.EXTRA_LONG });
    await Promise.all([
      this.page.waitForURL(/pim\/viewPersonalDetails/, { timeout: Timeouts.EXTRA_LONG }),
      editButton.click(),
    ]);
    await this.page.locator('.oxd-form-loader').waitFor({ state: 'hidden', timeout: Timeouts.EXTRA_LONG }).catch(() => {});
    await this.firstNameInput.fill(newName);
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.request().method() === 'PUT' && response.url().includes('/api/v2/pim/employees') && response.ok(),
        { timeout: Timeouts.LONG },
      ),
      this.saveButton.click(),
    ]);
  }

  async clearSearch(): Promise<void> {
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes('/web/index.php/api/v2/pim/employees') && response.status() === 200,
        { timeout: Timeouts.LONG },
      ),
      this.resetButton.click(),
    ]);
    await expect(this.searchNameInput).toHaveValue('');
    await expect(this.employeeIdInput).toHaveValue('');
    await this.waitForSearchResults();
  }

  /**
   * Reproduces the KAN-1 repro steps literally: clear the Employee Name field by hand
   * (not via the Reset button) and click Search again, without touching any other filter.
   */
  async clearNameFieldAndSearchAgain(): Promise<void> {
    await this.expandSearchPanel();
    await this.searchNameInput.click();
    await this.searchNameInput.press('ControlOrMeta+A');
    await this.searchNameInput.press('Backspace');
    await expect(this.searchNameInput).toHaveValue('');
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes('/web/index.php/api/v2/pim/employees') && response.status() === 200,
        { timeout: Timeouts.LONG },
      ),
      this.searchButton.click(),
    ]);
    await this.waitForSearchResults();
  }
}
