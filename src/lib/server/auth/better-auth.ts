import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { getRequestEvent } from '$app/server';

import { authOptions } from './options';

export const auth = betterAuth({
	...authOptions,
	plugins: [sveltekitCookies(getRequestEvent)]
});
