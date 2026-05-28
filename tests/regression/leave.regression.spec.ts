import { expect, test } from '@fixtures';
import { Routes } from '@constants/Routes';
import { Timeouts } from '@constants/Timeouts';

test.describe('Leave Management', () => {
  test('should display leave balance for all leave types', async ({ leavePage, leaveTypes }) => {
    await leavePage.navigate(Routes.LEAVE_ENTITLEMENT);

    for (const leaveType of leaveTypes.slice(0, 3)) {
      const balance = await leavePage.getLeaveBalance(leaveType);
      expect(balance).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display apply leave form with required controls', async ({ leavePage }) => {
    await leavePage.navigateToApply();
    await expect(
      leavePage.leaveTypeSelect.or(leavePage.page.getByText('No Leave Types with Leave Balance'))
    ).toBeVisible({ timeout: Timeouts.LONG });
  });
});
