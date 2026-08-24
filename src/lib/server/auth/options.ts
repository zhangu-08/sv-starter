import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '$lib/server/db';
import { account, session, user, verification } from '$lib/server/db/schemas';
import { env } from '$lib/server/env';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './validation.schema';

export const authOptions = {
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: { user, session, account, verification }
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		minPasswordLength: PASSWORD_MIN_LENGTH,
		maxPasswordLength: PASSWORD_MAX_LENGTH
	}
} as const;
