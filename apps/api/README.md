# @amazing/api

Backend REST API for the **Amazing Shop** stock replenishment evaluation system. Built with Node.js, Express, Prisma ORM, PostgreSQL, Zod validation, and Vitest.

---

## Getting Started with @amazing/api

### 1. Bootstrapping the Database: Docker or Creating Your Own

#### Option A: Bootstrapping with Docker (Recommended for Development)

A ready-to-use Docker Compose configuration and automated setup script are provided:

- **Automated setup**:

  ```bash
  # From apps/api directory:
  pnpm db:setup
  
  # Or from repository root:
  pnpm --filter @amazing/api db:setup
  ```

  This command will:
  1. Verify Docker is installed and running.
  2. Start the PostgreSQL 16 container (`amazing-postgres` on port `5432`).
  3. Wait until the database health check passes.
  4. Automatically run Prisma migrations (`prisma migrate dev`) and seed the database.

- **Manual Docker container commands**:

  ```bash
  # Start the PostgreSQL container in background:
  pnpm db:start # runs `docker compose up -d`
  
  # Stop the PostgreSQL container:
  pnpm db:stop # runs `docker compose down`
  ```

- **Default Docker Credentials**:
  - **Host**: `localhost`
  - **Port**: `5432`
  - **Database**: `amazing_db`
  - **User**: `postgres`
  - **Password**: `postgres`
  - **Connection string**:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amazing_db?schema=public"
    ```

#### Option B: Creating Your Own Database (Local or Cloud)

If you prefer using an external PostgreSQL instance (e.g. system PostgreSQL, Neon, Supabase, AWS RDS, Prisma Postgres):

1. Create a PostgreSQL database instance (e.g. `amazing_db`).
2. Copy the environment configuration template:
   ```bash
   cp .env.development .env
   ```
3. Update `DATABASE_URL` in `.env` with your connection string:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=public"
   ```

---

### 2. Database Migrations (`deploy` and `dev`)

Prisma manages schema migrations located in [`prisma/migrations`](prisma/migrations).

- **Generate Prisma Client**:
  Regenerate the TypeScript client whenever the schema changes:

  ```bash
  pnpm prisma:generate # runs `prisma generate`
  ```

- **Development Migrations (`dev`)**:
  Applies pending migrations, creates new migration files when schema changes are detected, and runs database seeding:

  ```bash
  pnpm prisma:migrate # runs `prisma migrate dev`
  ```

- **Deployment / Production Migrations (`deploy`)**:
  Applies all pending migrations without creating new migration files or prompting for input (standard for production and CI/CD pipelines):
  ```bash
  pnpm exec prisma migrate deploy
  ```

---

### 3. Database Seeding

Populate the database with initial catalog articles, suppliers, lead times, and discount rules:

```bash
pnpm db:seed # runs `prisma db seed` (alias: pnpm prisma:seed)
```

The modular seed script ([`prisma/seed.ts`](prisma/seed.ts)) inserts:

- **Articles**: Catalog articles (e.g. _Philips monitor 17"_).
- **Suppliers**: Supplier 1, Supplier 2, and Supplier 3 with their unit purchase prices, stock availability, and shipping days (`minDaysToShip`).
- **Discount Rules**:
  - `MIN_TOTAL_AMOUNT`: Percentage discount when base order amount reaches a threshold (e.g., 5% over 1,000 €).
  - `MIN_QUANTITY`: Tiered quantity discounts (e.g., 3% for >5 units, 5% for >10 units).
  - `MONTH_PERIOD`: Seasonal / monthly discounts (e.g., 2% discount for orders placed in September).

---

### 4. Running the Server

- **Development mode (with hot reloading via `tsx`)**:

  ```bash
  pnpm dev # runs `tsx watch src/index.ts`
  ```

  The API listens by default at `http://localhost:3000`.

- **Build for production**:

  ```bash
  pnpm build # runs `tsc`
  ```

- **Start production build**:
  ```bash
  pnpm start # runs `node dist/index.js`
  ```

---

## Environment Variables

All environment variables are validated at startup with **Zod** schemas ([`src/configs/env.ts`](src/configs/env.ts)). If a variable is invalid, descriptive errors are logged with remediation advice while falling back to safe defaults where possible:

| Variable          | Description                           | Default                       | Allowed Values / Format                                      |
| :---------------- | :------------------------------------ | :---------------------------- | :----------------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string          | `""`                          | Valid URL starting with `postgresql://` or `postgres://`     |
| `PORT`            | TCP listening port for Express server | `3000`                        | Integer between `1` and `65535`                              |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins  | `localhost` & `127.0.0.1`     | Valid URLs (e.g. `https://my-app.vercel.app`)                |
| `LOG_LEVEL`       | Pino logging verbosity                | `debug` (dev) / `info` (prod) | `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent` |
| `NODE_ENV`        | Runtime environment mode              | `development`                 | `development`, `production`, `test`                          |

---

## Testing

The project uses **[Vitest](https://vitest.dev/)** and **[Supertest](https://github.com/ladjs/supertest)** for testing:

- **Run all tests once**:

  ```bash
  pnpm test # runs `vitest run`
  ```

- **Run in watch mode**:
  ```bash
  pnpm test:watch # runs `vitest`
  ```

Tests are organized in the [`tests/`](tests/) directory outside `src/`:

- `tests/configs/`: Zod environment variables validation and configuration fallback tests.
- `tests/lib/`: Pure domain functions for discount calculations, replenishment evaluation, and rounding precision.
- `tests/middlewares/`: Database connectivity checks and `503 Service Unavailable` handling.
- `tests/controllers/`: Request validation, business logic orchestration, and error response handling.
- `tests/integration/`: Supertest HTTP end-to-end endpoint tests.
- `tests/seed/`: Seeder idempotency and discount rule matcher tests.

---

## API Endpoints Reference

| Method | Endpoint                  | Description                                                   |
| :----- | :------------------------ | :------------------------------------------------------------ |
| `GET`  | `/`                       | Health check endpoint returning database connectivity status  |
| `GET`  | `/articles`               | Returns catalog articles with minimum starting price          |
| `GET`  | `/articles/:id`           | Returns article details, supplier offers, and discount rules  |
| `POST` | `/replenishment/evaluate` | Evaluates replenishment options across all eligible suppliers |

### `POST /replenishment/evaluate` Example

**Request**:

```json
{
  "articleId": "e4b9c1d0-1234-4567-890a-bcdef0123456",
  "quantity": 12,
  "orderDate": "2026-09-24T12:00:00.000Z"
}
```

**Response (200 OK)**:

```json
{
  "requestedArticleId": "e4b9c1d0-1234-4567-890a-bcdef0123456",
  "requestedQuantity": 12,
  "orderDate": "2026-09-24T12:00:00.000Z",
  "eligibleSuppliers": [
    {
      "supplierId": "sup-3-uuid",
      "supplierName": "Supplier 3",
      "minDaysToShip": 4,
      "baseAmount": 1548,
      "totalDiscountPercentage": 6.9,
      "finalAmount": 1441.19,
      "isCheapest": true
    },
    {
      "supplierId": "sup-2-uuid",
      "supplierName": "Supplier 2",
      "minDaysToShip": 7,
      "baseAmount": 1536,
      "totalDiscountPercentage": 5,
      "finalAmount": 1459.2,
      "isCheapest": false
    }
  ],
  "excludedSuppliers": [
    {
      "supplierId": "sup-1-uuid",
      "supplierName": "Supplier 1",
      "reason": "INSUFFICIENT_STOCK"
    }
  ]
}
```

---

## Available Scripts

| Script                 | Command                         | Description                                                      |
| :--------------------- | :------------------------------ | :--------------------------------------------------------------- |
| `pnpm dev`             | `tsx watch src/index.ts`        | Start development server with live reload                        |
| `pnpm build`           | `tsc`                           | Compile TypeScript into `dist/`                                  |
| `pnpm start`           | `node dist/index.js`            | Run compiled JavaScript server                                   |
| `pnpm test`            | `vitest run`                    | Execute test suite once                                          |
| `pnpm test:watch`      | `vitest`                        | Run test suite in watch mode                                     |
| `pnpm check-types`     | `tsc --noEmit`                  | Validate static types without emitting files                     |
| `pnpm db:setup`        | `tsx scripts/postgres-setup.ts` | Bootstrap Docker container, wait for readiness, migrate and seed |
| `pnpm db:start`        | `docker compose up -d`          | Start PostgreSQL container via Docker Compose                    |
| `pnpm db:stop`         | `docker compose down`           | Stop PostgreSQL container                                        |
| `pnpm db:seed`         | `prisma db seed`                | Seed database with initial articles and suppliers                |
| `pnpm prisma:generate` | `prisma generate`               | Generate Prisma Client types                                     |
| `pnpm prisma:migrate`  | `prisma migrate dev`            | Apply migrations in development environment                      |

---

## Architectural Decisions & Directory Structure

`@amazing/api` is structured according to **Clean Architecture**, the **Single Responsibility Principle (SRP)**, and strict modularity. Every directory and file has a well-defined responsibility:

```text
apps/api/
├── prisma/                      # Database schema, migrations, and seed scripts
│   ├── migrations/              # Immutable SQL migration history tracked by Prisma
│   └── seed/                    # Modular, idempotent database seeding pipeline
│       ├── data/                # Static seed datasets isolated by entity type
│       ├── upserters/           # Idempotent upsert logic preventing destructive table resets
│       ├── client.ts            # Dedicated Prisma client instance for seeding operations
│       └── types.ts             # TypeScript interfaces for raw seed datasets
├── scripts/                     # DevOps, bootstrap, and development automation tooling
│   └── postgres-setup.ts        # Automated Docker container lifecycle and migration runner
├── src/                         # Application source code
│   ├── configs/                 # Runtime configurations and environment variable validation
│   │   ├── env/                 # Dedicated Zod parsers and non-throwing schema validators
│   │   ├── allowed-origins.ts   # CORS configuration with automatic localhost regex rules
│   │   ├── env.ts               # Validated environment singleton accessor
│   │   ├── load-env.ts          # Centralized dotenvx loader (.env.development -> .env)
│   │   └── port.ts              # Express listening port configuration
│   ├── controllers/             # Express HTTP controllers (one function per file, kebab-case)
│   ├── generated/               # Output directory for third-party compiler/tool code
│   │   └── prisma/              # Prisma Client and model types generated by prisma generate
│   ├── lib/                     # Pure domain logic, algorithms, and infrastructure helpers
│   ├── middlewares/             # Express middlewares (database health check, rate limiting)
│   ├── repositories/            # Data access layer abstracting Prisma ORM queries
│   ├── routes/                  # Express route modular definitions
│   ├── types/                   # Strict TypeScript domain interfaces partitioned by domain
│   ├── app.ts                   # Express application factory (createApp) for isolated testing
│   ├── index.ts                 # Server entry point with startup handling and graceful shutdown
│   └── logger.ts                # Centralized Pino logger with pino-pretty for development
└── tests/                       # Complete Vitest test suite mirrored outside src/
    ├── configs/                 # Unit tests for Zod validation schemas and fallbacks
    ├── controllers/             # Unit tests for controller handlers and error paths
    ├── integration/             # Supertest HTTP end-to-end endpoint tests
    ├── lib/                     # Tests for pure domain functions (discounts, replenishment)
    ├── middlewares/             # Tests for database connectivity check middleware
    ├── repositories/            # Tests for domain entity mapping from Prisma records
    └── seed/                    # Seeder data integrity and discount rule matcher tests
```

### Directory-by-Directory Architectural Rationale

#### 1. `prisma/`

- **`prisma/schema.prisma`**: The single source of truth for database models (`Article`, `Supplier`, `SupplierOffer`, `DiscountRule`), relations, and indexing.
- **`prisma/migrations/`**: Contains version-controlled SQL migration files generated by `prisma migrate dev`. Every migration represents an immutable transition of the schema state.
- **`prisma/seed/`**: Instead of a giant monolithic seed script, the seed system is broken into modular layers:
  - **`prisma/seed/data/`**: Version-controlled seed datasets partitioned into `articles.ts`, `suppliers.ts`, and bundled via `index.ts`.
  - **`prisma/seed/upserters/`**: Implements idempotent check-and-upsert logic (`upsert-article.ts`, `upsert-supplier.ts`, `upsert-supplier-offer.ts`, `upsert-discount-rules.ts`, `is-discount-rule-match.ts`). Existing records are preserved and updated only if drifted, avoiding destructive database truncation.

#### 2. `scripts/`

- **Purpose**: Keeps DevOps, Docker orchestration, and automation scripts cleanly decoupled from the production API code in `src/`.
- **`scripts/postgres-setup.ts`**: Verifies local Docker installation, starts the PostgreSQL 16 container, polls for database readiness via `pg_isready`, and applies Prisma migrations.

#### 3. `src/` (Production Application Code)

- **`src/configs/`**:
  - **`src/configs/env/`**: Houses independent Zod parsing schemas for each environment variable (`parse-port.ts`, `parse-node-env.ts`, `parse-log-level.ts`, `parse-database-url.ts`, `parse-allowed-origins.ts`, `validate-env.ts`). Adopts a **non-throwing validation pattern**: invalid values emit actionable `console.error` diagnostic guides and apply safe fallbacks, preventing immediate crashes while facilitating developer onboarding.
  - **`src/configs/load-env.ts`**: Centralizes `@dotenvx/dotenvx` initialization with explicit cascading paths (`.env.development` prioritized over `.env`), `overload: true`, and error suppression for missing files (`ignore: ['MISSING_ENV_FILE']`).
- **`src/controllers/`**:
  - Follows the **Single Responsibility Principle**: each file exports a single Express controller named in `kebab-case` matching the exported function (`get-articles.ts` -> `getArticles`, `get-article-by-id.ts` -> `getArticleById`, `evaluate-replenishment.ts` -> `evaluateReplenishment`, `get-health.ts` -> `getHealth`).
  - Controllers orchestrate HTTP parsing, invoke repositories and domain functions, and format JSON responses without containing database queries or raw business calculations.
- **`src/generated/`**:
  - **Separation of Generated Code**: Relocated from `src/models/` to `src/generated/prisma/` to strictly separate tool-generated ORM artifacts from handcrafted application logic. Ignored by ESLint via `globalIgnores` to avoid linting vendor code.
- **`src/lib/`**:
  - **Pure Domain Logic**: Contains core business logic (`discount.ts`, `replenishment.ts`, `round.ts`) written as pure, deterministic functions free of HTTP or database side effects. Scounts, compound discount stacking, tiered quantities, and tie-breaking algorithms are directly testable in isolation without mocking.
  - **Infrastructure Helpers**: Contains database availability checkers (`check-database-status.ts`, `is-database-url-set.ts`), the global Prisma client singleton (`prisma.ts`), and HTTP server lifecycle utilities (`start-server.ts`, `setup-graceful-shutdown.ts`).
- **`src/middlewares/`**:
  - Express middleware functions. Houses `check-database.ts`, which verifies PostgreSQL connectivity before route dispatch, returning `503 Service Unavailable` with troubleshooting hints if the database is offline, while bypassing the root `/` health check.
- **`src/repositories/`**:
  - The persistence abstraction layer isolating Prisma queries from controllers. Direct Prisma queries live exclusively in repository files (`get-articles.ts`, `get-article-by-id.ts`, `get-offers-by-article-id.ts`).
  - `map-discount-record.ts` converts Prisma database models into strongly-typed domain structures.
- **`src/routes/`**:
  - Express routers grouping endpoints by resource (`article.ts`, `health.ts`, `replenishment.ts`), keeping routing declarations clean and decoupled from server bootstrapping.
- **`src/types/`**:
  - Domain-driven TypeScript type definitions partitioned by domain entity (`article.ts`, `discount.ts`, `env.ts`, `health.ts`, `replenishment.ts`, `supplier.ts`).
- **`src/app.ts` vs `src/index.ts` (Factory Pattern)**:
  - **`src/app.ts`**: Exports the `createApp()` factory function that initializes Express middleware and routes without binding to a network port. This enables Supertest integration tests to execute in parallel without port conflicts.
  - **`src/index.ts`**: The executable entrypoint that imports `load-env.ts`, creates the Express app, binds to the HTTP port via `startServer()`, and attaches `setupGracefulShutdown()` listeners for `SIGTERM` and `SIGINT`.

#### 4. `tests/`

- **Location outside `src/`**: Keeps test files, mocks, and fixtures out of the production build output (`dist/`).
- **`tests/` vs `__test__`**: Named `tests/` to comply with the project-wide ESLint rule `unicorn/filename-case` (`kebabCase`), avoiding linting errors caused by leading/trailing underscores.
- **Structure**: Mirrored directly against the application structure (`configs/`, `controllers/`, `integration/`, `lib/`, `middlewares/`, `repositories/`, `seed/`), facilitating discoverability and maintenance.

---

## Technologies Used

`@amazing/api` was built using a curated stack of modern, production-grade technologies chosen to maximize type safety, developer velocity, execution performance, and architectural maintainability:

### Core Runtime & Language

- **[Node.js](https://nodejs.org/) (v20+ / ESM)**:
  - **Role**: JavaScript runtime executing the API service.
  - **Why chosen**: Proven non-blocking, event-driven I/O ideal for scalable microservices and API gateways; native ECMAScript Modules (`"type": "module"`) align with modern JavaScript standards.
- **[TypeScript](https://www.typescriptlang.org/)**:
  - **Role**: Primary programming language across the entire codebase.
  - **Why chosen**: Provides strict static typing, compile-time error detection, and rich IDE intellisense. Coupled with domain models ([`src/types/`](src/types/)), TypeScript guarantees compile-time contract safety across controllers, repositories, and domain algorithms.

### HTTP Framework & Middleware

- **[Express.js](https://expressjs.com/) (v5)**:
  - **Role**: Minimalist web application framework and routing layer.
  - **Why chosen**: Version 5 introduces native promise rejection handling in middleware and route handlers, eliminating the need for boilerplate `asyncHandler` wrappers while retaining Express's battle-tested stability and expansive middleware ecosystem.
- **[Pino](https://getpino.io/) (`pino`, `pino-http`, `pino-pretty`)**:
  - **Role**: High-speed, structured JSON logging.
  - **Why chosen**: Exceptionally low runtime overhead compared to legacy loggers (e.g. Winston); outputs machine-readable JSON logs for production observability while enabling formatted terminal output during development via `pino-pretty`.
- **Security & Optimization Middlewares**:
  - **`cors`**: Granular Cross-Origin Resource Sharing control with regex-based matching for dynamic local development origins.
  - **`compression`**: Deflate/Gzip response payload compression to minimize network payload sizes.
  - **`hpp`**: Protection against HTTP Parameter Pollution attacks by filtering duplicate query parameters.
  - **`express-rate-limit`**: Rate-limiting defense mechanism preventing endpoint abuse and denial-of-service traffic spikes.

### Database & Persistence Layer

- **[Prisma ORM 7](https://www.prisma.io/) (`@prisma/client`, `@prisma/adapter-pg`, `prisma`)**:
  - **Role**: Schema modeling, automated migrations, and type-safe database access layer.
  - **Why chosen**: Prisma 7 generates strictly typed query clients directly from [`schema.prisma`](prisma/schema.prisma), preventing schema drift and typos in SQL queries. Incorporates `@prisma/adapter-pg` to utilize direct PostgreSQL connection pools for optimal throughput.
- **[PostgreSQL 16](https://www.postgresql.org/)**:
  - **Role**: Relational database management system.
  - **Why chosen**: Industry benchmark for ACID compliance, relational integrity (foreign keys, cascading rules), reliable transaction handling, and advanced indexing for article catalogs and supplier offer lookups.

### Validation & Configuration

- **[Zod](https://zod.dev/)**:
  - **Role**: TypeScript-first runtime schema definition and validation.
  - **Why chosen**: Allows declaring validation schemas that automatically infer TypeScript types. Used in [`src/configs/env/`](src/configs/env/) with a non-throwing design pattern to validate environment variables and provide clear diagnostic logs with safe fallback values.
- **[Dotenvx](https://dotenvx.com/) (`@dotenvx/dotenvx`)**:
  - **Role**: Multi-environment variable resolution and injection.
  - **Why chosen**: Supports prioritized multi-file cascading (`.env.development` overriding `.env`), error suppression for optional files (`ignore: ['MISSING_ENV_FILE']`), and seamless secrets management across development, CI, and staging environments.

### Testing & Quality Assurance

- **[Vitest](https://vitest.dev/)**:
  - **Role**: Next-generation test runner.
  - **Why chosen**: Native ESM support, instant TypeScript execution via Vite without transpile overhead, blazing-fast parallel test execution, and rich Jest-compatible assertions.
- **[Supertest](https://github.com/ladjs/supertest)**:
  - **Role**: HTTP assertion library for integration testing.
  - **Why chosen**: Enables end-to-end HTTP request testing against Express apps in-memory without binding to live network sockets, eliminating port collisions during parallel test runs.

### DevOps & Tooling

- **[Docker Compose](https://docs.docker.com/compose/)**:
  - **Role**: Containerized local database infrastructure.
  - **Why chosen**: Enables single-command provisioning of PostgreSQL 16 with pre-configured persistent volumes and healthcheck endpoints, ensuring zero-friction developer onboarding.
- **[tsx](https://github.com/privatenumber/tsx)**:
  - **Role**: TypeScript execution and live-reload development runner.
  - **Why chosen**: Powered by `esbuild`, delivering near-instant execution of TypeScript files without manual compilation steps.
- **[Turborepo](https://turbo.build/repo)**:
  - **Role**: High-performance monorepo orchestration.
  - **Why chosen**: Fast build pipeline caching and dependency-aware parallel task execution across packages.

---

## Agents / AI Usage

This project utilized Google's **Antigravity CLI** (`antigravity`) as an agentic AI pair-programming assistant throughout the development of `@amazing/api`.

Antigravity was employed to:

- **Test Suite Creation**: Designed and implemented the complete Vitest and Supertest test suite ([`tests/`](tests/)) covering 65 test cases across unit, domain logic, middleware, controller, and integration layers.
- **Documentation**: Generated and structured detailed documentation, including this [`README.md`](README.md) and getting started workflows.
- **JSDoc Enhancements**: Enriched and standardized JSDoc documentation, parameter descriptions, and return annotations across all TypeScript files.
- **Database Seeding**: Architected the modular, idempotent database seed pipeline ([`prisma/seed/`](prisma/seed/)) with isolated datasets and upserters.
- **Automation Scripts**: Developed DevOps helper scripts, such as [`scripts/postgres-setup.ts`](scripts/postgres-setup.ts) for automated Docker container bootstrapping, health polling, and migration orchestration.
- **Code Review & Exploration**: Broadly used to rigorously test and challenge developer-written code, explore multiple architectural alternatives, identify edge cases, and refine solutions for optimal maintainability, type safety, and performance.
