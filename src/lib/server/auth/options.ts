import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { DynamicBaseURLConfig } from 'better-auth';

import type { Db } from '$lib/server/db/create-db';
import { account, session, user, verification } from '$lib/server/db/schemas';

type Args = {
	db: Db;
	baseURL: string;
	secret: string;
};

export function createAuthOptions({ db, baseURL, secret }: Args) {
	const url = new URL(baseURL);
	const protocol: DynamicBaseURLConfig['protocol'] = url.protocol === 'http:' ? 'http' : 'https';

	return {
		baseURL: {
			allowedHosts: [url.host],
			fallback: baseURL,
			protocol
		},
		secret,
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema: { user, session, account, verification }
		}),
		emailAndPassword: {
			enabled: true,
			disableSignUp: true,
			minPasswordLength: 8,
			maxPasswordLength: 128
		},
		advanced: {
			ipAddress: { ipAddressHeaders: ['x-client-ip'] }
		},
		rateLimit: {
			enabled: true, // on in prod and dev — this is a login-gated app
			customRules: {
				'/sign-in/email': { window: 60, max: 5 }
			}
		}
	};
}

export type AuthOptions = ReturnType<typeof createAuthOptions>;
