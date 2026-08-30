// Named `.types.ts` so `pnpm check` sees it. `skipLibCheck` (SvelteKit default)
// skips every `.d.ts`, including this project's own `app.d.ts` — which is how
// `locals.user` was silently `any`. Tutorials still call this file `app.d.ts`.
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces.
// Inferred from the auth instance so additionalFields / user-shape plugins stay in sync.
import type { auth } from '$lib/server/auth/better-auth';

type Session = typeof auth.$Infer.Session;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace -- SvelteKit App.Locals
	namespace App {
		interface Locals {
			user?: Session['user'];
			session?: Session['session'];
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
