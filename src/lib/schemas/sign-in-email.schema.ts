import { z } from 'zod';

import type { FormFailure } from '$lib/forms';

/** Password length is a signup policy; do not re-enforce it on login. */
export const signInEmailSchema = z.object({
	email: z.string().trim().pipe(z.email('Enter a valid email address')),
	password: z.string().min(1, 'Password is required')
});

export type SignInEmailInput = z.infer<typeof signInEmailSchema>;

/** Echoes email only — password is never sent back to the client. */
export type SignInFormFailure = FormFailure<typeof signInEmailSchema, 'email'>;
