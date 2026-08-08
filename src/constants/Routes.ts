export const Routes = {
  LOGIN: '/web/index.php/auth/login',
  DASHBOARD: '/web/index.php/dashboard/index',
  EMPLOYEE_LIST: '/web/index.php/pim/viewEmployeeList',
  ADD_EMPLOYEE: '/web/index.php/pim/addEmployee',
  LEAVE: '/web/index.php/leave/viewLeaveList',
  LEAVE_APPLY: '/web/index.php/leave/applyLeave',
  LEAVE_ENTITLEMENT: '/web/index.php/leave/viewMyLeaveEntitlements',
  MY_LEAVE: '/web/index.php/leave/viewMyLeave',
  PROFILE: '/web/index.php/pim/viewPersonalDetails/empNumber/',
} as const;
