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

test.describe('Leave Management', () => {
  test('should display leave entitlements page @smoke', async ({ leavePage }) => {
    allure.feature('Leave Management');
    allure.story('Leave Page');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify the leave entitlements page is accessible and displays core sections');
    allure.tag('smoke');

    await leavePage.navigate('/web/index.php/leave/viewLeaveModule');
    await leavePage.verifyPageLoaded();
  });

  test('should display leave balance for all leave types @regression', async ({ leavePage, leaveTypes }) => {
    allure.feature('Leave Management');
    allure.story('Leave Balance');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify leave balances are displayed for the configured leave types');
    allure.tag('regression');

    await leavePage.navigate('/web/index.php/leave/viewLeaveModule');

    for (const leaveType of leaveTypes.slice(0, 3)) {
      const balance = await leavePage.getLeaveBalance(leaveType);
      expect(balance).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display all required fields on apply leave form @regression', async ({ leavePage }) => {
    allure.feature('Leave Management');
    allure.story('Apply Leave');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify required fields are present on the apply leave form');
    allure.tag('regression');

    await leavePage.navigateToApply();
    await expect(leavePage.leaveTypeSelect).toBeVisible();
    await expect(leavePage.fromDateInput).toBeVisible();
    await expect(leavePage.toDateInput).toBeVisible();
    await expect(leavePage.reasonInput).toBeVisible();
    await expect(leavePage.submitButton).toBeVisible();
  });

  test('should apply for leave successfully @regression', async ({ leavePage, leaveData }) => {
    allure.feature('Leave Management');
    allure.story('Apply Leave');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify leave can be applied successfully using leave request data');
    allure.tag('regression');

    await leavePage.applyForLeave(leaveData);
    await leavePage.verifyLeaveSubmitted();
  });

  test('should display submitted leave in my leave list @regression', async ({ leavePage, leaveData }) => {
    allure.feature('Leave Management');
    allure.story('My Leave');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify submitted leave appears in the My Leave list after applying');
    allure.tag('regression');

    await leavePage.applyForLeave(leaveData);
    await leavePage.verifyLeaveStatus(leaveData.leaveType, 'Pending');
  });
});
