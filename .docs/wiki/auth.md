# Auth

Restricted app. No public signup. Operators create users (`pnpm create-user` — [runbook](./runbook.md)).

Better Auth owns identity: sessions, cookies, `/api/auth/*`, rate limits. The SvelteKit hook owns access: is this route allowed. Layouts never guard.

## Request

Every request hits `hooks.server.ts` first (`static/` is served before hooks — nothing private there).

1. `auth.api.getSession` — always. Sets `locals.user` / `locals.session` when the cookie is valid. `/login` needs this to bounce an already-signed-in user.
2. Stamp `x-client-ip` from `getClientAddress()` (skipped while `building`). Better Auth’s limiter reads headers only; `svelteKitHandler` does not set an IP.
3. Gate on `event.route.id`. Then `svelteKitHandler` — that is what serves `/api/auth/*`. There is no `src/routes/api/auth`.

Gate on `route.id` (what the router resolved), not `url.pathname`. Encoding (`%61`, `/foo/../…`) cannot change it. Fail-closed: a forgotten ungrouped file still has an id and needs a session. The hook does not match on `(protected)` — gating only that group would make that file public.

| `route.id` | What it is | No session |
| --- | --- | --- |
| `/(public)…` | login, logout, public `/api/…` | allowed |
| other id, path is `/api…` | first-party `+server.ts` | `401` |
| any other non-empty id | `(protected)` pages, ungrouped files | `303` → `/login` |
| `null` | `/api/auth/*`, unmatched 404 | pass through |

`startsWith('/(public)')` — no trailing slash. The group index id is `/(public)`. Empty id means SvelteKit matched no file. Gating it deadlocks sign-in or turns every typo into a login wall.

401 vs 303: strip `(group)` from `route.id`, then `/api` means endpoint. `src/routes/api/categories/+server.ts` → `/api/categories` → 401. Public: `(public)/api/health`. Leave `/api/auth/*` to Better Auth. No empty folder; the first endpoint creates it.

## Login and logout

SSR the page. Client the submit. JS-off is not a requirement.

`+page.server.ts` returns `{ redirectTo }`. If `locals.user`, `303` to that target. No form actions.

`+page.svelte` `preventDefault`s and calls `authClient.signIn.email`, then `goto(redirectTo)`. That posts to `/api/auth/sign-in/email` so Better Auth’s limiter runs. A form action calling `auth.api.signInEmail()` skips the limiter — that is why login is not a form action. The form component is presentation only.

HTML `required`; password `maxlength=128`. No Zod. `429` → `Too many sign-in attempts. Try again later.`; else `error.message` or `Sign in failed`.

`POST /logout` → `auth.api.signOut`. The `sveltekitCookies` plugin forwards `Set-Cookie`; without it, server-side sign-out drops the cookie. GET `/logout` does not clear the session — signed-in user → `/`, everyone else → `/login`. Logout is still a form POST, so `ORIGIN` still matters. Login no longer uses SvelteKit CSRF.

Redirect helpers live in `src/lib/server/auth/redirect.ts`:

- `safeRedirect` — must start with `/`; `//` and `/\` → `/`.
- `loginUrl` — home is `/login`, not `/login?redirectTo=/`. Anything else keeps `?redirectTo=` of `pathname + search`.
- `requestedRedirect` — reads that param on `/login`.

## Rate limit

One source: Better Auth. Memory store (one instance). On in prod and dev.

`/sign-in/email`: 5 / 60s per IP. Path is relative to the auth base, not `/api/auth/…`. Replaces Better Auth’s default (3 / 10s).

Options list only `x-client-ip`. The hook writes `getClientAddress()` there — already the address `adapter-node` trusts (`ADDRESS_HEADER` / `XFF_DEPTH`). Listing `x-forwarded-for` would let the client pick the IP. No stamp → every login shares `no-trusted-ip`. Node lets `headers.set` succeed; the request is not cloned.

## Users

`disableSignUp: true`. No public signup form.

`pnpm create-user` runs `scripts/create-user.ts`. Prod: `node build/scripts/create-user.js`. Not under `src/`. `provisionUser` creates via the adapter, hashes, links a credential account; email lowercased; `emailVerified: true`; duplicate email throws.

Password 8–128 is written twice — CLI and `createAuthOptions` — so there is no shared schema. Zod stays in `env-schema.ts`. `scripts/**/*.ts` is in Kit’s generated tsconfig so `pnpm check` type-checks the CLI.

## Session on the page

Hook = authentication only. Roles / ownership, when they exist, are per-route.

Server reads `locals.user`. Components read `data.user` from `(protected)/+layout.server.ts` (`{ user: event.locals.user! }`). That load does not guard; the hook already did.

Locals types live in `src/app.types.ts` (not `app.d.ts`) so `pnpm check` sees them, inferred from `auth.$Infer.Session`. `skipLibCheck` skips every `.d.ts`.

Protected prerender throws *before* `loginUrl` so the error names the route, not `url.search`. Returning early during `building` would emit a static protected page.

## Files

| File | Role |
| --- | --- |
| `src/hooks.server.ts` | session, IP stamp, gate, `svelteKitHandler` |
| `src/lib/server/auth/better-auth.ts` | Better Auth instance + `sveltekitCookies` |
| `src/lib/server/auth/options.ts` | email/password, limiter, IP header |
| `src/lib/server/auth/redirect.ts` | `loginUrl` / `safeRedirect` / `requestedRedirect` |
| `src/lib/auth-client.ts` | `createAuthClient` |
| `src/lib/components/login/login-form.svelte` | presentation only |
| `src/routes/(public)/login` | SSR page, client `signIn.email`, no form actions |
| `src/routes/(public)/logout/+server.ts` | `POST` sign-out |
| `src/lib/server/auth/provision-user.ts` + `scripts/create-user.ts` | operator CLI |
