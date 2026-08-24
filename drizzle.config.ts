import { defineConfig } from 'drizzle-kit';

// drizzle-kit CLI only (db:push, db:generate, db:studio) — runs outside SvelteKit, so process.env not $app/env.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	out: './drizzle',
	schema: './src/lib/server/db/schemas/index.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DATABASE_URL
	}
});
