import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import { authRelations } from './schemas/auth.schema';

export function createDb(databaseUrl: string) {
	const client = createClient({ url: databaseUrl });
	return drizzle({ client, relations: authRelations });
}

export type Db = ReturnType<typeof createDb>;
