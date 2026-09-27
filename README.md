# Amazing Shop — Stock Replenishment Evaluation System

A modern full-stack TypeScript monorepo designed for optimal **Stock Replenishment Evaluation** across multiple suppliers with tiered, seasonal, and total order discounts.

- 🌐 **Live Web Demo**: [https://amazing-web-psi.vercel.app/](https://amazing-web-psi.vercel.app/)
- ⚙️ **Live REST API**: [https://amazing-api-three.vercel.app/](https://amazing-api-three.vercel.app/)
- 📖 **Architectural Decisions**: [`docs/architectural-decisions.md`](docs/architectural-decisions.md)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Live Demo](#live-demo)
3. [Prerequisites & Development Environment](#prerequisites--development-environment)
4. [Getting Started](#getting-started)
   - [Step 1: Clone & Install Dependencies](#step-1-clone--install-dependencies)
   - [Step 2: Environment Variables Setup](#step-2-environment-variables-setup)
   - [Step 3: Database Bootstrapping (Docker or Custom)](#step-3-database-bootstrapping-docker-or-custom)
   - [Step 4: Migrations and Database Seeding](#step-4-migrations-and-database-seeding)
   - [Step 5: Running API and Web Concurrently (`pnpm run dev`)](#step-5-running-api-and-web-concurrently-pnpm-run-dev)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Functional Specification & BDD Scenarios](#functional-specification--bdd-scenarios)
7. [Verification of Example Scenarios](#verification-of-example-scenarios)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Monorepo Scripts](#monorepo-scripts)
10. [Technologies Used & Development Setup](#technologies-used--development-setup)
11. [Architectural Decisions & Directory Structure](#architectural-decisions--directory-structure)
12. [AI / Agents Usage](#ai--agents-usage)

---

## Project Overview

In retail and e-commerce logistics, stores stock catalog articles that can be replenished through multiple external suppliers. Each supplier operates under distinct commercial conditions:

- **Unit Purchase Price**: Base wholesale cost per item.
- **Stock Availability**: Current units on hand at the supplier warehouse.
- **Shipping Lead Time** (`minDaysToShip`): Estimated business days required for order fulfillment and delivery.
- **Discount Rules Engine**:
  - `MIN_TOTAL_AMOUNT`: Percentage discount triggered when the gross order value meets or exceeds a monetary threshold (e.g., 5% off over 1,000 €).
  - `MIN_QUANTITY`: Tiered quantity discounts (e.g., 3% for >5 units, 5% for >10 units).
  - `MONTH_PERIOD`: Seasonal promotions applicable only during specific calendar months (e.g., 2% off for orders placed in September).

When a procurement manager selects an article, required quantity, and anticipated order date, the system:

1. **Validates Stock**: Filters out suppliers lacking sufficient inventory.
2. **Evaluates Cascading Discounts**: Selects the highest qualified tier for quantity rules, applies percentage discounts in sequence on the remaining balance, and rounds the final invoice price to two decimal places.
3. **Recommends the Best Supplier**: Clearly highlights the most economical supplier.
4. **Highlights Shipping Expediency**: Indicates the fastest supplier (`minDaysToShip`), empowering managers to prioritize rapid delivery over marginal price savings when speed is critical.

---

## Live Demo

Both applications are deployed and operational on Vercel:

| Application      | Role                                          | Live URL                                                                       |
| :--------------- | :-------------------------------------------- | :----------------------------------------------------------------------------- |
| **Frontend Web** | Single Page Application (React 19 / MUI)      | [https://amazing-web-psi.vercel.app/](https://amazing-web-psi.vercel.app/)     |
| **Backend API**  | REST API Service (Node.js / Express / Prisma) | [https://amazing-api-three.vercel.app/](https://amazing-api-three.vercel.app/) |

---

## Prerequisites & Development Environment

To run the project locally, ensure your machine satisfies:

- **Node.js**: `>= 20.0.0` (v24 LTS recommended)
- **pnpm**: `>= 9.0.0` (v11 recommended)
- **Docker & Docker Compose**: For automated local PostgreSQL 16 containerization (optional if using an external database).
- **Development OS / Tools**:
  - **Windows Subsystem for Linux (WSL - Ubuntu 24.04 LTS)**: Primary development environment providing native Linux POSIX performance and Docker daemon integration.
  - **Visual Studio Code (VS Code)**: IDE with the Remote - WSL extension, ESLint, Prettier, and TypeScript plugins.
  - **Google Antigravity CLI (`antigravity`)**: Agentic AI pair-programming assistant used throughout project development.

---

## Getting Started

### Step 1: Clone & Install Dependencies

Clone the repository and install all workspace dependencies using `pnpm`:

```bash
git clone https://github.com/dcdavidev/amazing.git
cd amazing
pnpm install
```

---

### Step 2: Environment Variables Setup

Both applications provide pre-configured `.env.development` templates. Create your local `.env` files from these templates:

```bash
# Backend API configuration:
cp apps/api/.env.development apps/api/.env

# Frontend Web configuration:
cp apps/web/.env.development apps/web/.env
```

- **Backend (`apps/api/.env`)**: Set `DATABASE_URL` to your PostgreSQL connection string (pre-configured for the default local Docker container):

  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amazing_db?schema=public"
  PORT=3000
  NODE_ENV=development
  LOG_LEVEL=debug
  ```

- **Frontend (`apps/web/.env`)**: Pre-configured to consume the local API at port 3000:
  ```env
  NODE_ENV=development
  VITE_API_BASE_URL=http://localhost:3000
  ```

---

### Step 3: Database Bootstrapping (Docker or Custom)

#### Option A: Automated Bootstrapping with Docker (Recommended)

A helper script is provided to automate container setup, polling, migrations, and seeding with a single command:

```bash
pnpm db:setup
```

What `pnpm db:setup` does automatically:

1. Verifies local Docker daemon connectivity.
2. Spawns the PostgreSQL 16 container (`amazing-postgres` listening on port `5432`).
3. Polls database readiness via `pg_isready` until healthy.
4. Applies Prisma migrations (`prisma migrate dev`).
5. Seeds initial catalog articles, suppliers, and discount rules.

**Manual Docker commands**:

```bash
# Start PostgreSQL container in background:
pnpm db:start # runs `docker compose up -d`

# Stop PostgreSQL container:
pnpm db:stop # runs `docker compose down`
```

**Default Docker Credentials**:

- **Host**: `localhost` | **Port**: `5432` | **Database**: `amazing_db`
- **User**: `postgres` | **Password**: `postgres`

#### Option B: Using an Existing or Cloud PostgreSQL Database

If using system PostgreSQL or a cloud provider (Neon, Supabase, AWS RDS, Prisma Postgres):

1. Create a database (e.g. `amazing_db`).
2. Update `DATABASE_URL` in `apps/api/.env`:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>?schema=public"
   ```

---

### Step 4: Migrations and Database Seeding

If you started your database manually or are using an external database, apply migrations and seed data:

```bash
# Generate Prisma Client types:
pnpm prisma:generate

# Apply database migrations:
pnpm prisma:migrate

# Seed database with initial articles and suppliers:
pnpm db:seed
```

---

### Step 5: Running API and Web Concurrently (`pnpm run dev`)

You can launch both the backend REST API and the frontend web application concurrently with a single command:

```bash
pnpm run dev
```

Powered by **Turborepo**, this command starts:

- ⚙️ **Backend API**: Listening on [`http://localhost:3000`](http://localhost:3000) (hot reload via `tsx`).
- 🌐 **Frontend Web**: Available on [`http://localhost:5173`](http://localhost:5173) (Vite HMR).

Turborepo multiplexes and color-codes terminal logs from both services simultaneously in real-time, allowing full-stack debugging from a single terminal window.

---

## Environment Variables Reference

### Backend API (`apps/api`)

| Variable          | Description                          | Default                       | Allowed Values / Format                                      | Required |
| :---------------- | :----------------------------------- | :---------------------------- | :----------------------------------------------------------- | :------: |
| `DATABASE_URL`    | PostgreSQL connection string         | `""`                          | `postgresql://user:pass@host:port/db?schema=public`          | **Yes**  |
| `PORT`            | HTTP server listening port           | `3000`                        | Integer between `1` and `65535`                              |    No    |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `localhost` & `127.0.0.1`     | Valid URLs (e.g. `https://my-domain.com`)                    |    No    |
| `LOG_LEVEL`       | Pino logging verbosity               | `debug` (dev) / `info` (prod) | `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent` |    No    |
| `NODE_ENV`        | Application runtime mode             | `development`                 | `development`, `production`, `test`                          |    No    |

### Frontend Web (`apps/web`)

| Variable            | Description                        | Default                 | Allowed Values / Format     | Required |
| :------------------ | :--------------------------------- | :---------------------- | :-------------------------- | :------: |
| `VITE_API_BASE_URL` | Base URL pointing to the REST API  | `http://localhost:3000` | Valid HTTP(S) URL           | **Yes**  |
| `NODE_ENV`          | Build and runtime environment mode | `development`           | `development`, `production` |    No    |

---

## Functional Specification & BDD Scenarios

Business requirements are formalized following **Behavior-Driven Development (BDD)** paradigms:

### Narrative: Optimal Supplier Selection for Replenishment

```gherkin
Narrative:
  As a: Store Procurement Manager
  I want: To evaluate and compare supplier offers for a catalog article, requested quantity, and order date
  So that: I can select the most cost-effective and feasible supplier to maximize retail margins.
```

#### Acceptance Criteria — Scenario 1: Insufficient Stock Exclusion

```gherkin
Given: The article "Philips monitor 17"" has Supplier 1 with 8 units in stock
When: I request a replenishment order of 12 units
Then: Supplier 1 is excluded from eligible suppliers due to insufficient stock.
```

#### Acceptance Criteria — Scenario 2: Compound Discount Calculation (September)

```gherkin
Given: Supplier 3 offers the monitor at 129 € with 23 units in stock
  And: Supplier 3 offers a 5% discount for orders exceeding 1,000 €
  And: Supplier 3 offers an additional 2% discount for orders placed in September
When: I request 12 units with an order date in September
Then: The base amount is 1,548.00 €
  And: The 5% discount is applied (1,470.60 €) followed by the 2% discount
  And: The final invoice amount is 1,441.19 €
  And: Supplier 3 is recommended as "Best Choice" (cheapest).
```

#### Acceptance Criteria — Scenario 3: Price vs Lead Time Trade-Off (November)

```gherkin
Given: An order date in November
  And: Supplier 2 (128 €/unit, 7 days delivery) applies a 5% discount for >10 units (1,459.20 €)
  And: Supplier 3 (129 €/unit, 4 days delivery) applies a 5% discount for >1,000 € (1,470.60 €)
When: I request 12 units with an order date in November
Then: Supplier 2 is highlighted as "Best Choice" with amount 1,459.20 €
  And: Supplier 3 displays the badge "Fastest Shipping (4 days)" allowing conscious trade-off decisions.
```

---

## Verification of Example Scenarios

Test catalog configuration for **12x Philips monitor 17"**:

| Supplier       | Unit Price | In Stock | Lead Time | Discount Rules                                        |
| :------------- | :--------: | :------: | :-------: | :---------------------------------------------------- |
| **Supplier 1** |  120.00 €  |  8 pcs   |  5 days   | 5% for orders $\ge 1,000$ €                           |
| **Supplier 2** |  128.00 €  |  15 pcs  |  7 days   | 3% for $> 5$ pcs; 5% for $> 10$ pcs                   |
| **Supplier 3** |  129.00 €  |  23 pcs  |  4 days   | 5% for orders $> 1,000$ €; additional 2% in September |

### Example 1: Quantity = 12, Order Date = September

- **Supplier 1**: Stock (8) < Required (12) $\rightarrow$ **Excluded (Insufficient Stock)**.
- **Supplier 2**: $12 \times 128 = 1,536.00$ €; discount 5% ($>10$ pcs) $\rightarrow$ **1,459.20 €** (7 days).
- **Supplier 3**: $12 \times 129 = 1,548.00$ €; discount 5% ($>1000$ €) $\rightarrow 1,470.60$ €; September discount 2% $\rightarrow$ **1,441.19 €** (4 days).
- **System Recommendation**:
  - **Best Choice**: **Supplier 3** (1,441.19 €).
  - **Fastest Shipping**: **Supplier 3** (4 days).

### Example 2: Quantity = 12, Order Date = November 2021

- **Supplier 1**: Stock (8) < Required (12) $\rightarrow$ **Excluded (Insufficient Stock)**.
- **Supplier 2**: $12 \times 128 = 1,536.00$ €; discount 5% ($>10$ pcs) $\rightarrow$ **1,459.20 €** (7 days).
- **Supplier 3**: $12 \times 129 = 1,548.00$ €; discount 5% ($>1000$ €) $\rightarrow$ **1,470.60 €** (4 days; no seasonal discount).
- **System Recommendation**:
  - **Best Choice**: **Supplier 2** (1,459.20 € $\rightarrow$ cheaper than 1,470.60 €).
  - **Fastest Shipping Badge**: Highlighted on **Supplier 3** (4 days vs 7 days).

---

## API Endpoints Reference

All endpoints return JSON responses with standard HTTP status codes:

| Method | Endpoint                  | Description                                                           |
| :----- | :------------------------ | :-------------------------------------------------------------------- |
| `GET`  | `/`                       | Root health check verifying database availability and system metrics  |
| `GET`  | `/articles`               | Catalog articles with minimum supplier offer price (`minPrice`)       |
| `GET`  | `/articles/:id`           | Detailed article specifications, supplier offers, and discount rules  |
| `POST` | `/replenishment/evaluate` | Evaluates replenishment proposals based on quantity and date criteria |

---

## Monorepo Scripts

Root commands orchestrated across packages via Turborepo:

| Command                | Action                                                                                |
| :--------------------- | :------------------------------------------------------------------------------------ |
| `pnpm run dev`         | **Launch both `@amazing/api` and `@amazing/web` concurrently with live reload**       |
| `pnpm build`           | Compile both backend (`tsc`) and frontend (`react-router build`) for production       |
| `pnpm check-types`     | Validate static TypeScript types across all workspace packages without emitting files |
| `pnpm test`            | Execute the complete Vitest test suite (65 tests across 12 files)                     |
| `pnpm lint`            | Run ESLint across all projects with auto-fix enabled                                  |
| `pnpm fmt`             | Format entire repository with Prettier                                                |
| `pnpm db:setup`        | Bootstrap PostgreSQL Docker container, poll readiness, migrate, and seed database     |
| `pnpm db:start`        | Start local PostgreSQL Docker container via Docker Compose                            |
| `pnpm db:stop`         | Stop local PostgreSQL Docker container                                                |
| `pnpm db:seed`         | Seed database with initial articles, suppliers, and discount rules                    |
| `pnpm prisma:generate` | Regenerate Prisma Client TypeScript types                                             |
| `pnpm prisma:migrate`  | Apply Prisma migrations in development mode                                           |

---

## Technologies Used & Development Setup

### Developer Environment

- **Windows Subsystem for Linux (WSL 2 — Ubuntu 24.04 LTS)**: Provides native Linux POSIX execution, Docker engine integration, and filesystem performance.
- **Visual Studio Code (VS Code)**: Unified editor with TypeScript Language Server, ESLint, Prettier, and WSL extensions.
- **Google Antigravity CLI (`antigravity`)**: Advanced agentic AI pair-programming assistant.

### Backend Stack (`@amazing/api`)

- **Node.js (v20+ / v24 LTS)**: High-performance asynchronous non-blocking event runtime.
- **TypeScript**: Static type safety, domain contracts, and compile-time verification.
- **Express.js (v5)**: Modern HTTP server with native promise rejection handling in middleware.
- **Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`, `prisma`)**: Type-safe query engine with declarative migrations and PostgreSQL driver pooling.
- **PostgreSQL 16**: Enterprise relational database ensuring ACID transactional integrity.
- **Zod**: Runtime schema validation with non-throwing configuration parsing.
- **Pino & pino-pretty**: Ultra-fast structured JSON logger with human-readable dev output.
- **Vitest & Supertest**: Fast Vite-native unit testing and in-memory HTTP integration testing.

### Frontend Stack (`@amazing/web`)

- **React 19**: Modern UI library with concurrent rendering and hooks.
- **React Router v7 (SPA Mode)**: Declarative client-side routing, automated route `typegen`, and layout hierarchy.
- **Material UI v9 & Emotion**: Accessible, production-grade UI component system with CSS variables theming.
- **Tailwind CSS v4 (`@tailwindcss/vite`)**: Utility-first CSS engine integrated via Vite plugin.
- **Axios**: Centralized HTTP client with configured baseURL and timeout handling.
- **Inter Font (`@fontsource-variable/inter`)**: High-legibility modern variable font.

### Monorepo & Build Tooling

- **Turborepo**: High-performance build system with intelligent task pipelines and caching.
- **pnpm Workspaces**: Fast, disk-efficient package management with strict dependency isolation.
- **Docker Compose**: Single-command containerized database provisioning.

---

## Architectural Decisions & Directory Structure

For an exhaustive, directory-by-directory breakdown of the codebase architecture, design patterns, and file organization, refer to the dedicated architectural documentation:

👉 **[`docs/architectural-decisions.md`](docs/architectural-decisions.md)**

It provides comprehensive architectural rationales for:

- Separation of Concerns and Clean Architecture boundaries.
- Pure domain functions in `apps/api/src/lib/` for zero-mock testing.
- Single Responsibility Principle (one function per file, `kebab-case` naming).
- Non-throwing environment validation pattern.
- App factory pattern (`createApp`) for isolated parallel integration testing.
- Database health guard and Italian maintenance splash screen in `apps/web`.

---

## AI / Agents Usage

This project utilized Google's **Antigravity CLI** (`antigravity`) as an agentic AI pair-programming assistant throughout the design, development, testing, and documentation of both `@amazing/api` and `@amazing/web`.

Antigravity was employed to:

- **Complete Test Suite Development**:
  - Architected and implemented the entire test suite ([`apps/api/tests/`](apps/api/tests/)), comprising 65 test cases across 12 files spanning unit tests, pure domain logic tests, controller tests, middleware tests, and Supertest end-to-end integration tests.
- **Database Availability Guard & Maintenance HOC**:
  - Designed the database availability check pipeline inspecting `GET /` on `VITE_API_BASE_URL`.
  - Implemented the [`withDatabaseHealth`](apps/web/app/hoc/with-database-health.tsx) HOC and [`DatabaseHealthGuard`](apps/web/app/components/DatabaseHealthGuard.tsx) wrapper in `@amazing/web`.
  - Created the user-friendly Italian [`MaintenanceSplashScreen`](apps/web/app/components/MaintenanceSplashScreen.tsx) with automatic 30-second interval polling recovery and interactive retry, completely removing technical jargon from end-user views.
- **Code Quality & Refactoring**:
  - Enforced the Single Responsibility Principle by decoupling monolithic handlers into modular, single-function files named in `kebab-case`.
  - Extracted core pricing and replenishment logic into pure domain functions in `apps/api/src/lib/`.
  - Resolved complex ESLint v9 and Unicorn rules (`unicorn/prefer-ternary`, `unicorn/prefer-simple-condition-first`, `unicorn/no-unnecessary-global-this`).
  - Upgraded the React Router [`ErrorBoundary`](apps/web/app/root.tsx) in `@amazing/web` with Material UI components, 404 handling, and development stack traces.
- **Database Seeding & DevOps Scripts**:
  - Engineered the idempotent database seed pipeline ([`apps/api/prisma/seed/`](apps/api/prisma/seed/)) with modular datasets and upserters.
  - Built [`apps/api/scripts/postgres-setup.ts`](apps/api/scripts/postgres-setup.ts) for automated Docker container lifecycle management, health polling, and migration runner.
- **Documentation & JSDoc Standards**:
  - Generated comprehensive documentation across the monorepo: [`README.md`](README.md), [`apps/api/README.md`](apps/api/README.md), [`apps/web/README.md`](apps/web/README.md), and [`docs/architectural-decisions.md`](docs/architectural-decisions.md).
  - Enriched JSDoc comments, parameter annotations, and return types across all TypeScript files.
- **Architectural Exploration**:
  - Rigorously tested and challenged code implementations, explored multiple design alternatives, identified edge cases, and refined solutions for optimal maintainability, resilience, and performance.
