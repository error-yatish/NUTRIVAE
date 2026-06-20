FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json tsconfig.base.json ./
COPY projects/service-nutrivae-ui/package.json projects/service-nutrivae-ui/
COPY packages/shared/package.json packages/shared/
RUN npm install
COPY projects/service-nutrivae-ui projects/service-nutrivae-ui
COPY packages/shared packages/shared
RUN npm run build -w @nutrivae/shared && npm run build -w service-nutrivae-ui
FROM nginx:1.27-alpine
COPY --from=build /app/projects/service-nutrivae-ui/dist /usr/share/nginx/html
COPY projects/service-nutrivae-ui/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
