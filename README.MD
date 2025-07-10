# 💠 Workshop Booking System – Backend

This is the **backend service** for the Workshop Booking System. It manages business logic, data storage, authentication, and REST APIs to support admin and customer interfaces through secure, scalable endpoints.

> 🔗 **Local Backend URL:** [http://localhost:3000](http://localhost:3000)  
> 🔹 **GitHub Repository:** [github.com/Mekin-jema/workshop-booking-backend](https://github.com/Mekin-jema/workshop-booking-backend)

---

## ✨ Features

- 🔐 JWT Authentication (Admin & Customer)
- 📅 Workshop and Time Slot Management
- 📦 Booking System with Status Tracking
- 📊 Admin Statistics API (Aggregated Queries)
- 🧪 Unit & Integration Testing (Jest + Supertest)
- 🗑️ Soft Deletion for Sensitive Entities
- 🛡️ Security Headers (Helmet), Rate Limiting *(WIP)*
- ✅ Schema Validation (Zod)
- 📃 Pagination & Filtering on APIs
- ♻️ Seed Script for Realistic Workshop Data

---

## ⚙️ Setup Instructions

### 📦 Prerequisites

- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Git

---

### 🐳 Docker-Based Setup (Recommended)

#### 1. Clone the Repository

```bash
git clone https://github.com/Mekin-jema/workshop-booking-backend.git
cd workshop-booking-backend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Create `.env` File

Create a `.env` file in the root of the project:

```env
DATABASE_URL="postgresql://myuser:mypassword@postgres:5432/mydatabase?schema=public"
PORT=3000
JWT_SECRET="your_jwt_secret"
```

> 📝 Replace `myuser`, `mypassword`, and `mydatabase` with your own values for local development.

#### 4. Start Services with Docker Compose

```bash
docker compose up -d --build
```

> ✅ Backend API: [http://localhost:3000](http://localhost:3000)  
> ✅ Prisma Studio: [http://localhost:5555](http://localhost:5555)

---

## 🌱 Seeding the Database

To populate the database with demo workshops and booking data:

### Step 1: Log into the Express Container

```bash
docker exec -it express_api /bin/sh
```

### Step 2: Run the Seed Script

```bash
npx prisma db seed
```

---

## 🔄 Running Migrations

Migrations are performed inside the **Express container**:

### Step 1: Enter the Container

```bash
docker exec -it express_api /bin/sh
```

### Step 2: Apply Migrations

```bash
npx prisma migrate dev --name init
```

> Replace `init` with your own migration name.

---

## 🧪 Running Tests

Tests are written using **Jest** and **Supertest**:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# View coverage report
npm run test:coverage
```

---

## 🐘 Accessing PostgreSQL via CLI

### Step 1: Access the Postgres Container

```bash
docker exec -it postgres_db /bin/bash
```

### Step 2: Open the PostgreSQL Shell

```bash
psql -U myuser -d mydatabase
```

Useful PostgreSQL CLI commands:

```sql
\dt            -- List all tables
\d tablename   -- Show table structure
\q             -- Quit psql
```

---

## 🛠️ Prisma CLI Reference

```bash
# Install Prisma dependencies
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Run migration (development)
npx prisma migrate dev --name init

# Run migration (production)
npx prisma migrate deploy

# Open database UI
npx prisma studio
```

---

## 🐋 Docker Compose Overview

```yaml
services:
  postgres:       # PostgreSQL database container
  express_api:    # Node.js backend API container

volumes:
  node_modules:   # Persist node_modules for the host
```

> 🛠️ Migrations and server startup are triggered automatically during build.

---

## 📌 Common Developer Commands

| Command                      | Description                              |
| ---------------------------- | ---------------------------------------- |
| `npm run dev`                | Start the dev server with Nodemon        |
| `npx prisma studio`          | Open Prisma Studio DB GUI                |
| `npx prisma migrate dev`     | Run migrations in dev                    |
| `docker compose up -d`       | Launch Docker containers (detached)      |
| `docker exec -it <name>`     | Access a running Docker container        |

---

## 🙋‍♂️ Questions or Issues?

If you encounter problems, feel free to [open an issue](https://github.com/Mekin-jema/workshop-booking-backend/issues).

---

**Happy Coding! 🚀**
