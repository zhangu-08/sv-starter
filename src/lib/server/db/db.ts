import { DATABASE_URL } from '$app/env/private';

import { createDb } from './create-db';

export const db = createDb(DATABASE_URL);
