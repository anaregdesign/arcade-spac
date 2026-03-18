FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run db:generate && npm run build && npm prune --omit=dev

FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=build-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY ./prisma /app/prisma
COPY ./scripts/azure/init-sql.mjs /app/scripts/azure/init-sql.mjs
COPY ./scripts/start-with-migrations.mjs /app/scripts/start-with-migrations.mjs
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
