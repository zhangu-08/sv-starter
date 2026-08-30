# Developer runbook

Canonical reference for every command in this project. `package.json` scripts are the source of truth for what to run; this doc explains how and why.

## Setup

```bash
pnpm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL=file:./local.db
BETTER_AUTH_URL=https://sv-starter.localhost
BETTER_AUTH_SECRET=<at-least-32-chars>  # openssl rand -hex 32
```

| Variable             | Purpose                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | SQLite (local) or remote DB URL (prod)                                                        |
| `BETTER_AUTH_URL`    | Public URL of the app (used for auth callbacks)                                               |
| `BETTER_AUTH_SECRET` | Session/crypto secret — min 32 characters                                                     |
| `ORIGIN`             | Public origin for `adapter-node` (`https://app.example.com`). Unset: form POSTs 403 on CSRF   |
| `ADDRESS_HEADER`     | Header `getClientAddress()` reads (usually `X-Forwarded-For`). Unset: one IP bucket per proxy |
| `XFF_DEPTH`          | Trusted `X-Forwarded-For` hops (default `1`). Match the number of proxies that overwrite it   |

`ORIGIN`, `ADDRESS_HEADER`, and `XFF_DEPTH` are `adapter-node` deploy vars — `pnpm dev` does not need them. Set `ADDRESS_HEADER` only when the proxy **overwrites** `X-Forwarded-For`. If it appends a client-supplied value, clients pick their own IP and the per-IP bucket is useless. Without `ORIGIN`, logout POSTs fail CSRF with 403. Without `ADDRESS_HEADER`, `getClientAddress()` returns the proxy, every login shares one rate-limit bucket, and five failures lock out the whole proxy.

## Development

| Command        | What it does                                              |
| -------------- | --------------------------------------------------------- |
| `pnpm dev`     | Start the dev server via [portless](https://portless.sh/) |
| `pnpm build`   | Production build (app + provisioning script)              |
| `pnpm preview` | Preview the production build locally                      |

Portless must be installed separately — see the [README](../../README.md).

### Build output

`pnpm build` produces a single `build/` folder:

| Path                           | Purpose                           |
| ------------------------------ | --------------------------------- |
| `build/index.js`               | App server entry (`adapter-node`) |
| `build/client/`                | Static client assets              |
| `build/scripts/create-user.js` | Compiled user provisioning script |

## Database (Drizzle)

| Command            | What it does                                     |
| ------------------ | ------------------------------------------------ |
| `pnpm db:push`     | Push schema changes directly to the database     |
| `pnpm db:generate` | Generate SQL migration files from schema changes |
| `pnpm db:studio`   | Open Drizzle Studio                              |

- **Use the scripts above.** They run `drizzle-kit` from this project's `node_modules`, so it can see `drizzle-orm`, your schema, and `drizzle.config.ts`.
- **Skip `pnpm dlx` / `pnpx`.** Those download the CLI into a temporary folder with no access to this repo's dependencies — you'll hit `please install required packages: 'drizzle-orm'`.
- **Unwrapped subcommand?** Use `pnpm exec drizzle-kit <command>`.

## Auth

`hooks.server.ts` stamps `x-client-ip` from `getClientAddress()` and mounts Better Auth at
`/api/auth/*`. Login is a client `signIn.email` post to `/api/auth/sign-in/email`, so Better
Auth's built-in limiter runs (5 attempts / 60s per IP on that path). Do not call
`auth.api.signInEmail()` from a form action — that bypasses the limiter.

Sign-out is `POST /logout` (`auth.api.signOut` + `sveltekitCookies`). GET `/logout` does not
clear the session. Logout is still a form POST, so `ORIGIN` still matters.

## User provisioning

This is a **restricted app** — public signup is disabled (`disableSignUp: true`). Users are created by an operator via the provisioning script.

| Command                                          | When to use                                    |
| ------------------------------------------------ | ---------------------------------------------- |
| `pnpm create-user --email <email> --name <name>` | Local dev (TypeScript via `tsx`, loads `.env`) |

You will be prompted for a password; input is hidden. Password must be 8–128 characters.

### Production (Docker / VPS)

The runtime image runs compiled JS — no `tsx`, no `src/`. After `pnpm build`, `build/scripts/create-user.js` ships next to the app server.

```bash
docker exec -it <container> node build/scripts/create-user.js --email user@example.com --name "User Name"
```

Requirements:

- Run **`pnpm build`** before deploying so `build/scripts/create-user.js` exists in the image.
- Use **`-it`** — the script requires an interactive terminal for the password prompt.
- Set `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `ORIGIN` as container environment variables (no `.env` file, no `--env-file`).
- Behind a reverse proxy also set `ADDRESS_HEADER=X-Forwarded-For` and `XFF_DEPTH` to the hop count. The proxy must overwrite `X-Forwarded-For`; do not set `ADDRESS_HEADER` if it only appends. Without `ORIGIN`, logout CSRF 403s. Without `ADDRESS_HEADER`, the per-IP limiter collapses to one shared bucket.

Re-running the script for an existing email fails with `User already exists`.

## Code quality

| Command            | What it does                     |
| ------------------ | -------------------------------- |
| `pnpm check`       | Type-check Svelte and TypeScript |
| `pnpm check:watch` | Type-check in watch mode         |
| `pnpm lint`        | Run Prettier and ESLint          |
| `pnpm format`      | Auto-format with Prettier        |
