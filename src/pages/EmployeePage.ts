import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { Routes } from '@constants/Routes';
import { Timeouts } from '@constants/Timeouts';
import { WaitHelper } from '@helpers/WaitHelper';
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
  readonly recordCountText = this.page.getByText(/Record\(s\) Found|Records Found/);
  readonly noRecordsText = this.page.getByText('No Records Found');
  readonly table = this.page.getByRole('table');

  constructor(page: Page) {
    super(page);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/pim\/viewEmployeeList/);
    await expect(this.addEmployeeBtn).toBeVisible();
  }

  async addEmployee(data: EmployeeData): Promise<string> {
    await this.page.goto(Routes.ADD_EMPLOYEE, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.employeeIdInput).toBeVisible();

    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.employeeIdInput.fill(data.employeeId);
    await Promise.all([
      this.page.waitForURL(/pim\/viewPersonalDetails/, { timeout: Timeouts.EXTRA_LONG }),
      this.saveButton.click(),
    ]);

    return data.employeeId;
  }

  async searchByName(name: string): Promise<void> {
    await this.page.goto(Routes.EMPLOYEE_LIST, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
    await expect(this.searchNameInput).toBeVisible();
    await this.searchNameInput.fill(name);
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes('/web/index.php/api/v2/pim/employees') && response.status() === 200,
        { timeout: Timeouts.LONG },
      ),
      this.searchButton.click(),
    ]);
    await WaitHelper.waitForTableRows(this.page);
  }

  async searchById(id: string): Promise<void> {
    await this.page.goto(Routes.EMPLOYEE_LIST, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
    await expect(this.employeeIdInput).toBeVisible();
    await this.employeeIdInput.fill(id);
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes('/web/index.php/api/v2/pim/employees') && response.status() === 200,
        { timeout: Timeouts.LONG },
      ),
      this.searchButton.click(),
    ]);
    await WaitHelper.waitForTableRows(this.page);
  }

  async getSearchResultNames(): Promise<string[]> {
    const rows = this.page.locator('div[role="row"]');
    await rows.nth(1).waitFor({ state: 'visible', timeout: Timeouts.EXTRA_LONG });
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
    const countText = await this.recordCountText.textContent();
    const match = countText?.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  async editFirstName(employeeId: string, newName: string): Promise<void> {
    await this.searchById(employeeId);
    const editButton = this.page.getByRole('button', { name: 'Edit' }).first();
    await editButton.click();
    await this.firstNameInput.fill(newName);
    await Promise.all([this.page.waitForLoadState('networkidle'), this.saveButton.click()]);
  }

  async clearSearch(): Promise<void> {
    await this.resetButton.click();
    await expect(this.searchNameInput).toHaveValue('');
    await expect(this.employeeIdInput).toHaveValue('');
  }
}
