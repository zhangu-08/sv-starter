# STAGE 1: Build the SvelteKit app
FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including Vite/SvelteKit)
# --frozen-lockfile ensures the lockfile isn't modified during the build
RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

COPY . .

# SvelteKit validates env during analyse even for runtime (non-static) vars.
# These dummies only satisfy the schema for this RUN; they are not baked into
# the bundle and are not image ENV. Real values come from runtime at start.
RUN DATABASE_URL=file:local.db \
    BETTER_AUTH_URL=http://localhost:3000 \
    BETTER_AUTH_SECRET=docker-build-placeholder-secret-min-32-chars \
    pnpm run build \
    && find /app/build -name '*.map' -delete

# STAGE 2: Production dependencies only
# `pnpm prune --prod` leaves orphaned store packages (drizzle-kit, typescript).
# A fresh --prod install keeps just @libsql/client and its native bindings.
FROM node:24-alpine AS deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --dangerously-allow-all-builds

# STAGE 3: Run the app
FROM node:24-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# SQLite lives on the named volume at /app/data; seed ownership so `USER node` can write
RUN mkdir -p /app/data && chown node:node /app/data

COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000

USER node

# Docker sends SIGTERM to whatever is PID 1.
#   Without exec: PID 1 is sh. The shell usually does not pass that on to Node. Docker waits, then kills the container.
#   With exec: the shell is gone, so Node is PID 1. Docker’s SIGTERM lands on Node. Node shuts down and exits; Docker sees the
#   container stop.
CMD ["sh", "-c", "node build/scripts/migrate.js && exec node build/index.js"]
