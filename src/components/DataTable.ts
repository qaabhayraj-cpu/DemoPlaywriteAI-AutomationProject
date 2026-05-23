import { type Locator, type Page } from '@playwright/test';

export class DataTable {
  constructor(private page: Page, private tableLocator: Locator) {}

  async getRowCount(): Promise<number> {
    return this.tableLocator.getByRole('row').count();
  }

  async getCell(rowIndex: number, columnName: string): Promise<string> {
    const headerCells = this.tableLocator.getByRole('columnheader');
    const headers = await headerCells.allTextContents();
    const columnIndex = headers.findIndex((header) => header.trim().includes(columnName));

    if (columnIndex < 0) {
      return '';
    }

    const row = this.tableLocator.getByRole('row').nth(rowIndex);
    const cell = row.getByRole('cell').nth(columnIndex);
    return (await cell.textContent())?.trim() ?? '';
  }

  async getColumnValues(columnName: string): Promise<string[]> {
    const headerCells = this.tableLocator.getByRole('columnheader');
    const headers = await headerCells.allTextContents();
    const columnIndex = headers.findIndex((header) => header.trim().includes(columnName));
    const values: string[] = [];

    if (columnIndex < 0) {
      return values;
    }

    const rows = this.tableLocator.getByRole('row');
    const count = await rows.count();

    for (let index = 1; index < count; index += 1) {
      const cell = rows.nth(index).getByRole('cell').nth(columnIndex);
      values.push((await cell.textContent())?.trim() ?? '');
    }

    return values;
  }

  async clickRowAction(rowIndex: number, actionName: string): Promise<void> {
    const row = this.tableLocator.getByRole('row').nth(rowIndex);
    await row.getByRole('button', { name: actionName }).click();
  }

  async sortByColumn(columnName: string): Promise<void> {
    await this.tableLocator.getByRole('columnheader', { name: columnName }).click();
  }

  async waitForLoad(): Promise<void> {
    await this.tableLocator.getByRole('row').first().waitFor({ state: 'visible' });
  }

  async isEmpty(): Promise<boolean> {
    return (await this.tableLocator.getByRole('row').count()) <= 1;
  }

  async getHeaderLabels(): Promise<string[]> {
    return this.tableLocator.getByRole('columnheader').allTextContents();
  }
}
