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

Login is a client `signIn.email` submit to `/api/auth/sign-in/email`. Better Auth owns
sessions, cookies, and rate limits. The SvelteKit hook gates routes: anonymous pages
redirect to `/login`; first-party `/api/*` endpoints return `401`. Users are provisioned
with `pnpm create-user` — public signup is disabled.

## Commands

Full command reference lives in the **[developer runbook](.docs/wiki/runbook.md)** — setup, database, user provisioning, build output, and code quality.
