import { z } from 'zod';

export const serverEnvSchema = z.object({
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	BETTER_AUTH_URL: z.url().min(1, 'BETTER_AUTH_URL is required'),
	BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET is required')
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
	const result = serverEnvSchema.safeParse(source);

	if (!result.success) {
		throw new Error(`Invalid environment variables:\n${result.error.message}`);
	}

	return result.data;
}
