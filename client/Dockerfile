# build phase
FROM node:23-alpine AS builder

WORKDIR /app

COPY ./package.json ./
RUN npm install

COPY ./ ./
RUN npm run build

# run phase
FROM nginx:1.27.3
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

# default command of the nginx image is to just start up, so we don't need to specify a startup command