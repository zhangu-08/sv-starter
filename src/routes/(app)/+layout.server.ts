import { requireUser } from '$lib/server/auth';

import type { LayoutServerLoad } from './$types';

// Every page under (app) can read this as `data.user`, already narrowed.
export const load: LayoutServerLoad = (event) => {
	return { user: requireUser(event.locals) };
};
