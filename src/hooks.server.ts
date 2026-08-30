import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { auth, rejectAnonymous, requiresSession } from '$lib/server/auth';
import { building } from '$app/env';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	// Must stay here: layout loads are skipped on client-side nav, actions run before loads.
	if (requiresSession(event) && !event.locals.user) {
		rejectAnonymous(event);
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
