import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$app/env/private';
import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { getRequestEvent } from '$app/server';

import { db } from '$lib/server/db';

import { createAuthOptions } from './options';

export const auth = betterAuth({
	...createAuthOptions({
		db,
		baseURL: BETTER_AUTH_URL,
		secret: BETTER_AUTH_SECRET
	}),
	plugins: [sveltekitCookies(getRequestEvent)]
});
