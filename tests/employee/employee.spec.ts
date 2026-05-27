import { expect, test } from '@fixtures';

test.describe('Employee Management', () => {
  test('should search employee by employee ID @regression', async ({ employeePage, employeeData }) => {
    const employeeId = await employeePage.addEmployee(employeeData);
    await employeePage.searchById(employeeId);
    const names = await employeePage.getSearchResultNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test('should show No Records Found for invalid search @regression', async ({ employeePage }) => {
    await employeePage.searchByName('NonexistentEmployee123');
    await employeePage.verifyNoResultsFound();
  });

  test('should display correct table column headers @regression', async ({ employeePage }) => {
    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList', { waitUntil: 'domcontentloaded' });
    await employeePage.waitForPageLoad();
    await employeePage.table.getByRole('columnheader').first().waitFor({ state: 'visible', timeout: 30000 });
    const headerLabels = await employeePage.table.getByRole('columnheader').allTextContents();
    const expected = ['Id', 'First (& Middle) Name', 'Last Name', 'Job Title', 'Employment Status', 'Sub Unit', 'Supervisor', 'Actions'];

    for (const label of expected) {
      expect(headerLabels.join(' ')).toContain(label);
    }
  });

  test('should edit employee first name successfully @regression', async ({ employeePage, employeeData }) => {
    const employeeId = await employeePage.addEmployee(employeeData);
    const updatedFirstName = `${employeeData.firstName}Updated`;
    await employeePage.editFirstName(employeeId, updatedFirstName);
    await employeePage.searchById(employeeId);
    await employeePage.verifyEmployeeInResults(updatedFirstName);
  });

  test('should display record count in results header @regression', async ({ employeePage }) => {
    await employeePage.searchByName('Admin');
    const count = await employeePage.getRecordCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should reset search filters @regression', async ({ employeePage }) => {
    await employeePage.searchByName('Admin');
    await employeePage.clearSearch();
  });
});
