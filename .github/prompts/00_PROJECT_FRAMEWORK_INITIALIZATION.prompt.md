# NEMP Project Framework Initialization Prompt

## Project

Nobletech Education Management Platform (NEMP)

## Objective

Create the initial enterprise-ready project framework for NEMP.

This task is limited strictly to establishing the project structure, workspace configuration, package configuration, TypeScript configuration, linting, formatting, basic backend startup, basic frontend startup, and GitHub workflow foundation.

Do not generate any business modules yet.

---

# Authoritative Project Instructions

Before generating or modifying files:

1. Read and follow:

```text
.github/copilot-instructions.md
```

2. Review the approved project documentation in:

```text
database/
docs/
```

3. Treat the existing architecture, database, security, coding, testing, and implementation documents as the source of truth.

4. Do not introduce new frameworks, libraries, modules, naming conventions, or architectural patterns that conflict with the approved documentation.

5. Do not delete, rename, overwrite, or move existing project documentation or governance files.

---

# Approved Technology Stack

## Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod validation
- JWT authentication in a later milestone
- REST API architecture

## Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- Zustand
- React Hook Form
- Zod

## Testing

- Vitest
- React Testing Library
- Supertest
- Playwright in a later milestone

## Tooling

- ESLint
- Prettier
- npm
- GitHub Actions
- Docker support in a later milestone

---

# Scope of This Prompt

Generate only the project foundation.

The implementation scope is:

```text
Project structure
        ↓
Workspace configuration
        ↓
Package configuration
        ↓
TypeScript configuration
        ↓
Linting and formatting
        ↓
Basic backend startup
        ↓
Basic frontend startup
        ↓
GitHub workflow foundation
```

---

# Required Root Structure

Preserve all existing files and folders.

Create only the missing implementation folders and configuration files needed to achieve this structure:

```text
nobletech-education-management-platform/
├── .github/
│   ├── copilot-instructions.md
│   ├── prompts/
│   │   └── 00_PROJECT_FRAMEWORK_INITIALIZATION.prompt.md
│   └── workflows/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── eslint.config.js
│   └── .prettierrc
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── eslint.config.js
│   └── .prettierrc
├── database/
├── docs/
├── assets/
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── README.md
├── package.json
└── NEMP.code-workspace
```

Do not create duplicate folders that already exist.

Do not move existing documentation into new locations.

---

# Root Package Configuration

Create a root `package.json` configured as an npm workspace.

The workspace must include:

```json
{
  "workspaces": [
    "backend",
    "frontend"
  ]
}
```

Add root scripts for:

```text
install:all
dev
dev:backend
dev:frontend
build
build:backend
build:frontend
lint
lint:backend
lint:frontend
format
format:check
test
test:backend
test:frontend
typecheck
```

Use a suitable development utility such as `concurrently` to run backend and frontend together.

Do not add production deployment scripts yet.

---

# Backend Framework Requirements

Initialize the backend as a TypeScript Express application.

## Required backend dependencies

Install only the packages needed for the foundation:

```text
express
cors
helmet
compression
dotenv
morgan
zod
```

## Required backend development dependencies

```text
typescript
tsx
vitest
supertest
eslint
prettier
@types/node
@types/express
@types/cors
@types/compression
@types/morgan
@types/supertest
```

Do not implement Prisma models yet.

Do not implement authentication yet.

Do not implement business modules yet.

---

# Backend Application Requirements

Create a minimal Express application with:

- Environment variable loading
- JSON body parsing
- CORS
- Helmet
- Compression
- Request logging
- Centralized not-found handling
- Centralized error handling
- API version prefix

Use this API prefix:

```text
/api/v1
```

Create only one endpoint:

```http
GET /api/v1/health
```

Expected successful response:

```json
{
  "success": true,
  "message": "NEMP API is running.",
  "data": {
    "service": "Nobletech Education Management Platform",
    "version": "1.0.0",
    "environment": "development"
  }
}
```

The endpoint should return HTTP status code `200`.

Do not connect to PostgreSQL yet.

Do not initialize Prisma yet.

---

# Backend File Responsibilities

## `src/app.ts`

- Create and configure the Express application.
- Register middleware.
- Register the health route.
- Register the not-found handler.
- Register the global error handler.
- Export the Express application.
- Do not start the HTTP server here.

## `src/server.ts`

- Load the configured port.
- Start the HTTP server.
- Log a professional startup message.
- Handle startup errors.
- Support graceful shutdown for `SIGINT` and `SIGTERM`.

## `src/config/env.ts`

- Validate environment variables with Zod.
- Provide typed environment configuration.
- Validate at least:
  - `NODE_ENV`
  - `APP_PORT`
  - `APP_VERSION`
  - `API_VERSION`
  - `FRONTEND_URL`

## `src/routes/index.ts`

- Create the main versioned API router.
- Register the health route.

## `src/routes/health.routes.ts`

- Implement the health endpoint only.

## `src/middleware/not-found.middleware.ts`

- Return the approved API error structure for unknown routes.

## `src/middleware/error.middleware.ts`

- Provide centralized error handling.
- Do not expose stack traces in production.
- Use the approved API response structure.

---

# Backend Scripts

Add scripts for:

```text
dev
build
start
lint
format
format:check
test
test:watch
typecheck
```

Use `tsx` for development execution.

Compile TypeScript into:

```text
dist/
```

---

# Frontend Framework Requirements

Initialize the frontend using React, TypeScript, and Vite.

## Required frontend dependencies

Install only the packages needed for the foundation:

```text
react
react-dom
react-router-dom
```

## Required frontend development dependencies

```text
typescript
vite
@vitejs/plugin-react
vitest
jsdom
@testing-library/react
@testing-library/jest-dom
@testing-library/user-event
eslint
prettier
@types/react
@types/react-dom
```

Do not install or configure full business libraries yet unless required by the approved framework.

Do not generate business pages.

Do not implement authentication screens.

Do not implement dashboards.

---

# Frontend Application Requirements

Create a minimal application shell containing:

- Application title
- Short description
- Backend health-check status placeholder
- Basic responsive layout
- Accessible semantic HTML
- A simple route structure

Required routes:

```text
/
```

and

```text
/health
```

The `/health` page should display:

```text
NEMP Frontend is running.
```

Do not create a complete design system yet.

Do not create school, student, teacher, CBT, assessment, report, or portfolio pages.

---

# Frontend Scripts

Add scripts for:

```text
dev
build
preview
lint
format
format:check
test
test:watch
typecheck
```

---

# TypeScript Requirements

Use strict TypeScript configuration in both frontend and backend.

Enable or maintain:

```text
strict
noUncheckedIndexedAccess
noImplicitOverride
noFallthroughCasesInSwitch
forceConsistentCasingInFileNames
skipLibCheck
```

Avoid the `any` type.

Use explicit return types for exported functions.

---

# ESLint and Prettier Requirements

Configure ESLint and Prettier for both frontend and backend.

Use consistent formatting rules.

Recommended Prettier configuration:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

Ensure linting and formatting commands work from the project root.

Do not duplicate conflicting formatting configurations unnecessarily.

---

# Environment Configuration

Use the existing root:

```text
.env.example
```

Do not add real credentials.

Create backend environment loading that is compatible with the approved `.env.example`.

Do not create `.env`, `.env.production`, or any secret-containing file.

---

# Workspace Configuration

Create or update:

```text
NEMP.code-workspace
```

It should open:

- Project root
- Backend
- Frontend
- Documentation
- Database

Include sensible VS Code settings for:

- Format on save
- ESLint validation
- TypeScript workspace SDK where appropriate
- Excluding build output from search

Do not include user-specific absolute paths.

---

# GitHub Actions Foundation

Create:

```text
.github/workflows/ci.yml
```

The initial workflow should:

1. Run on:
   - Push to `main`
   - Push to `develop`
   - Pull requests targeting `main`
   - Pull requests targeting `develop`

2. Use an active supported Node.js LTS version.

3. Perform:
   - Checkout
   - Install root workspace dependencies
   - Type checking
   - Linting
   - Tests
   - Build

Do not add deployment steps yet.

Do not add PostgreSQL services yet.

---

# Testing Requirements

Create minimal foundation tests.

## Backend

Test:

```http
GET /api/v1/health
```

Verify:

- Status `200`
- `success` is `true`
- Message is correct

## Frontend

Test that:

```text
NEMP Frontend is running.
```

renders successfully.

Do not generate large test suites yet.

---

# API Response Standards

All backend responses must follow the approved structure.

## Success

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "message": "An error occurred.",
  "errors": []
}
```

---

# Security Requirements

Even at foundation level:

- Use Helmet.
- Apply CORS from environment configuration.
- Do not expose secrets.
- Do not hardcode credentials.
- Do not log sensitive environment values.
- Do not expose production stack traces.
- Do not disable security middleware for convenience.

---

# Documentation Requirements

Update the existing `README.md` only where necessary to add verified startup instructions.

Do not rewrite the project architecture.

Document only:

- Prerequisites
- Installation
- Development startup
- Backend URL
- Frontend URL
- Health endpoint
- Available scripts

Do not create new architecture documents.

---

# Files and Folders That Must Not Be Deleted or Renamed

Do not delete, rename, move, or overwrite:

```text
database/
docs/
assets/
.github/copilot-instructions.md
.github/prompts/
.env.example
.gitignore
CHANGELOG.md
CONTRIBUTING.md
README.md
```

Preserve the existing documentation history.

---

# Do Not Do

Do not:

- Implement authentication.
- Implement RBAC.
- Create Prisma models.
- Create PostgreSQL migrations.
- Create database tables.
- Create seed files.
- Create student management.
- Create teacher management.
- Create school management.
- Create curriculum management.
- Create assessment logic.
- Create CBT functionality.
- Create report generation.
- Create portfolio functionality.
- Create file storage integration.
- Create notification integration.
- Create analytics.
- Create Docker files.
- Add deployment configuration.
- Add cloud-provider resources.
- Change approved architecture documents.
- Delete empty implementation folders merely because they are empty.
- Introduce unapproved dependencies.

---

# Expected Deliverables

After completion, the following must work:

```text
npm install
```

```text
npm run dev
```

```text
npm run build
```

```text
npm run lint
```

```text
npm run test
```

```text
npm run typecheck
```

The backend must start successfully.

The frontend must start successfully.

The backend health endpoint must respond successfully.

The frontend health page must render successfully.

The GitHub Actions workflow must validate the project without deployment.

---

# Acceptance Criteria

This prompt is complete only when:

- The required framework exists.
- Existing documentation remains unchanged unless explicitly required.
- No duplicate root folders are created.
- npm workspaces function correctly.
- Backend development server starts.
- Frontend development server starts.
- The health endpoint passes its test.
- The frontend foundation test passes.
- Type checking passes.
- Linting passes.
- Formatting checks pass.
- Production builds pass.
- The GitHub CI workflow is present.
- No business functionality has been implemented.
- No secrets are committed.
- All generated code follows `.github/copilot-instructions.md`.

---

# Required Completion Report

After generating the framework, provide a concise report containing:

1. Files created.
2. Files modified.
3. Packages installed.
4. Commands to run.
5. Tests created.
6. Validation results.
7. Any assumptions made.
8. Any unresolved errors.

Do not proceed to PostgreSQL, Prisma, authentication, or any business module until the generated framework has been reviewed and approved.
