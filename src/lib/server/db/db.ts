import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import { env } from '$lib/server/env';

import { authRelations } from './schemas/auth.schema';

const client = createClient({ url: env.DATABASE_URL });

export const db = drizzle({ client, relations: authRelations });
