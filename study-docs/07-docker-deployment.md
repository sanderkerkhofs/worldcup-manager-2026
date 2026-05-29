# 07 — Docker & Deployment

> **How the application is packaged and run in containers.**

---

## Key concepts

| Term               | Simple explanation                                                                 |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Image**          | A frozen snapshot — like a zip file with the app + all dependencies                |
| **Container**      | A running instance of an image — like a lightweight virtual machine                |
| **Dockerfile**     | Recipe for building an image                                                       |
| **Docker Compose** | Runs multiple containers together                                                  |
| **Volume**         | A folder shared between your machine and a container (data persists)               |
| **Network**        | Virtual network between containers                                                 |
| **Port mapping**   | `HOST:CONTAINER` — e.g., `3001:3000` exposes container port 3000 as localhost:3001 |

---

## The three services

| Service  | Image                  | Container port | Host port |
| -------- | ---------------------- | -------------- | --------- |
| database | postgres:16-alpine     | 5432           | 5432      |
| backend  | ./back-end/Dockerfile  | 3000           | 3001      |
| frontend | ./front-end/Dockerfile | 8080           | 8080      |

---

## Back-end Dockerfile (explained line by line)

```dockerfile
FROM node:18-alpine          # start from Node 18 on tiny Alpine Linux
WORKDIR /app                 # all commands run in /app folder
COPY package*.json ./        # copy package files first (for caching)
RUN npm install              # install dependencies
COPY . .                     # copy the source code
RUN npx prisma generate      # generate the Prisma TypeScript client
RUN npm run build            # compile TypeScript → JavaScript
EXPOSE 3000                  # document that the server listens on 3000
CMD ["node", "dist/app.js"]  # command to start the server
```

---

## docker-compose-fullstack.yml (key points)

```yaml
services:
  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: worldcup
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    volumes:
      - postgres_data:/var/lib/postgresql/data # data persists between restarts
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]

  backend:
    build: ./back-end
    depends_on:
      database:
        condition: service_healthy # wait for postgres to be ready
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://admin:admin@database:5432/worldcup

  frontend:
    build: ./front-end
    depends_on:
      - backend
    ports:
      - "8080:8080"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
```

---

## Common Docker commands

```bash
# Start everything (build images if needed):
docker compose -f docker-compose-fullstack.yml up --build

# Start in the background:
docker compose -f docker-compose-fullstack.yml up -d

# See running containers:
docker ps

# See logs for one service:
docker compose logs backend -f

# Run a command inside a container:
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed

# Stop everything:
docker compose down

# Stop and delete volumes (DESTROYS database data!):
docker compose down -v
```

---

## Why containers?

**Without Docker:** Every developer installs Node.js, PostgreSQL, sets environment variables, runs migrations manually. "It works on my machine" is a common problem.

**With Docker:** One command starts everything. The containers run identically on every machine. The database, versions, and config are locked in the compose file.
