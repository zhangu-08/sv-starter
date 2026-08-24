import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import type { Db } from '$lib/server/db/create-db';
import { account, session, user, verification } from '$lib/server/db/schemas';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './validation.schema';

export function createAuthOptions({
	db,
	baseURL,
	secret
}: {
	db: Db;
	baseURL: string;
	secret: string;
}) {
	return {
		baseURL,
		secret,
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
}

export type AuthOptions = ReturnType<typeof createAuthOptions>;
