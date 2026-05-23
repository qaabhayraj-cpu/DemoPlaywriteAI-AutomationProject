import { expect, test } from '@fixtures';

type AllureInterface = {
  feature: (name: string) => void;
  story: (name: string) => void;
  severity: (name: string) => void;
  owner: (name: string) => void;
  description: (text: string) => void;
  tag: (name: string) => void;
};

const { allure } = globalThis as unknown as { allure: AllureInterface };

test.describe('Employee Management', () => {
  test('should add a new employee successfully @smoke @critical', async ({ employeePage, employeeData }) => {
    allure.feature('Employee Management');
    allure.story('Add Employee');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify that a new employee can be created successfully using the employee page');
    allure.tag('smoke');

    const employeeId = await employeePage.addEmployee(employeeData);
    expect(employeeId).not.toHaveLength(0);
  });

  test('should search employee by first name @smoke', async ({ employeePage, adminUser }) => {
    allure.feature('Employee Management');
    allure.story('Search Employees');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify searching for an employee by first name returns matching results');
    allure.tag('smoke');

    await employeePage.searchByName('Admin');
    await employeePage.verifyEmployeeInResults('Admin');
  });

  test('should search employee by employee ID @regression', async ({ employeePage }) => {
    allure.feature('Employee Management');
    allure.story('Search Employees');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify searching by employee ID returns the correct result');
    allure.tag('regression');

    await employeePage.searchById('0011');
    const names = await employeePage.getSearchResultNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test('should show No Records Found for invalid search @regression', async ({ employeePage }) => {
    allure.feature('Employee Management');
    allure.story('Search Employees');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify the system displays no records when searching for a nonexistent employee');
    allure.tag('regression');

    await employeePage.searchByName('NonexistentEmployee123');
    await employeePage.verifyNoResultsFound();
  });

  test('should display correct table column headers @regression', async ({ employeePage }) => {
    allure.feature('Employee Management');
    allure.story('Employee Table');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify employee list page table headers match expected columns');
    allure.tag('regression');

    await employeePage.page.goto('/web/index.php/pim/viewEmployeeList');
    const headerLabels = await employeePage.table.getByRole('columnheader').allTextContents();
    const expected = ['Id', 'First (& Middle) Name', 'Last Name', 'Job Title', 'Employment Status', 'Sub Unit', 'Action'];

    for (const label of expected) {
      expect(headerLabels.join(' ')).toContain(label);
    }
  });

  test('should edit employee first name successfully @regression', async ({ employeePage, employeeData }) => {
    allure.feature('Employee Management');
    allure.story('Edit Employee');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify employee first name can be updated and reflected in results');
    allure.tag('regression');

    const employeeId = await employeePage.addEmployee(employeeData);
    const updatedFirstName = `${employeeData.firstName}Updated`;
    await employeePage.editFirstName(employeeId, updatedFirstName);
    await employeePage.searchById(employeeId);
    await employeePage.verifyEmployeeInResults(updatedFirstName);
  });

  test('should display record count in results header @regression', async ({ employeePage }) => {
    allure.feature('Employee Management');
    allure.story('Search Employees');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify the record count for employee search results is displayed correctly');
    allure.tag('regression');

    await employeePage.searchByName('Admin');
    const count = await employeePage.getRecordCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should reset search filters @regression', async ({ employeePage }) => {
    allure.feature('Employee Management');
    allure.story('Search Employees');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify the search reset button clears the employee filters');
    allure.tag('regression');

    await employeePage.searchByName('Admin');
    await employeePage.clearSearch();
  });
});
