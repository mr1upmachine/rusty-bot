# Build Stage
FROM node:16 AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Run Stage
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json .env* ./

RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 8080

CMD [ "npm", "run", "start:prod" ]