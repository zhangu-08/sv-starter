import { z } from 'zod';

/** Shared by `src/env.ts` (SvelteKit) and the create-user CLI (`process.env`). */
export const privateEnvSchema = z.object({
	DATABASE_URL: z.string().min(1),
	BETTER_AUTH_URL: z.url(),
	BETTER_AUTH_SECRET: z.string().min(32)
});

export type PrivateEnv = z.infer<typeof privateEnvSchema>;

export function parsePrivateEnv(env: NodeJS.ProcessEnv = process.env): PrivateEnv {
	const result = privateEnvSchema.safeParse({
		DATABASE_URL: env.DATABASE_URL,
		BETTER_AUTH_URL: env.BETTER_AUTH_URL,
		BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET
	});

	if (!result.success) {
		const message = result.error.issues
			.map((issue) => {
				const path = issue.path.join('.') || 'env';
				return `${path}: ${issue.message}`;
			})
			.join('\n');
		throw new Error(message);
	}

	return result.data;
}
