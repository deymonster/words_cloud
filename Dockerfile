FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm i

COPY . .
RUN npm run prisma:generate
RUN npm run build

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/prod.db"
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["npm","run","start"]

