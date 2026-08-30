import { redirect } from '@sveltejs/kit';

import { requestedRedirect } from '$lib/server/auth';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	const redirectTo = requestedRedirect(event.url);

	if (event.locals.user) {
		redirect(303, redirectTo);
	}

	return { redirectTo };
};
