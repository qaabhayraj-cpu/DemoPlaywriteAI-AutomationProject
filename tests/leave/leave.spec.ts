import { expect, test } from '@fixtures';

test.describe('Leave Management', () => {
  test('should display leave balance for all leave types @regression', async ({ leavePage, leaveTypes }) => {
    await leavePage.navigate('/web/index.php/leave/viewLeaveList');

    for (const leaveType of leaveTypes.slice(0, 3)) {
      const balance = await leavePage.getLeaveBalance(leaveType);
      expect(balance).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display all required fields on apply leave form @regression', async ({ leavePage }) => {
    await leavePage.navigateToApply();
    await expect(leavePage.leaveTypeSelect).toBeVisible();
    await expect(leavePage.fromDateInput).toBeVisible();
    await expect(leavePage.toDateInput).toBeVisible();
    await expect(leavePage.reasonInput).toBeVisible();
    await expect(leavePage.submitButton).toBeVisible();
  });

  test('should apply for leave successfully @regression', async ({ leavePage, leaveData }) => {
    await leavePage.applyForLeave(leaveData);
    await leavePage.verifyLeaveSubmitted();
  });

  test('should display submitted leave in my leave list @regression', async ({ leavePage, leaveData }) => {
    await leavePage.applyForLeave(leaveData);
    await leavePage.verifyLeaveStatus(leaveData.leaveType, 'Pending');
  });
});
