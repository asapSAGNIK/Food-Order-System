# Slooze - Food Ordering App

A full-stack, role-based food ordering platform designed for Nick Fury's organization.

## Features Built
- **Next.js 14** App Router Frontend + Tailwind CSS
- **NestJS** Backend
- **Prisma + Supabase (PostgreSQL)** Database
- **Role-Based Access Control (RBAC)** + **Country-Level Data Isolation** (Bonus Objective Achieved)

---

##  Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
npm install

# Connect DB (Supabase strings are pre-configured in .env for grader evaluation)
npx prisma generate
npx prisma db push
npm run seed  # Already seeded, but useful to know

# Start API
npm run start:dev
```
*Backend runs on `http://localhost:3000`*

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Next.js App
npm run dev
```
*Frontend runs on `http://localhost:3001` (or whichever port Next selects)*

---

##  Test Accounts (Seed Data)

Password for ALL accounts: `password123`

| Name | Login Email | Role | Country Scope |
|---|---|---|---|
| **Nick Fury** | nick@slooze.com | ADMIN | GLOBAL |
| **C. Marvel** | marvel@slooze.com | MANAGER | INDIA |
| **C. America**| america@slooze.com | MANAGER | AMERICA |
| **Thanos** | thanos@slooze.com | MEMBER | INDIA |
| **Travis** | travis@slooze.com | MEMBER | AMERICA |

---

##  Architecture & RBAC Implementation

We enforce a powerful **Two-Layer Guard System**:
1. **RolesGuard:** Ensures a user hits the minimum role requirement (`MEMBER`, `MANAGER`, `ADMIN`).
2. **Data-Layer Service Isolation:** A `CountryGuard` logic embedded strictly into the data queries (e.g., `where: { country: user.country }`). 

### Edge Case Handled
* **Payment**: Handled as an "existing payment method" stored per country in the DB. Members can't touch it. Admins can update it in the `Settings > Payment` page on the Frontend. Members can create `DRAFT` orders but the "Place Order" (Checkout logic) strictly requires `MANAGER` or `ADMIN` roles.
