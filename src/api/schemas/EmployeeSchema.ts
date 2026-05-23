import { z } from 'zod';

export const EmployeeSchema = z.object({
  empNumber: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  employeeId: z.string().nullable().optional(),
  email: z.string().email().optional(),
});

export const EmployeeListSchema = z.array(EmployeeSchema);

export type Employee = z.infer<typeof EmployeeSchema>;
export type EmployeeList = z.infer<typeof EmployeeListSchema>;
