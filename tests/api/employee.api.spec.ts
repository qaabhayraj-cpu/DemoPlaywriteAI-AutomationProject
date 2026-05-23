import { expect, test } from '@fixtures';
import { DataFactory } from '@helpers/DataFactory';

type AllureInterface = {
  feature: (name: string) => void;
  story: (name: string) => void;
  severity: (name: string) => void;
  owner: (name: string) => void;
  description: (text: string) => void;
  tag: (name: string) => void;
};

const { allure } = globalThis as unknown as { allure: AllureInterface };

test.describe('Employee API', () => {
  test('GET /api/v2/pim/employees returns employee array @api @smoke', async ({ employeeApi }) => {
    allure.feature('API');
    allure.story('Employee List');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify the employee list API returns an array of employee records');
    allure.tag('smoke');

    const employees = await employeeApi.getAll();
    expect(employees.length).toBeGreaterThan(0);
  });

  test('POST create employee returns 200 with employee data @api', async ({ employeeApi }) => {
    allure.feature('API');
    allure.story('Create Employee');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify creating an employee returns the created employee payload');
    allure.tag('api');

    const employee = await employeeApi.create(DataFactory.generateEmployee());
    expect(employee.employeeId).toHaveLength(4);
  });

  test('GET employee by ID returns correct employee @api', async ({ employeeApi }) => {
    allure.feature('API');
    allure.story('Employee Details');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify fetching an employee by ID returns the expected record');
    allure.tag('api');

    const employees = await employeeApi.getAll();
    const employee = await employeeApi.getById(employees[0].empNumber);
    expect(employee.empNumber).toBe(employees[0].empNumber);
  });

  test('PUT update employee name succeeds @api', async ({ employeeApi }) => {
    allure.feature('API');
    allure.story('Update Employee');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify updating an employee first name succeeds');
    allure.tag('api');

    const employees = await employeeApi.getAll();
    const firstEmployee = employees[0];
    const updated = await employeeApi.update(firstEmployee.empNumber, { firstName: `${firstEmployee.firstName}Updated` });
    expect(updated.firstName).toContain('Updated');
  });

  test('DELETE employee returns 200 @api', async ({ employeeApi }) => {
    allure.feature('API');
    allure.story('Delete Employee');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify deleting an employee returns a successful response');
    allure.tag('api');

    const employee = await employeeApi.create(DataFactory.generateEmployee());
    await expect(employeeApi.delete(Number(employee.empNumber))).resolves.not.toThrow();
  });
});
