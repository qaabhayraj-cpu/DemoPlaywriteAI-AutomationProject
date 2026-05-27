import { faker } from '@faker-js/faker';
import { envConfig } from '@config';
import { EmployeeData, LeaveData, UserCredentials } from '@types';

export class DataFactory {
  static generateEmployee(): EmployeeData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const employeeId = faker.string.numeric(4);

    return {
      firstName,
      lastName,
      employeeId,
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${faker.string.numeric(3)}`,
      password: `Test@${faker.string.numeric(4)}`,
      dateOfBirth: DataFactory.formatDate(faker.date.birthdate({ min: 25, max: 45, mode: 'age' })),
      jobTitle: faker.person.jobTitle(),
      email: faker.internet.email(firstName, lastName).toLowerCase(),
      department: faker.helpers.arrayElement(['Sales', 'Engineering', 'Finance', 'Human Resources']),
      location: faker.helpers.arrayElement(['New York', 'London', 'Sydney', 'Tokyo']),
    };
  }

  static generateLeaveRequest(): LeaveData {
    const fromDate = DataFactory.getFutureDate(5);
    const toDate = DataFactory.getFutureDate(8);

    return {
      leaveType: faker.helpers.arrayElement(['Annual Leave', 'Sick Leave', 'Casual Leave']),
      fromDate,
      toDate,
      reason: faker.lorem.sentence().replace(/\.$/, ''),
    };
  }

  static generateAdminUser(): UserCredentials {
    return {
      username: envConfig.username,
      password: envConfig.password,
      role: 'Admin',
    };
  }

  static generateInvalidCredentials(): UserCredentials {
    return {
      username: faker.internet.userName().toLowerCase(),
      password: `Wrong${faker.string.numeric(5)}`,
      role: 'ESS',
    };
  }

  static getFutureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return DataFactory.formatDate(date);
  }

  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${day}-${month}`;
  }
}
