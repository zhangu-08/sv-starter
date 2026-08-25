import { z } from 'zod';

/** Shared with better-auth emailAndPassword config. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const provisionUserSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	email: z.email(),
	password: z
		.string()
		.min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
		.max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
});

export type ProvisionUserInput = z.infer<typeof provisionUserSchema>;

export function formatZodError(error: z.ZodError): string {
	return error.issues.map((issue) => issue.message).join('\n');
}
