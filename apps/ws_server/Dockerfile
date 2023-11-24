FROM oven/bun:1 as base
WORKDIR /usr/src/app

COPY . .
ARG DATABASE_URL
ARG DIRECT_URL
RUN cd ./apps/ws_server && bun install --frozen-lockfile && cd /usr/src/app

ENV NODE_ENV=production
RUN bunx prisma generate
# RUN bunx turbo run build --filter=ws_server

CMD [ "bunx", "turbo", "run", "start", "--filter=ws_server" ]
