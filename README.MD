Sure! Here's a cleaner, more professional, and slightly more polished version of your README for the **Workshop Booking System – Backend**:

---

# 💠 Workshop Booking System – Backend

This repository contains the **backend API** for the Workshop Booking System. It handles authentication, booking logic, database operations, and exposes RESTful endpoints to serve both the admin and customer interfaces.

> 🔗 **Local API URL:** [http://localhost:3000](http://localhost:3000)
> 📁 **Repository:** [github.com/Mekin-jema/workshop-booking-backend](https://github.com/Mekin-jema/workshop-booking-backend)

---

## ✨ Key Features

* 🔐 JWT Authentication (Admin & Customer)
* 📅 Workshop & Time Slot Management
* 📦 Booking System with Status Tracking
* 📊 Admin Dashboard Stats (Aggregated Queries)
* 🧪 Unit & Integration Tests (Jest + Supertest)
* 🗑️ Soft Deletion for Sensitive Records
* 🛡️ Security Enhancements (Helmet, Rate Limiting - WIP)
* ✅ API Schema Validation using Zod
* 📃 Pagination and Filtering Support
* 🌱 Seeding Scripts for Sample Data

---

## ⚙️ Setup Guide

### 📋 Prerequisites

* [Node.js](https://nodejs.org/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop)
* Git installed on your system

---

### 🐳 Docker Setup (Recommended)

#### 1. Clone the Repository

```bash
git clone https://github.com/Mekin-jema/workshop-booking-backend.git
cd workshop-booking-backend
```

#### 2. Create an `.env` File

Create a `.env` file in the root with the following:

```env
DATABASE_URL="postgresql://myuser:mypassword@postgres:5432/mydatabase?schema=public"
PORT=3000
JWT_SECRET="your_jwt_secret"
```

#### 3. Start Services

```bash
docker compose up -d --build
```

> ✅ API Running at: [http://localhost:3000](http://localhost:3000)
> ✅ Prisma Studio at: [http://localhost:5555](http://localhost:5555)

---

## 🔄 Run Migrations

To apply migrations from inside the Express container:

### Step 1: Enter the Container

```bash
docker exec -it express_api /bin/sh
```

### Step 2: Apply Migrations

```bash
npx prisma migrate dev --name init
```

> Replace `"init"` with your preferred migration name.

---

## 🧪 Running Tests

This project uses **Jest** and **Supertest** for API testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# View code coverage
npm run test:coverage
```

---

## 🐘 Access PostgreSQL via CLI

### Step 1: Enter Postgres Container

```bash
docker exec -it postgres_db /bin/bash
```

### Step 2: Connect to DB

```bash
psql -U myuser -d mydatabase
```

#### Useful Commands:

```sql
\dt            -- List tables
\d tablename   -- Show table schema
\q             -- Exit
```

---

## 🔧 Prisma CLI Reference

```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize config
npx prisma init

# Generate client
npx prisma generate

# Run dev migrations
npx prisma migrate dev --name <name>

# Apply production migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

---

## 🐋 Docker Compose Overview

```yaml
services:
  postgres:       # PostgreSQL database
  express_api:    # Node.js backend API

volumes:
  node_modules:   # Persisted volume for dependencies
```

> ⚠️ Services and migrations run automatically on build if configured.

---

## 📌 Developer CLI Shortcuts

| Command                       | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `npm run dev`                 | Start development server with Nodemon |
| `npx prisma studio`           | Launch Prisma database GUI            |
| `npx prisma migrate dev`      | Apply latest DB migrations            |
| `docker compose up -d`        | Start services in background          |
| `docker exec -it <container>` | Open shell in a running container     |

---

## ❓ Need Help?

Found a bug or need assistance?
👉 [Open an issue](https://github.com/Mekin-jema/workshop-booking-backend/issues)

---
