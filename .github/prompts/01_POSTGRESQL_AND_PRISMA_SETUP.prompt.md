# PostgreSQL and Prisma Setup Prompt

## Objective

Use this prompt for foundational PostgreSQL and Prisma setup work only.

## First Required Read

Read and follow:

```text
.github/copilot-instructions.md
```

## Scope Boundaries

- Configure or validate Prisma tooling and database connectivity.
- Keep work within setup and infrastructure scope.
- Do not implement business tables, authentication flows, RBAC features, or application modules in this prompt scope.
- Do not expose or print secrets (passwords, tokens, full connection strings).

## Expected Backend Scripts

Confirm these scripts exist and use them for validation where relevant:

```text
backend/package.json
    prisma:validate
    prisma:generate
    prisma:migrate:status
    db:health
```

## Required Completion Report

After completing this milestone, provide a report containing:

1. Files created.
2. Files modified.
3. Packages installed.
4. Prisma version.
5. PostgreSQL version targeted.
6. Prisma folder structure.
7. Migration folder structure.
8. Environment variables added or validated.
9. Commands executed.
10. Validation results.
11. Any warnings.
12. Any unresolved issues.
13. Confirmation that:
    - Prisma Client is generated.
    - Database connection is successful.
    - Migration infrastructure is ready.
    - No business tables have been created.
    - No authentication has been implemented.
    - No RBAC has been implemented.
    - No application modules have been implemented.
