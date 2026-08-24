import { defineConfig } from 'drizzle-kit';

// Relative import required: drizzle-kit runs outside SvelteKit, so `$lib` aliases don't resolve here.
import { env } from './src/lib/server/env';

export default defineConfig({
	out: './drizzle',
	schema: './src/lib/server/db/schemas/index.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: env.DATABASE_URL
	}
});
