FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
COPY .env ./
COPY shared ./shared
RUN npm run build

CMD ["node", "dist/game-manager.js"]