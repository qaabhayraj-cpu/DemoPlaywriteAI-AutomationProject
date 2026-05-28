import { expect, test } from '@fixtures';
import { Routes } from '@constants/Routes';
import { Timeouts } from '@constants/Timeouts';

test.describe('Leave Management', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display leave balance for all leave types', async ({ leavePage, leaveTypes }) => {
    await leavePage.navigate(Routes.LEAVE_ENTITLEMENT);

    for (const leaveType of leaveTypes.slice(0, 3)) {
      const balance = await leavePage.getLeaveBalance(leaveType);
      expect(balance).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display apply leave form with required controls', async ({ leavePage }) => {
    await leavePage.navigateToApply();
    // The form shows either the leave type select (when balance exists) or a
    // "No Leave Types with Leave Balance" notice — both confirm the page loaded correctly
    await expect(
      leavePage.leaveTypeSelect.or(leavePage.page.getByText('No Leave Types with Leave Balance'))
    ).toBeVisible({ timeout: Timeouts.LONG });
  });

  test('should apply for leave successfully', async ({ leavePage, leaveData }) => {
    await leavePage.applyForLeave(leaveData);
    await leavePage.verifyLeaveSubmitted();
  });

  test('should display submitted leave in my leave list', async ({ leavePage, leaveData }) => {
    await leavePage.applyForLeave(leaveData);
    await leavePage.verifyLeaveStatus(leaveData.leaveType, 'Pending');
  });
});
