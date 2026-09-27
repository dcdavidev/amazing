# Architectural Decisions & Monorepo Directory Structure

This document details the architectural decisions, design patterns, and comprehensive directory structure of the **Amazing Shop** monorepo codebase.

---

## 1. Monorepo Architecture Overview

The repository is organized as a unified monorepo managed with **[Turborepo](https://turbo.build/repo)** and **[pnpm workspaces](https://pnpm.io/workspaces)**. This architecture ensures code modularity, strict package isolation, shared configuration reuse, and accelerated task caching across both frontend and backend projects.

```text
amazing/
├── apps/
│   ├── api/                         # Backend REST API service (Node.js, Express, Prisma ORM)
│   └── web/                         # Frontend Web application (React 19, React Router v7, Material UI)
├── docs/                            # Project documentation, specifications, and architecture guides
│   ├── architectural-decisions.md   # This comprehensive architectural decisions record
│   └── Test-Prompt.pdf              # Original specification and functional test prompt
├── packages/
│   └── typescript-config/           # Shared, standardized TypeScript configuration profiles
│       ├── base.json                # Foundational compiler options
│       ├── node.json                # Node.js backend compiler options
│       ├── react.json               # React and JSX compiler options
│       └── package.json             # Workspace package manifest
├── package.json                     # Monorepo root scripts and devDependencies
├── pnpm-workspace.yaml              # pnpm workspace definition (apps/*, packages/*)
├── turbo.json                       # Turborepo task pipelines and caching rules
├── eslint.config.mjs                # Unified ESLint v9 flat configuration
└── README.md                        # Root getting started and overview guide
```

---

## 2. Backend Architecture: `apps/api`

The API backend is structured according to **Clean Architecture** principles and the **Single Responsibility Principle (SRP)**. Every directory and file serves a distinct, isolated function.

```text
apps/api/
├── prisma/                          # Database schema, migrations, and seed pipeline
│   ├── migrations/                  # Immutable, version-controlled SQL migration history
│   ├── seed/                        # Modular, idempotent database seeding system
│   │   ├── data/                    # Version-controlled seed datasets
│   │   │   ├── articles.ts          # Catalog articles dataset
│   │   │   ├── suppliers.ts         # Suppliers, offers, and discount rules dataset
│   │   │   └── index.ts             # Dataset aggregator
│   │   ├── upserters/               # Idempotent database upserters
│   │   │   ├── is-discount-rule-match.ts # Comparator for discount rule equality
│   │   │   ├── upsert-article.ts    # Upserter for Article records
│   │   │   ├── upsert-discount-rules.ts # Upserter for DiscountRule records
│   │   │   ├── upsert-supplier.ts   # Upserter for Supplier records
│   │   │   └── upsert-supplier-offer.ts # Upserter for SupplierOffer records
│   │   ├── client.ts                # Dedicated Prisma client singleton for seeding
│   │   └── types.ts                 # TypeScript types for raw seed datasets
│   ├── schema.prisma                # Database models (Article, Supplier, SupplierOffer, DiscountRule)
│   └── seed.ts                      # Seeder entry point
├── scripts/                         # DevOps and local infrastructure automation
│   └── postgres-setup.ts            # Automated Docker lifecycle, health polling, and migration runner
├── src/                             # Production application source code
│   ├── configs/                     # Runtime configurations and environment variable validation
│   │   ├── env/                     # Dedicated Zod parsers for environment variables
│   │   │   ├── parse-allowed-origins.ts # CORS origins parser with localhost regex rules
│   │   │   ├── parse-database-url.ts    # PostgreSQL connection string parser
│   │   │   ├── parse-log-level.ts       # Pino log level parser
│   │   │   ├── parse-node-env.ts        # Node runtime environment mode parser
│   │   │   ├── parse-port.ts            # TCP listening port parser
│   │   │   └── validate-env.ts          # Aggregate non-throwing environment validator
│   │   ├── allowed-origins.ts       # Evaluated CORS allowed origins configuration
│   │   ├── env.ts                   # Validated environment configuration singleton
│   │   ├── load-env.ts              # Centralized dotenvx loader (.env.development -> .env)
│   │   └── port.ts                  # Server port configuration
│   ├── controllers/                 # HTTP controllers (one function per file, kebab-case)
│   │   ├── evaluate-replenishment.ts # POST /replenishment/evaluate handler
│   │   ├── get-article-by-id.ts     # GET /articles/:id handler
│   │   ├── get-articles.ts          # GET /articles handler
│   │   └── get-health.ts            # GET / health and diagnostics handler
│   ├── generated/                   # Tool-generated code separated from hand-written logic
│   │   └── prisma/                  # Generated Prisma Client and model type definitions
│   ├── lib/                         # Pure domain logic, algorithms, and infrastructure helpers
│   │   ├── check-database-status.ts # PostgreSQL query and migration table availability checker
│   │   ├── discount.ts              # Pure discount computation and qualification algorithms
│   │   ├── is-database-url-set.ts   # Evaluator checking DATABASE_URL presence and validity
│   │   ├── prisma.ts                # Global Prisma Client instance with @prisma/adapter-pg
│   │   ├── replenishment.ts         # Pure supplier comparison and recommendation algorithm
│   │   ├── round.ts                 # Accounting round-to-two-decimals utility with epsilon
│   │   ├── setup-graceful-shutdown.ts # SIGINT/SIGTERM listener for safe connection termination
│   │   └── start-server.ts          # HTTP server bootstrap and port conflict handler
│   ├── middlewares/                 # Express middleware pipeline
│   │   └── check-database.ts        # Database availability verification middleware
│   ├── repositories/                # Persistence abstraction layer isolating Prisma queries
│   │   ├── get-article-by-id.ts     # Retrieves article details and supplier offers
│   │   ├── get-articles.ts          # Retrieves catalog articles with minimum offer prices
│   │   ├── get-offers-by-article-id.ts # Retrieves supplier offers for a specific article
│   │   └── map-discount-record.ts   # Maps raw Prisma records to domain DiscountRule entities
│   ├── routes/                      # Modular Express route definitions
│   │   ├── article.ts               # Routes for /articles and /articles/:id
│   │   ├── health.ts                # Root route for / health check
│   │   └── replenishment.ts         # Routes for /replenishment/evaluate
│   ├── types/                       # Domain TypeScript interfaces partitioned by entity
│   │   ├── article.ts               # Article domain models and catalog response types
│   │   ├── discount.ts              # Discount rule models and calculation structures
│   │   ├── env.ts                   # Environment variable types
│   │   ├── health.ts                # Health status and database state interfaces
│   │   ├── replenishment.ts         # Replenishment request payloads and response contracts
│   │   └── supplier.ts              # Supplier metadata and offer interfaces
│   ├── app.ts                       # Express application factory (createApp) for isolated testing
│   ├── index.ts                     # Executable server entrypoint with lifecycle management
│   └── logger.ts                    # Centralized Pino logger with pino-pretty for development
└── tests/                           # Complete test suite mirrored outside src/
    ├── configs/                     # Unit tests for Zod validation schemas and fallbacks
    ├── controllers/                 # Unit tests for controller handlers and error paths
    ├── integration/                 # Supertest HTTP end-to-end integration tests
    ├── lib/                         # Tests for pure domain functions (discounts, replenishment)
    ├── middlewares/                 # Tests for database connectivity middleware
    ├── repositories/                # Tests for domain entity mapping
    └── seed/                        # Seeder data integrity and discount rule matcher tests
```

### Directory-by-Directory Rationale for `apps/api`

1. **`prisma/` (Database Management)**:
   - Separates SQL migration history (`prisma/migrations/`) from application runtime logic.
   - Deconstructs seeding into modular datasets (`seed/data/`) and idempotent upserters (`seed/upserters/`), preventing destructive table truncation and enabling non-destructive data synchronization.

2. **`scripts/` (DevOps & Automation)**:
   - Isolates infrastructure scripts from production bundle dependencies.
   - `postgres-setup.ts` manages Docker PostgreSQL 16 container bootstrapping, readiness polling via `pg_isready`, and automatic migration/seeding.

3. **`src/configs/` (Non-Throwing Validation)**:
   - Validates each environment variable using isolated Zod schemas in `configs/env/`.
   - Uses a **non-throwing validation pattern**: invalid values emit actionable diagnostic advice in `console.error` while falling back to safe defaults, preventing sudden crashes during developer onboarding.
   - Centralizes environment variable injection in `configs/load-env.ts` with cascading overrides (`.env.development` over `.env`) and missing-file error suppression (`ignore: ['MISSING_ENV_FILE']`).

4. **`src/controllers/` (Single Responsibility Principle)**:
   - Each file exports a single controller function in `kebab-case` matching the exported function name (`get-articles.ts` $\rightarrow$ `getArticles`).
   - Controllers orchestrate HTTP parsing and response formatting, delegating database queries to repositories and calculations to pure domain functions.

5. **`src/generated/` (Separation of Generated Code)**:
   - Isolates auto-generated Prisma Client artifacts (`src/generated/prisma/`) from developer-written source code, excluded from ESLint checks.

6. **`src/lib/` (Pure Domain Functions)**:
   - Encapsulates business logic (`discount.ts`, `replenishment.ts`, `round.ts`) as pure, deterministic functions free of database or HTTP dependencies, enabling instant unit testing without mocking.
   - Houses infrastructure helpers (`start-server.ts`, `setup-graceful-shutdown.ts`, `check-database-status.ts`).

7. **`src/middlewares/` (Request Pipeline Guards)**:
   - `check-database.ts` validates database connectivity before dispatching business routes, returning `503 Service Unavailable` with troubleshooting hints if PostgreSQL is offline, while bypassing the root `/` health check.

8. **`src/repositories/` (Data Access Abstraction)**:
   - Directly encapsulates all Prisma ORM queries, shielding controllers from database access details and mapping database records into strongly-typed domain entities.

9. **`src/app.ts` vs `src/index.ts` (Factory Pattern)**:
   - `src/app.ts`: Exports `createApp()` to configure Express routes and middleware without binding to a network port, allowing Supertest integration tests to execute in parallel without port conflicts.
   - `src/index.ts`: Executable entrypoint that calls `createApp()`, binds to `PORT`, and attaches `SIGTERM`/`SIGINT` graceful shutdown handlers.

10. **`tests/` (Test Organization)**:
    - Located outside `src/` to prevent test utilities, mocks, and fixtures from leaking into production builds (`dist/`).
    - Named `tests/` instead of `__tests__` to strictly adhere to the `unicorn/filename-case` (`kebabCase`) ESLint rule.

---

## 3. Frontend Architecture: `apps/web`

The frontend client is built as a modern Single Page Application (SPA) using React 19, React Router v7, Material UI, and Tailwind CSS.

```text
apps/web/
├── public/                          # Static assets served at root
│   ├── articles/                    # High-resolution product images
│   ├── logo/                        # Application logo assets (square.png)
│   ├── apple-touch-icon.png         # iOS touch icon
│   ├── favicon-96x96.png            # Modern PNG favicon
│   ├── favicon.ico                  # Fallback ICO favicon
│   ├── favicon.svg                  # Vector SVG favicon
│   └── site.webmanifest             # Web App Manifest
├── app/                             # React application source code
│   ├── components/                  # Reusable UI presentation and guard components
│   │   ├── DatabaseHealthGuard.tsx  # Guard component intercepting unavailable database states
│   │   ├── LoadingScreen.tsx        # Centered circular progress loading screen
│   │   └── MaintenanceSplashScreen.tsx # Full-screen Italian maintenance splash screen
│   ├── configs/                     # Centralized client configuration
│   │   ├── api.ts                   # Pre-configured Axios instance with VITE_API_BASE_URL resolution
│   │   └── theme.ts                 # Material UI theme definition with CSS variables support
│   ├── hoc/                         # Higher-Order Components and health tracking hooks
│   │   └── with-database-health.tsx # withDatabaseHealth HOC and useDatabaseHealth hook
│   ├── routes/                      # Route components rendered by React Router
│   │   ├── article.tsx              # Article detail view and interactive replenishment evaluator
│   │   └── home.tsx                 # Product catalog and best-offer overview
│   ├── services/                    # Isolated HTTP API data access layer
│   │   ├── check-database-health.ts # Root endpoint (/ ) database status inspection
│   │   ├── evaluate-replenishment.ts # Supplier offer and discount evaluation client
│   │   ├── fetch-article-by-id.ts   # Single article detail retriever
│   │   └── fetch-articles.ts        # Article catalog retriever
│   ├── types/                       # Domain models and TypeScript interface declarations
│   │   ├── article.ts               # Catalog article and supplier offer interfaces
│   │   ├── health.ts                # Database health states and API response types
│   │   ├── replenishment.ts         # Replenishment payload and evaluation response types
│   │   ├── supplier.ts              # Supplier metadata and discount rule types
│   │   ├── utilities.ts             # Generic utility types and helpers
│   │   └── vite-env.d.ts            # Vite environment variables type declarations
│   ├── app.css                      # Global styles and Tailwind CSS directives
│   ├── root.tsx                     # Document root layout, ThemeProvider, App, and ErrorBoundary
│   └── routes.ts                    # Declarative route hierarchy mapping URLs to components
├── package.json                     # Package metadata, dependencies, and build scripts
├── react-router.config.ts           # React Router framework options (configured for SPA mode: ssr: false)
├── tsconfig.json                    # TypeScript compiler configuration with ~/ path alias mapping to ./app/*
└── vite.config.ts                   # Vite bundler configuration with Tailwind CSS and React Router plugins
```

### Directory-by-Directory Rationale for `apps/web`

1. **`app/components/` (UI Primitives & Guards)**:
   - `LoadingScreen.tsx`: Centralized loading spinner used during hydration and async state transitions.
   - `MaintenanceSplashScreen.tsx`: Clean, user-centric maintenance splash screen designed with Material UI. Informs users in Italian that site maintenance is underway, eliminating technical jargon while offering an interactive retry button.
   - `DatabaseHealthGuard.tsx`: Declarative JSX wrapper (`<DatabaseHealthGuard>{children}</DatabaseHealthGuard>`) for guarding routes.

2. **`app/configs/` (Client Configuration)**:
   - `api.ts`: Centralizes Axios configuration, exporting `api` and `resolvedBaseUrl` derived from `import.meta.env.VITE_API_BASE_URL` with a fallback to `http://localhost:3000`.
   - `theme.ts`: Configures the Material UI theme with `cssVariables: true`, harmonizing MUI components with Tailwind CSS utility classes.

3. **`app/hoc/` (Higher-Order Components & Hooks)**:
   - `with-database-health.tsx`: Exports `useDatabaseHealth()` hook and `withDatabaseHealth(Component)` HOC. Checks backend database availability against `GET /` on application startup and auto-polls every 30 seconds when in maintenance mode to seamlessly recover when the database is restored.

4. **`app/routes/` (Page Components)**:
   - `home.tsx`: Product catalog view displaying active articles and dynamically highlighting the lowest purchase price (`minPrice`).
   - `article.tsx`: Interactive replenishment simulation interface. Manages state for quantity and delivery date criteria, invokes `POST /replenishment/evaluate`, and recommends the optimal supplier with pricing breakdowns.

5. **`app/services/` (HTTP Abstraction Layer)**:
   - Decouples UI components from HTTP communication. Isolates endpoints into dedicated service functions (`fetch-articles.ts`, `fetch-article-by-id.ts`, `evaluate-replenishment.ts`, `check-database-health.ts`).

6. **`app/types/` (Domain Typing)**:
   - Contains TypeScript interfaces (`ArticleOption`, `ReplenishmentEvaluationResponse`, `DiscountRule`, `DatabaseHealthState`) mirroring the backend API contracts.

7. **`app/root.tsx` & `app/routes.ts` (Application Shell & Routing)**:
   - `root.tsx`: Defines the root HTML document (`<html>`, `<head>`, `<body>`), global fonts, `ThemeProvider`, `CssBaseline`, and top `AppBar`. Integrates the `ErrorBoundary` upgraded with Material UI.
   - `react-router.config.ts`: Configured with `ssr: false` for pure Single Page Application (SPA) mode.

---

## 4. Key Architectural Patterns & Decisions

| Pattern / Decision                  | Implementation                                                   | Architectural Rationale                                                                                                                                     |
| :---------------------------------- | :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo Workspaces**             | Turborepo + pnpm                                                 | Eliminates duplicated tooling, accelerates build pipelines via task caching, and enables synchronized full-stack development (`pnpm run dev`).              |
| **Clean Architecture**              | Repositories $\rightarrow$ Domain Libs $\rightarrow$ Controllers | Enforces unidirectional dependency flow. Business logic is pure and independent of HTTP frameworks or ORM drivers.                                          |
| **Single Responsibility Principle** | One function per file in `kebab-case`                            | Maximizes code discoverability, avoids circular imports, and complies with `unicorn/filename-case`.                                                         |
| **Pure Domain Functions**           | `apps/api/src/lib/`                                              | Stock feasibility, tiered discounts, and compound calculations are deterministic and 100% testable without mocks.                                           |
| **Non-Throwing Validation**         | `apps/api/src/configs/env/`                                      | Zod schemas validate environment variables on boot, logging actionable diagnostic guides and applying safe defaults rather than crashing abruptly.          |
| **App Factory Pattern**             | `createApp()` in `apps/api/src/app.ts`                           | Allows Supertest integration tests to execute in parallel without port collisions or network socket binding.                                                |
| **Database Availability Guard**     | `withDatabaseHealth` HOC in `apps/web`                           | Intercepts broken database states at the root level, presenting a user-friendly Italian splash screen and auto-recovering when the database returns online. |
| **Unified ESLint Flat Config**      | `eslint.config.mjs`                                              | Standardizes linting rules, TypeScript strictness, import sorting, and JSDoc requirements across the entire monorepo.                                       |
