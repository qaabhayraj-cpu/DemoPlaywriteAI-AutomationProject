import { expect, test } from '@fixtures';
import { Routes } from '@constants/Routes';
import { Timeouts } from '@constants/Timeouts';

test.describe('Employee Management', () => {
  test('should search employee by employee ID', async ({ employeePage, employeeData }) => {
    const employeeId = await employeePage.addEmployee(employeeData);
    await employeePage.searchById(employeeId);
    const names = await employeePage.getSearchResultNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test('should show No Records Found for invalid search', async ({ employeePage }) => {
    await employeePage.searchByName('NonexistentEmployee123');
    await employeePage.verifyNoResultsFound();
  });

  test('should display correct table column headers', async ({ employeePage }) => {
    await employeePage.page.goto(Routes.EMPLOYEE_LIST, { waitUntil: 'load' });
    await employeePage.waitForPageLoad();
    await employeePage.table.getByRole('columnheader').first().waitFor({ state: 'visible', timeout: Timeouts.EXTRA_LONG });
    const headerLabels = await employeePage.table.getByRole('columnheader').allTextContents();
    const expected = ['Id', 'First (& Middle) Name', 'Last Name', 'Job Title', 'Employment Status', 'Sub Unit', 'Supervisor', 'Actions'];

    for (const label of expected) {
      expect(headerLabels.join(' ')).toContain(label);
    }
  });

  test('should edit employee first name successfully', async ({ employeePage, employeeData }) => {
    const employeeId = await employeePage.addEmployee(employeeData);
    const updatedFirstName = `${employeeData.firstName}Updated`;
    await employeePage.editFirstName(employeeId, updatedFirstName);
    await employeePage.searchById(employeeId);
    await employeePage.verifyEmployeeInResults(updatedFirstName);
  });

  test('should display record count in results header', async ({ employeePage }) => {
    await employeePage.searchByName('Admin');
    const count = await employeePage.getRecordCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should reset search filters', async ({ employeePage }) => {
    await employeePage.searchByName('Admin');
    await employeePage.clearSearch();
  });

  // KAN-1: search results must not remain stuck on the previous filter once the
  // search criteria is cleared and Search is clicked again.
  test('should show all employees again after clearing search name and searching (KAN-1)', async ({ employeePage }) => {
    await employeePage.searchByName('NonexistentEmployee123');
    await employeePage.verifyNoResultsFound();

    await employeePage.clearNameFieldAndSearchAgain();

    await expect(employeePage.noRecordsText).not.toBeVisible();
    const count = await employeePage.getRecordCount();
    expect(count).toBeGreaterThan(0);
  });
});
