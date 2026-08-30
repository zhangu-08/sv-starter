import { parseArgs } from 'node:util';

import { createAuthOptions } from '$lib/server/auth/options';
import { provisionUser } from '$lib/server/auth/provision-user';
import { formatZodError, provisionUserSchema } from '$lib/schemas';
import { createDb } from '$lib/server/db/create-db';
import { parsePrivateEnv } from '$lib/server/env-schema';
import { promptPassword } from '$lib/server/utils/prompt-password';

function printHelp() {
	console.log(`Usage: pnpm create-user --email <email> --name <name>

Create a user for this restricted app. Public signup is disabled; use this script to provision users.

Options:
  --email       User email (required)
  --name        Display name (required)
  -h, --help    Show this help message

You will be prompted for a password (input is hidden).`);
}

async function main() {
	const { values } = parseArgs({
		options: {
			email: { type: 'string' },
			name: { type: 'string' },
			help: { type: 'boolean', short: 'h' }
		},
		strict: true,
		allowPositionals: false
	});

	if (values.help) {
		printHelp();
		return;
	}

	const email = values.email?.trim();
	const name = values.name?.trim();

	if (!email || !name) {
		console.error('Error: --email and --name are required.\n');
		printHelp();
		process.exit(1);
	}

	const password = await promptPassword('Password: ');

	// Fail here with a field-level message before opening the DB. `provisionUser`
	// parses again — it's a standalone trust boundary for other callers.
	const parsed = provisionUserSchema.safeParse({ email, name, password });

	if (!parsed.success) {
		console.error(formatZodError(parsed.error));
		process.exit(1);
	}

	const env = parsePrivateEnv();
	const db = createDb(env.DATABASE_URL);
	const user = await provisionUser(
		parsed.data,
		createAuthOptions({
			db,
			baseURL: env.BETTER_AUTH_URL,
			secret: env.BETTER_AUTH_SECRET
		})
	);

	console.log(`User created: ${user.email} (${user.id})`);
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`Error: ${message}`);
	process.exit(1);
});
