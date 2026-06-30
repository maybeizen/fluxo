# syntax=docker/dockerfile:1

FROM oven/bun:1.3 AS builder
WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.base.json tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/cli/package.json ./apps/cli/
COPY packages ./packages
COPY plugins ./plugins
COPY apps/api ./apps/api

RUN bun install --frozen-lockfile

ENV CI=true
ENV POSTGRES_URL=postgresql://postgres:postgres@postgres:5432/fluxo

RUN bun run --filter @fluxo/api build

FROM oven/bun:1.3-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/plugins ./plugins

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
