export interface EmployeeData {
  firstName: string;
  lastName: string;
  employeeId: string;
  username: string;
  password: string;
  dateOfBirth: string;
  jobTitle: string;
  email: string;
  department: string;
  location: string;
}

export interface LeaveData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface LeaveRecord {
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Cancelled';
}

export interface UserCredentials {
  username: string;
  password: string;
  role: 'Admin' | 'ESS';
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface TestConfig {
  baseUrl: string;
  headless: boolean;
  env: 'dev' | 'qa' | 'staging';
}
