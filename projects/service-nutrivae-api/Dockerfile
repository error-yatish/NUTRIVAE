FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY projects/service-nutrivae-api/package.json projects/service-nutrivae-api/
COPY packages/shared/package.json packages/shared/
COPY packages/database/package.json packages/database/
RUN npm install
COPY projects/service-nutrivae-api projects/service-nutrivae-api
COPY packages/shared packages/shared
COPY packages/database packages/database
RUN npx prisma generate --schema packages/database/prisma/schema.prisma && npm run build -w @nutrivae/shared && npm run build -w service-nutrivae-api
EXPOSE 4000
CMD ["node", "projects/service-nutrivae-api/dist/server.js"]
