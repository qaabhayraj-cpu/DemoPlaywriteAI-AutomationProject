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
