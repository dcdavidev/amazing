# @amazing/web

Frontend web application for the **Amazing Shop** e-commerce catalog and supplier replenishment evaluation system. Built with React 19, React Router v7 (SPA mode), Material UI, Tailwind CSS, TypeScript, and Axios.

---

## Getting Started with @amazing/web

### 1. Prerequisites

Before starting `@amazing/web`, ensure you have the following installed and running:

- **Node.js**: `>= 20.0.0` (LTS recommended)
- **pnpm**: `>= 9.0.0`
- **Backend API**: The `@amazing/api` service should be running (by default on `http://localhost:3000`). Refer to [`apps/api/README.md`](../api/README.md) for database bootstrapping and API startup instructions.

---

### 2. Environment Configuration

The application resolves the backend API location via Vite environment variables:

1. Copy the sample development configuration:

   ```bash
   cp .env.development .env
   ```

2. Verify or update `VITE_API_BASE_URL` in `.env`:
   ```env
   NODE_ENV=development
   VITE_API_BASE_URL=http://localhost:3000
   ```

---

### 3. Running the Development Server

Start the local Vite development server with hot module replacement (HMR):

```bash
# From apps/web directory:
pnpm dev

# Or from repository root:
pnpm --filter @amazing/web dev
```

The application will be accessible at:

```text
http://localhost:5173
```

---

### 4. Building for Production

Compile and bundle the Single Page Application (SPA) for production deployment:

```bash
# Typecheck and build client assets:
pnpm build
```

This compiles optimized client bundles and HTML into `apps/web/build/client/`.

---

### 5. Running the Production Preview

To test the production build locally:

```bash
pnpm start # runs `react-router-serve ./build/server/index.js`
```

---

### 6. Static Type Checking

Generate React Router route types and validate all TypeScript definitions:

```bash
pnpm check-types # runs `react-router typegen && tsc`
```

---

## Environment Variables

All client environment variables must be prefixed with `VITE_` to be exposed to the browser bundle via `import.meta.env`:

| Variable            | Description                                         | Default                 | Allowed Values / Format     |
| :------------------ | :-------------------------------------------------- | :---------------------- | :-------------------------- |
| `VITE_API_BASE_URL` | Base URL pointing to the `@amazing/api` REST server | `http://localhost:3000` | Fully qualified HTTP(S) URL |
| `NODE_ENV`          | Build and runtime execution mode                    | `development`           | `development`, `production` |

---

## Features & Application Flow

### 1. Product Catalog Homepage (`/`)

- **Live Catalog Browsing**: Renders available articles fetched in real-time from `GET /articles`.
- **Best Price Highlighting**: Compares current supplier offers and prominently highlights the lowest purchase price (`minPrice`) for immediate decision-making.
- **Stock & Availability Indicators**: Displays availability badges and navigates directly to purchasing and evaluation options.

### 2. Article Detail & Replenishment Evaluator (`/articles/:id`)

- **Detailed Specifications**: Presents comprehensive product details and imagery.
- **Interactive Order Criteria**: Allows procurement managers to select requested replenishment quantities and anticipated order dates.
- **Real-Time Discount & Feasibility Computation**: Dispatches replenishment proposals to `POST /replenishment/evaluate`. Evaluates:
  - Base unit purchase prices across suppliers.
  - Shipping lead times (`minDaysToShip`) and stock sufficiency.
  - Complex discount rule engines (`MIN_TOTAL_AMOUNT`, `MIN_QUANTITY`, `MONTH_PERIOD`).
- **Optimal Supplier Recommendation**: Highlights the most cost-effective and feasible supplier choice with transparent pricing breakdowns.

### 3. Database Health Guard & Maintenance Screen

- **Automated Root Health Check**: On initial load, inspects `GET /` on `VITE_API_BASE_URL` to verify database health before mounting route components.
- **Graceful Maintenance Interception**: If the backend database is unreachable, malformed, out of sync, or offline, users are presented with a clean, branded Italian maintenance splash screen without technical jargon.
- **Auto-Recovery & Manual Retry**: Continuously polls the health endpoint every 30 seconds when in maintenance mode and provides an interactive _"Riprova adesso"_ button with loading state.

### 4. Resilient Material UI Error Boundary

- **Unified Catch-All**: Intercepts unhandled routing and runtime errors with a responsive Material UI card.
- **Localized Italian Guidance**: Differentiates between 404 Not Found, general HTTP errors, and unexpected JavaScript exceptions.
- **Developer Diagnostics**: Exposes an expandable diagnostic stack trace panel exclusively when running in development mode (`import.meta.env.DEV`).

---

## Scripts Reference

The following commands are defined in [`apps/web/package.json`](package.json):

| Script             | Command                                      | Purpose                                                         |
| :----------------- | :------------------------------------------- | :-------------------------------------------------------------- |
| `pnpm dev`         | `react-router dev`                           | Start local development server with Vite hot module replacement |
| `pnpm build`       | `react-router build`                         | Build static client assets and production bundle into `build/`  |
| `pnpm check-types` | `react-router typegen && tsc`                | Generate React Router route types and validate TypeScript types |
| `pnpm start`       | `react-router-serve ./build/server/index.js` | Serve production build using React Router standalone server     |

---

## Architectural Decisions & Directory Structure

`@amazing/web` is designed around **Component-Driven Development**, strict **Separation of Concerns**, and React Router v7's modern Single Page Application architecture.

```text
apps/web/
├── public/                          # Static assets served directly at root URL
│   ├── articles/                    # High-resolution product images (e.g. monitor-17-philips.jpg)
│   ├── logo/                        # Application logo assets (square.png)
│   ├── apple-touch-icon.png         # iOS home screen touch icon
│   ├── favicon-96x96.png            # Standard modern favicon
│   ├── favicon.ico                  # Fallback legacy favicon
│   ├── favicon.svg                  # Scalable vector favicon
│   └── site.webmanifest             # Progressive Web App manifest
├── app/                             # React application source code
│   ├── components/                  # Reusable UI presentation and guard components
│   │   ├── DatabaseHealthGuard.tsx  # Guard component intercepting unavailable database states
│   │   ├── LoadingScreen.tsx        # Centered circular progress loading screen
│   │   └── MaintenanceSplashScreen.tsx # Full-screen Italian maintenance splash page
│   ├── configs/                     # Centralized application and client configurations
│   │   ├── api.ts                   # Pre-configured Axios instance with VITE_API_BASE_URL resolution
│   │   └── theme.ts                 # Material UI v9 theme definition with CSS variables
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

### Directory-by-Directory Architectural Rationale

#### 1. `app/components/`

- **`DatabaseHealthGuard.tsx`**: Re-exports the health guard component, allowing declarative JSX wrapping (`<DatabaseHealthGuard>{children}</DatabaseHealthGuard>`) alongside HOC patterns.
- **`LoadingScreen.tsx`**: Consistent full-screen spinner used during initial hydration (`HydrateFallback`) and health check resolution.
- **`MaintenanceSplashScreen.tsx`**: Clean, user-centric maintenance splash screen designed with Material UI. Replaces the storefront when backend services or databases are offline, prompting users to revisit later and providing an interactive retry button.

#### 2. `app/configs/`

- **`api.ts`**: Single source of truth for Axios HTTP communication. Resolves `VITE_API_BASE_URL` with a fallback to `http://localhost:3000` and configures default headers and timeouts.
- **`theme.ts`**: Material UI theme initialized with `cssVariables: true`, enabling seamless integration with Tailwind utility classes and modern CSS variables.

#### 3. `app/hoc/`

- **`with-database-health.tsx`**: Encapsulates database availability inspection. Implements:
  - `useDatabaseHealth()`: React hook managing health checking, retry callbacks, and automatic 30-second interval polling during maintenance.
  - `withDatabaseHealth(Component)`: Higher-Order Component wrapping top-level application components to protect against rendering broken views when backend databases are unreachable.

#### 4. `app/routes/`

- **`home.tsx`**: E-commerce catalog view. Fetches articles on mount, handles loading and error states gracefully, and presents catalog cards with calculated best prices.
- **`article.tsx`**: Complex replenishment assessment interface. Houses interactive controls for order quantity and fulfillment dates, calculates tiered discounts in real-time, and recommends optimal supplier selection.

#### 5. `app/services/`

- **Separation of API Concerns**: Network requests are never inlined inside components. Dedicated service files (`fetch-articles.ts`, `fetch-article-by-id.ts`, `evaluate-replenishment.ts`, `check-database-health.ts`) isolate HTTP contracts, query parameters, and serialization from presentation logic.

#### 6. `app/types/`

- **Strict Domain Modeling**: Strongly-typed TypeScript interfaces mirroring backend contracts (`ArticleOption`, `ReplenishmentEvaluationResponse`, `DiscountRule`, `DatabaseHealthState`). Guarantees compile-time validation between API payloads and UI components.

#### 7. `app/root.tsx` & `app/routes.ts`

- **`root.tsx`**: Manages the overarching document skeleton (`<html>`, `<head>`, `<body>`), global font imports, `ThemeProvider`, `CssBaseline`, and the top navigation bar (`AppBar`). Hosts the Material UI `ErrorBoundary`.
- **`react-router.config.ts` (`ssr: false`)**: Configured strictly as a Single Page Application (SPA), delivering instant client-side route transitions and predictable client-side state handling.

---

## Technologies Used

`@amazing/web` was developed using a modern frontend ecosystem selected for developer experience, type safety, render performance, and responsive UI design:

### Core Framework & Language

- **[React 19](https://react.dev/)**:
  - **Role**: Core user interface library.
  - **Why chosen**: React 19 provides concurrent rendering, optimized hooks, and robust component lifecycle primitives supporting high-performance e-commerce experiences.
- **[React Router v7](https://reactrouter.com/)**:
  - **Role**: Client-side routing, layout orchestration, and application framework.
  - **Why chosen**: Version 7 delivers unified route configuration ([`app/routes.ts`](app/routes.ts)), automated route type generation via `typegen`, declarative error boundaries, and streamlined SPA mode (`ssr: false`).
- **[TypeScript](https://www.typescriptlang.org/)**:
  - **Role**: Primary programming language across the frontend application.
  - **Why chosen**: Ensures static type safety between backend responses and React components, eliminates `undefined` runtime errors, and provides autocomplete for domain entities.

### UI & Styling

- **[Material UI v9](https://mui.com/material-ui/) & [Emotion](https://emotion.sh/)**:
  - **Role**: Comprehensive UI component library and CSS-in-JS engine.
  - **Why chosen**: Production-ready, accessible components (AppBars, Cards, Grids, Buttons, Chips, Dialogs, Alerts) that adhere to Material Design standards and support CSS variable theming.
- **[Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)**:
  - **Role**: Utility-first CSS framework integrated directly via Vite.
  - **Why chosen**: Instant styling, layout adjustments, and rapid prototyping without CSS bloat, co-existing seamlessly with Material UI.
- **[Inter Font](https://fontsource.org/fonts/inter)** (`@fontsource-variable/inter`):
  - **Role**: Primary typography typeface.
  - **Why chosen**: Modern, highly legible variable font engineered for user interfaces and dense data presentation.

### Networking & Data Fetching

- **[Axios](https://axios-http.com/)**:
  - **Role**: Promise-based HTTP client.
  - **Why chosen**: Centralized configuration (`baseURL`, default headers), intuitive response unwrapping, and robust error handling capabilities across services.

### Build Tooling & Monorepo Architecture

- **[Vite](https://vite.dev/)**:
  - **Role**: Next-generation frontend bundler and development server.
  - **Why chosen**: Sub-millisecond Hot Module Replacement (HMR) and optimized Rollup-based production builds.
- **[Turborepo](https://turbo.build/repo)**:
  - **Role**: Monorepo build orchestrator.
  - **Why chosen**: Fast build caching and concurrent task execution across `@amazing/api` and `@amazing/web`.

---

## Agents / AI Usage

This project leveraged Google's **Antigravity CLI** (`antigravity`) as an agentic AI pair-programming assistant throughout the development and maintenance of `@amazing/web`.

Antigravity was employed to:

- **Code Improvements & Refactoring**:
  - Standardized component architecture across [`apps/web/app/routes/`](app/routes/), separating presentation from data fetching in [`apps/web/app/services/`](app/services/).
  - Enforced strict TypeScript typing, ensuring that domain models accurately mirror backend contracts.
  - Refined ESLint compliance, resolving Unicorn rules (`unicorn/prefer-ternary`, `unicorn/prefer-simple-condition-first`, `unicorn/no-unnecessary-global-this`) and formatting rules.
- **Maintenance HOC & Health Guard Creation**:
  - Designed and implemented the resilient database availability verification pipeline ([`app/services/check-database-health.ts`](app/services/check-database-health.ts)).
  - Engineered the [`withDatabaseHealth`](app/hoc/with-database-health.tsx) Higher-Order Component and [`DatabaseHealthGuard`](app/components/DatabaseHealthGuard.tsx) wrapper.
  - Crafted the user-friendly Italian [`MaintenanceSplashScreen`](app/components/MaintenanceSplashScreen.tsx) with automatic 30-second interval polling recovery and interactive retry mechanisms, strictly eliminating technical jargon from end-user views.
- **Error Boundary Upgrades**:
  - Overhauled [`ErrorBoundary`](app/root.tsx) in `root.tsx` from raw unstyled HTML to an elegant, responsive Material UI experience with 404 handling, navigation actions, and conditional development stack trace inspection.
- **General Testing & Verification**:
  - Validated build pipelines (`react-router typegen`, `tsc`, `react-router build`) and ensured zero lint or type errors across the monorepo workspace.
  - Explored multiple architectural options for routing, state synchronization, and component hierarchy to optimize performance and maintainability.
