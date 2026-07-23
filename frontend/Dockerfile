FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# nginx/conf/default.conf and nginx/certs are mounted at runtime via
# docker-compose volumes (see docker-compose.yml), overriding the base
# image's defaults with our HTTPS + reverse-proxy config.
