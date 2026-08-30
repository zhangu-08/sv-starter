import { betterAuth } from 'better-auth';

import type { AuthOptions } from './options';

/** Matches `createLocalAccountIssuer('credential')` from better-auth. */
const CREDENTIAL_ISSUER = 'local:credential';

export type ProvisionUserInput = {
	name: string;
	email: string;
	password: string;
};

export async function provisionUser(input: ProvisionUserInput, authOptions: AuthOptions) {
	const { name, email, password } = input;
	const normalizedEmail = email.toLowerCase();
	const auth = betterAuth(authOptions);
	const ctx = await auth.$context;

	const existing = await ctx.internalAdapter.findUserByEmail(normalizedEmail);

	if (existing?.user) {
		throw new Error(`User already exists: ${normalizedEmail}`);
	}

	const user = await ctx.internalAdapter.createUser(
		{
			name,
			email: normalizedEmail,
			emailVerified: true
		},
		{ method: 'provision' }
	);

	if (!user) {
		throw new Error('Failed to create user');
	}

	const hashedPassword = await ctx.password.hash(password);

	await ctx.internalAdapter.linkAccount({
		userId: user.id,
		providerId: 'credential',
		issuer: CREDENTIAL_ISSUER,
		accountId: user.id,
		password: hashedPassword
	});

	return user;
}
