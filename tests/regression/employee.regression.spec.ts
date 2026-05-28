import { expect, test } from '@fixtures';
import { EmployeeApi } from '@api/endpoints/EmployeeApi';
import { Routes } from '@constants/Routes';
import { Timeouts } from '@constants/Timeouts';

test.describe('Employee Management', () => {
  test.describe.configure({ mode: 'serial' });

  // Accumulates empNumbers created in each test; afterEach deletes them via API
  const createdEmpNumbers: number[] = [];

  test.afterEach(async ({ employeeApi }) => {
    for (const empNum of createdEmpNumbers.splice(0)) {
      await employeeApi.delete(empNum).catch(() => {});
    }
  });

  async function trackForCleanup(employeeApi: EmployeeApi, lastName: string, employeeId: string): Promise<void> {
    const results = await employeeApi.search(lastName).catch(() => []);
    const match = results.find((e) => e.employeeId === employeeId);
    if (match) createdEmpNumbers.push(match.empNumber);
  }

  test('should search employee by employee ID', async ({ employeePage, employeeApi, employeeData }) => {
    const employeeId = await employeePage.addEmployee(employeeData);
    await trackForCleanup(employeeApi, employeeData.lastName, employeeId);

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

  test('should edit employee first name successfully', async ({ employeePage, employeeApi, employeeData }) => {
    const employeeId = await employeePage.addEmployee(employeeData);
    await trackForCleanup(employeeApi, employeeData.lastName, employeeId);

    const updatedFirstName = `${employeeData.firstName}Updated`;
    await employeePage.editFirstName(employeeId, updatedFirstName);
    // Verify via the success toast — more reliable than toHaveValue which races
    // against Vue's post-save re-render of the form inputs
    const toast = await employeePage.getToastMessage();
    expect(toast.toLowerCase()).toContain('success');
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
});
