# syntax=docker/dockerfile:1

FROM oven/bun:1.3 AS builder
WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.base.json tsconfig.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages ./packages
COPY apps/frontend ./apps/frontend

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV CI=true

RUN bun install --frozen-lockfile
RUN bun run --filter @fluxo/frontend build

FROM oven/bun:1.3-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder /app/apps/frontend/next.config.ts ./apps/frontend/next.config.ts

WORKDIR /app/apps/frontend
EXPOSE 5000

CMD ["bun", "run", "start"]
