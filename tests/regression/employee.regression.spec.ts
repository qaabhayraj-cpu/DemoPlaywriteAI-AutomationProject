import { expect, test } from '@fixtures';

test.describe('Employee Management', () => {
  test('should show No Records Found for invalid search', async ({ employeePage }) => {
    await employeePage.searchByName('NonexistentEmployee123');
    await employeePage.verifyNoResultsFound();
  });

  test('should reset search filters', async ({ employeePage }) => {
    await employeePage.searchByName('Admin');
    await employeePage.clearSearch();
  });
});
