import { expect, type Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { Routes } from '@constants/Routes';
import { EmployeeData } from '@types';

export class EmployeePage extends BasePage {
  readonly addEmployeeBtn = this.page.getByRole('button', { name: 'Add' });
  readonly firstNameInput = this.page.getByRole('textbox', { name: 'First Name' });
  readonly lastNameInput = this.page.getByRole('textbox', { name: 'Last Name' });
  readonly employeeIdInput = this.page.getByRole('textbox', { name: 'Employee Id' });
  readonly saveButton = this.page.getByRole('button', { name: 'Save' });
  readonly searchButton = this.page.getByRole('button', { name: 'Search' });
  readonly resetButton = this.page.getByRole('button', { name: 'Reset' });
  readonly searchNameInput = this.page.getByRole('textbox', { name: 'Employee Name' });
  readonly recordCountText = this.page.getByText(/Record\(s\) Found/);
  readonly noRecordsText = this.page.getByText('No Records Found');
  readonly table = this.page.getByRole('table');

  constructor(page: Page) {
    super(page);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(`**${Routes.EMPLOYEE_LIST}`);
    await expect(this.addEmployeeBtn).toBeVisible();
    await expect(this.searchButton).toBeVisible();
  }

  async addEmployee(data: EmployeeData): Promise<string> {
    await this.page.goto(Routes.ADD_EMPLOYEE, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
    await expect(this.firstNameInput).toBeVisible();

    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.employeeIdInput.fill(data.employeeId);
    await this.saveButton.click();
    await this.waitForResponse(/saveEmployee/);

    const idValue = await this.employeeIdInput.inputValue();
    await expect(idValue.length > 0).toBeTruthy();
    return idValue;
  }

  async searchByName(name: string): Promise<void> {
    await this.page.goto(Routes.EMPLOYEE_LIST, { waitUntil: 'domcontentloaded' });
    await this.searchNameInput.fill(name);
    // Fixed: Replaced flaky 'networkidle' with 'load' state for better stability
    await Promise.all([this.page.waitForLoadState('load'), this.searchButton.click()]);
  }

  async searchById(id: string): Promise<void> {
    await this.page.goto(Routes.EMPLOYEE_LIST, { waitUntil: 'domcontentloaded' });
    await this.employeeIdInput.fill(id);
    // Fixed: Replaced flaky 'networkidle' with 'load' state for better stability
    await Promise.all([this.page.waitForLoadState('load'), this.searchButton.click()]);
  }

  async getSearchResultNames(): Promise<string[]> {
    const rows = this.table.getByRole('row');
    const names: string[] = [];
    const rowCount = await rows.count();

    for (let index = 1; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const fullName = await row.getByRole('cell').nth(1).innerText();
      names.push(fullName.trim());
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
