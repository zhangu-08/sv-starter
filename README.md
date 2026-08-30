# sv-starter

A SvelteKit starter project for my personal use.

## Quick start

1. Install [portless](https://portless.sh/).
2. `pnpm install`
3. Add a `.env` file (see the [runbook](.docs/wiki/runbook.md#setup)).
4. `pnpm db:push` — apply the database schema.
5. `pnpm create-user --email you@example.com --name "Your Name"` — create a user (password prompt).
6. `pnpm dev` — start the app.

## Auth

Login is a form action that calls `auth.api.signInEmail()`, not `POST /api/auth/sign-in/email`.
Better Auth's rate limiter is router middleware and does not run on `auth.api.*`, so the
action has its own throttle in `$lib/server/auth/rate-limit.ts`. The same bypass applies to
any later `auth.api.*` call.

## Commands

Full command reference lives in the **[developer runbook](.docs/wiki/runbook.md)** — setup, database, user provisioning, build output, and code quality.
