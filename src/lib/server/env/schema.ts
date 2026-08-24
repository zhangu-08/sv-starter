import { z } from 'zod';

export const serverEnvSchema = z.object({
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required')
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
	const result = serverEnvSchema.safeParse(source);

	if (!result.success) {
		throw new Error(`Invalid environment variables:\n${result.error.message}`);
	}

	return result.data;
}
