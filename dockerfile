# Utiliser l'image officielle Bun
FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 botuser

RUN chown -R botuser:nodejs /app
USER botuser


CMD ["bun", "run", "index.ts"]