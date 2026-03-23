FROM node:20-alpine3.22 AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine3.22 AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run db:generate && npm run build && npm prune --omit=dev

FROM node:20-alpine3.22
COPY ./package.json package-lock.json /app/
COPY --from=build-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY ./prisma /app/prisma
COPY ./prisma.config.ts /app/prisma.config.ts
COPY ./scripts/azure/init-sql.mjs /app/scripts/azure/init-sql.mjs
COPY ./scripts/prisma-managed-identity.mjs /app/scripts/prisma-managed-identity.mjs
COPY ./scripts/prisma-sql-migration-runner.mjs /app/scripts/prisma-sql-migration-runner.mjs
COPY ./scripts/run-migrations.mjs /app/scripts/run-migrations.mjs
COPY ./scripts/serve-runtime.mjs /app/scripts/serve-runtime.mjs
COPY ./scripts/start-server.mjs /app/scripts/start-server.mjs
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
