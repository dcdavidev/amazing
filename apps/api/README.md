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
