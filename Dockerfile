# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time for static generation
# But for this app, we mostly use runtime envs. 
# We disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install prisma globally or copy it to run migrations
# To allow 'npx prisma migrate deploy', we need the prisma CLI.
# The standalone build only has what's needed for runtime.
# We will copy the generated client.
# For SQLite, migration management is tricky in Docker.
# Simplest approach: Copy full node_modules from deps for the migration script? No, too big.
# We will install prisma cli in runner just for migration support (it adds ~50MB but worth it for simplicity)
RUN npm install -g prisma@5.22.0

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Create directory for sqlite db
RUN mkdir -p /app/prisma/data && chown -R nextjs:nodejs /app/prisma

# Switch to user nextjs
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV DATABASE_URL="file:/app/prisma/data/prod.db"

# Startup script to run migrations then start app
ENV HOSTNAME="0.0.0.0"
CMD sh -c "npx prisma migrate deploy && node server.js"
