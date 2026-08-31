import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { migrate } from 'drizzle-orm/libsql/migrator';

import { createDb } from '$lib/server/db/create-db';

async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error('Error: DATABASE_URL is not set');
		process.exit(1);
	}

	const migrationsFolder = join(process.cwd(), 'drizzle');
	if (!existsSync(migrationsFolder)) {
		console.error(`Error: migrations folder not found at ${migrationsFolder}`);
		process.exit(1);
	}

	const db = createDb(databaseUrl);
	await migrate(db, { migrationsFolder });
	console.log('Migrations applied');
}

main()
	.then(() => process.exit(0))
	.catch((error: unknown) => {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Error: ${message}`);
		process.exit(1);
	});
