import { defineEnvVars } from '@sveltejs/kit/env';

import { privateEnvSchema } from './lib/server/env-schema';

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'SQLite (local) or remote DB URL',
		schema: privateEnvSchema.shape.DATABASE_URL
	},
	BETTER_AUTH_URL: {
		description: 'Public URL of the app (used for auth callbacks)',
		schema: privateEnvSchema.shape.BETTER_AUTH_URL
	},
	BETTER_AUTH_SECRET: {
		description: 'Session/crypto secret — min 32 characters',
		schema: privateEnvSchema.shape.BETTER_AUTH_SECRET
	}
});
