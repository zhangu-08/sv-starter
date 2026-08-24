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

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite (local) or remote DB URL (prod) |
| `BETTER_AUTH_URL` | Public URL of the app (used for auth callbacks) |
| `BETTER_AUTH_SECRET` | Session/crypto secret — min 32 characters |

## Development

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server via [portless](https://portless.sh/) |
| `pnpm build` | Production build (app + provisioning script) |
| `pnpm preview` | Preview the production build locally |

Portless must be installed separately — see the [README](../../README.md).

### Build output

`pnpm build` produces a single `build/` folder:

| Path | Purpose |
| --- | --- |
| `build/index.js` | App server entry (`adapter-node`) |
| `build/client/` | Static client assets |
| `build/scripts/create-user.js` | Compiled user provisioning script |

## Database (Drizzle)

| Command | What it does |
| --- | --- |
| `pnpm db:push` | Push schema changes directly to the database |
| `pnpm db:generate` | Generate SQL migration files from schema changes |
| `pnpm db:studio` | Open Drizzle Studio |

- **Use the scripts above.** They run `drizzle-kit` from this project's `node_modules`, so it can see `drizzle-orm`, your schema, and `drizzle.config.ts`.
- **Skip `pnpm dlx` / `pnpx`.** Those download the CLI into a temporary folder with no access to this repo's dependencies — you'll hit `please install required packages: 'drizzle-orm'`.
- **Unwrapped subcommand?** Use `pnpm exec drizzle-kit <command>`.

## User provisioning

This is a **restricted app** — public signup is disabled (`disableSignUp: true`). Users are created by an operator via the provisioning script.

| Command | When to use |
| --- | --- |
| `pnpm create-user --email <email> --name <name>` | Local dev (runs TypeScript via `tsx`) |
| `pnpm create-user:prod --email <email> --name <name>` | After `pnpm build` (runs compiled JS from `build/scripts/`) |

You will be prompted for a password; input is hidden. Password must be 8–128 characters.

### Production (Docker / VPS)

After deploying, SSH to the VPS and run inside the container with an interactive TTY:

```bash
docker exec -it <container> node build/scripts/create-user.js --email user@example.com --name "User Name"
```

Requirements:

- Run **`pnpm build`** before deploying so `build/scripts/create-user.js` exists in the image.
- Use **`-it`** — the script requires an interactive terminal for the password prompt.
- Set `DATABASE_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET` as container environment variables (no `.env` file needed in prod).

Re-running the script for an existing email fails with `User already exists`.

## Code quality

| Command | What it does |
| --- | --- |
| `pnpm check` | Type-check Svelte and TypeScript |
| `pnpm check:watch` | Type-check in watch mode |
| `pnpm lint` | Run Prettier and ESLint |
| `pnpm format` | Auto-format with Prettier |
