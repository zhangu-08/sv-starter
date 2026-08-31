# STAGE 1: Build the SvelteKit App
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Enable Corepack and prepare the pnpm version specified in your package.json
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only the package files and the lockfile
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies like Vite/SvelteKit)
# --frozen-lockfile ensures your lockfile isn't modified during the build
RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

# Copy the application source code
COPY . .

# SvelteKit validates env during analyse even for runtime (non-static) vars.
# These dummies only satisfy the schema for this RUN; they are not baked into
# the bundle and are not image ENV. Real values come from Compose at start.
RUN DATABASE_URL=file:local.db \
    BETTER_AUTH_URL=http://localhost:3000 \
    BETTER_AUTH_SECRET=docker-build-placeholder-secret-min-32-chars \
    pnpm run build

# Remove development dependencies to keep the production layer minimal
RUN pnpm prune --prod


# STAGE 2: Run the app
FROM node:24-bookworm-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Note: You do NOT need pnpm installed in this runtime stage.
# SvelteKit's compiled 'build/index.js' runs perfectly using standard 'node'.

# SQLite lives on the named volume at /app/data; seed ownership so `USER node` can write
RUN mkdir -p /app/data && chown node:node /app/data

# Copy only the compiled build, committed migrations, package manifests, and production node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle

# Expose SvelteKit's production port
EXPOSE 3000

# Security: Run the container under the non-privileged 'node' user
USER node

# Apply committed SQL, then start the compiled SvelteKit server (exec so it is PID 1)
CMD ["sh", "-c", "node build/scripts/migrate.js && exec node build/index.js"]
