import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';

import { signInEmailSchema } from '$lib/schemas';
import {
	auth,
	loginRetryMessage,
	loginThrottleStatus,
	recordFailedLogin,
	requestedRedirect
} from '$lib/server/auth';
import { parseFormData, toFormFailure } from '$lib/server/forms';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	const redirectTo = requestedRedirect(event.url);

	if (event.locals.user) {
		redirect(303, redirectTo);
	}

	return { redirectTo };
};

export const actions: Actions = {
	signInEmail: async (event) => {
		// From the URL, not the body, so it survives a failed submit.
		const redirectTo = requestedRedirect(event.url);

		const formData = await event.request.formData();
		const parsed = parseFormData(formData, signInEmailSchema, { echo: ['email'] });

		if (!parsed.success) {
			return fail(400, toFormFailure(parsed));
		}

		const { email, password } = parsed.data;
		const ip = event.getClientAddress();
		const throttle = loginThrottleStatus(ip, email);

		if (throttle.limited) {
			event.setHeaders({ 'retry-after': String(throttle.retryAfterSec) });
			return fail(429, {
				values: { email },
				message: loginRetryMessage(throttle.retryAfterSec)
			});
		}

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				recordFailedLogin(ip, email);
				return fail(400, {
					values: { email },
					message: error.message || 'Sign in failed'
				});
			}

			return fail(500, {
				values: { email },
				message: 'Unexpected error'
			});
		}

		return redirect(303, redirectTo);
	}
};
