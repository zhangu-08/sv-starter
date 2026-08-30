import { parseArgs } from 'node:util';

import { createAuthOptions } from '$lib/server/auth/options';
import { provisionUser } from '$lib/server/auth/provision-user';
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

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		console.error('Error: invalid email');
		process.exit(1);
	}

	const password = await promptPassword('Password: ');

	if (password.length < 8 || password.length > 128) {
		console.error('Error: password must be 8–128 characters');
		process.exit(1);
	}

	const env = parsePrivateEnv();
	const db = createDb(env.DATABASE_URL);
	const user = await provisionUser(
		{ email, name, password },
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
