import { z } from 'zod';

export const LoginResponseSchema = z.object({
  token: z.string().min(1),
  tokenType: z.string().optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
