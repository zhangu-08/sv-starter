import { parseServerEnv, type ServerEnv } from './schema';

// process.env (not $env/dynamic/private) so drizzle.config.ts and tsx scripts share this module; $lib/server already blocks client imports.
export const env: ServerEnv = parseServerEnv(process.env);

export type { ServerEnv };
