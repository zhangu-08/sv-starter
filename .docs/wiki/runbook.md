# Developer runbook

Canonical reference for every command in this project. `package.json` scripts are the source of truth for what to run; this doc explains how and why.

## Setup

```bash
pnpm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL=file:./local.db
```

## Development

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server via [portless](https://portless.sh/) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview the production build locally |

Portless must be installed separately — see the [README](../../README.md).

## Database (Drizzle)

| Command | What it does |
| --- | --- |
| `pnpm db:push` | Push schema changes directly to the database |
| `pnpm db:generate` | Generate SQL migration files from schema changes |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed the database with development data |

- **Use the scripts above.** They run `drizzle-kit` from this project's `node_modules`, so it can see `drizzle-orm`, your schema, and `drizzle.config.ts`.
- **Skip `pnpm dlx` / `pnpx`.** Those download the CLI into a temporary folder with no access to this repo's dependencies — you'll hit `please install required packages: 'drizzle-orm'`.
- **Unwrapped subcommand?** Use `pnpm exec drizzle-kit <command>`.

## Code quality

| Command | What it does |
| --- | --- |
| `pnpm check` | Type-check Svelte and TypeScript |
| `pnpm check:watch` | Type-check in watch mode |
| `pnpm lint` | Run Prettier and ESLint |
| `pnpm format` | Auto-format with Prettier |
