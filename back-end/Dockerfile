FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run db:generate && npx prisma db push && npx ts-node util/seed.ts && npx ts-node app.ts"]
