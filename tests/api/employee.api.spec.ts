import { expect, test } from '@fixtures';
import { DataFactory } from '@helpers/DataFactory';

test.describe('Employee API', () => {
  test('POST create employee returns 200 with employee data @api', async ({ employeeApi }) => {
    const employee = await employeeApi.create(DataFactory.generateEmployee());
    expect(employee.employeeId).toHaveLength(4);
  });

  test('GET employee by ID returns correct employee @api', async ({ employeeApi }) => {
    const employees = await employeeApi.getAll();
    const employee = await employeeApi.getById(employees[0].empNumber);
    expect(employee.empNumber).toBe(employees[0].empNumber);
  });

  test('PUT update employee name succeeds @api', async ({ employeeApi }) => {
    const employees = await employeeApi.getAll();
    const firstEmployee = employees[0];
    const updated = await employeeApi.update(firstEmployee.empNumber, { firstName: `${firstEmployee.firstName}Updated` });
    expect(updated.firstName).toContain('Updated');
  });

  test('DELETE employee returns 200 @api', async ({ employeeApi }) => {
    const employee = await employeeApi.create(DataFactory.generateEmployee());
    await expect(employeeApi.delete(Number(employee.empNumber))).resolves.not.toThrow();
  });
});
