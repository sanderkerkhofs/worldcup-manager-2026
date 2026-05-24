FROM node:20-bookworm-slim

WORKDIR /app

# Prisma needs OpenSSL runtime libraries in slim images.
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run db:generate && npx prisma db push && npx ts-node util/seed.ts && npx ts-node app.ts"]
