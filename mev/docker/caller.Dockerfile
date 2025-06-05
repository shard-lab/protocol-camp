FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY src ./src
COPY tsconfig.json ./
COPY .env ./
RUN npm install

CMD ["node", "dist/caller.js"] 