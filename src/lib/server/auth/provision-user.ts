import { betterAuth } from 'better-auth';

import { authOptions } from './options';
import { formatZodError, provisionUserSchema, type ProvisionUserInput } from './validation.schema';

/** Matches `createLocalAccountIssuer('credential')` from better-auth. */
const CREDENTIAL_ISSUER = 'local:credential';

const auth = betterAuth(authOptions);

export type { ProvisionUserInput };

export async function provisionUser(input: ProvisionUserInput) {
	const parsed = provisionUserSchema.safeParse(input);

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const { name, email, password } = parsed.data;
	const normalizedEmail = email.toLowerCase();
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
