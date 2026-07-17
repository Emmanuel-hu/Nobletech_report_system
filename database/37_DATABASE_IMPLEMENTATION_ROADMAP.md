## Phase 2J.1 Status Update

## Phase 2K.1 Status Update

- Completed: curriculum source administration foundation implementation against existing Phase 2F schema.
- Added backend service and API support for source registration, source review lifecycle, structured source content maintenance, and source-to-master lineage links.
- Added master catalog retrieval endpoint for approved content types in school and optional global scope.
- Added frontend administration route for source register operations and master catalog visibility.
- Validation focus remained on API contract and lifecycle guardrails; no new database tables or schema duplication introduced.
- Deferred boundary retained: AI extraction, AI-assisted parsing, and AI curriculum generation remain out of scope.

- Completed: curriculum structure editor workflow completion using existing lifecycle and assignment-capable schema.
- Added minimal API corrections only for existing structure domains: operational concept CRUD, concept-mapping reorder, project-implementation reorder, learning-outcome delete, and visibility concurrency token validation.
- No new database domains were introduced; implementation remained within approved curriculum structure entities.
- Optimistic concurrency enforcement now covers structure mutations and visibility updates consistently.
- Next milestone recommendation remains: Phase 2K.2 Master-Content Administration Completion.
- Deferred boundary retained: AI extraction and AI-assisted curriculum generation stay out of scope.

## Phase 2K.2 Status Update

- Completed: master-content administration completion across backend and frontend using explicit lifecycle, mapping, lineage, audit, and concurrency controls.
- Added focused migration `20260714224016_phase2k2_assessment_rubric_mapping` for explicit reusable assessment-template to rubric mappings.
- Added verification-surface updates for master-content database verification and constraint checks to include the new mapping table.
- Deferred boundary retained: AI extraction, OCR parsing, source-file upload ingestion, and AI-assisted curriculum generation remain out of scope.

## Phase 2L Status Update

- Completed: curriculum source file-storage foundation using a dedicated file metadata table, source-file lifecycle controls, and scan-state metadata.
- Added Phase 2L database verification and constraint checks for the curriculum source file-storage surface.
- Added scoped migration checksum audit coverage for the Phase 2L migrations.
- Deferred boundary retained: OCR parsing, AI extraction, and AI-assisted generation remain out of scope.

## Phase 2N Status Update

- Completed: master-content promotion system database foundation with promotion lifecycle and item management.
- Added migration `20260716100211_phase2n_master_content_promotion_foundation` creating 2 tables (MasterContentPromotion, MasterContentPromotionItem).
- MasterContentPromotion table: 27 columns supporting lifecycle status (8-value enum), requestor/reviewer/approver/completer audit fields, source checksum and revision number for reconciliation, adaptation and review notes, duplicate decision tracking, metadata JSON field.
- MasterContentPromotionItem table: 34 columns supporting polymorphic master-content linking (10 entity FKs: masterCurriculumUnitId, masterTopicId, masterConceptId, masterSkillId, masterLearningOutcomeId, masterActivityId, masterProjectId, masterProjectImplementationId, masterResourceId, masterAssessmentTemplateId), action enum (5 values: CREATE_DRAFT, LINK_EXISTING, SKIP, MARK_DUPLICATE, ADAPT), target type enum (10 values), sequence ordering, duplicate candidates JSON, mapping fields JSON, transformation data JSON.
- Added 6 indexes for efficient querying by school, session, status, and source content.
- Added 10 foreign key constraints enforcing referential integrity to master-content entities, processing sessions, and users.
- Added unique constraints preventing duplicate source-content entries within promotion and enforcing sequence ordering per promotion.
- Added verification scripts for Phase 2N table, index, constraint coverage, and relational-constraint behavior checks.
- Deferred boundary retained: OCR parsing, AI extraction, and automatic generation remain out of scope.

## Phase 2M Status Update

- Completed: manual curriculum source processing database foundation with processing-session and source-section entities.
- Added schema and migration coverage for session lifecycle status, processing method, section hierarchy, section review status, and source-content lineage fields.
- Added verification scripts for Phase 2M table, index, and constraint coverage plus relational-constraint behavior checks.
- Deferred boundary retained: OCR parsing, AI extraction, and automatic generation remain out of scope.

## Phase 2J Status Update

- Completed: Curriculum Portal UX hardening and backend data integration completion for assignment and version-management pathways.
- Completed backend endpoint additions for curriculum editor lookups, mapping maintenance, and project implementation maintenance.
- Completed frontend integration for published-version-gated assignments, dependent session-term lookups, and structured version comparison rendering.
- Added regression tests for new validator contracts and frontend structured diff utility behavior.
- Validation evidence: backend test suite passed with Phase 2J test additions; frontend regression tests passed in stable runs, while command-shell variability remains an execution environment risk.
- Next milestone recommendation: extend full curriculum structure editor surface and integration tests across all edit paths with consistent terminal profile controls.
- Deferred boundary retained: AI-assisted curriculum generation remains out of scope.

## Phase 2G Status Update

- Completed: operational curriculum draft, review, approval, versioning, publication, and assignment persistence foundation.
- Verification completed using:
        - `backend/src/scripts/phase2g-curriculum-constraints-check.ts`
        - regression suites for Phase 2C, 2D, 2E, and 2F.
- Next milestone recommendation: Phase 2H Curriculum Authoring, Review and Publication Backend Service Foundation.
- Phase 2H boundary: manual curriculum application services and APIs only; AI generation remains deferred.

## Phase 2I Status Update

- Completed: Curriculum Authoring and Review Administrative Portal Foundation on frontend using approved backend APIs.
- Implemented administrative route and page foundation for manual authoring, review, publication, version comparison, assignment management, and archive workflows.
- Implemented typed frontend API client integration with tenant context headers and normalized error mapping.
- Added frontend permission-gated action controls aligned to backend RBAC expectations.
- Added frontend validation evidence: TypeScript typecheck and Vitest route or permission tests passed.
- Next milestone recommendation: Phase 2J Curriculum Authoring UX Hardening and Data Integration Completion.
- Phase 2J boundary recommendation: complete dependent lookup data integration, optimistic concurrency UX safeguards, assignment deduplication UX, and extended integration tests while keeping AI generation deferred.

# Nobletech Education Management Platform (NEMP)

# 37_DATABASE_IMPLEMENTATION_ROADMAP


# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Database Implementation Roadmap |
| Document Code | NEMP-DB-ROADMAP-037 |
| Version | 1.0 |
| Status | Final Database Transition Document |
| Database | PostgreSQL |
| ORM Recommendation | Prisma |
| Purpose | Transition from Database Documentation to Implementation |


# Purpose

This document defines the final roadmap for implementing the approved NEMP database architecture.

It converts the completed database documentation into a practical, step-by-step implementation plan for PostgreSQL, migration scripts, Prisma ORM, backend services, API development, and future frontend integration.

This document does not introduce new database requirements.

Its purpose is to guide implementation.


# Implementation Principle

NEMP will now follow this principle:

> **Documentation is complete enough. Implementation should now begin.**

After this document, no new database architecture documents should be created unless a critical implementation gap is discovered during technical review.


# Implementation Roadmap Overview

```text
Approved Database Documentation

↓

PostgreSQL Migration Plan

↓

Prisma Schema

↓

Seed Data

↓

Backend Database Connection

↓

Core Backend Services

↓

API Development

↓

Frontend Integration

↓

Testing

↓

Deployment
```


# Phase 1 — Freeze Database Documentation

## Objective

Lock the completed database documentation as Version 1.0.


## Activities

- Review all database-related documents.
- Confirm naming consistency.
- Confirm table numbering.
- Confirm module boundaries.
- Confirm relationship rules.
- Confirm curriculum terminology standardization to Curriculum Units.
- Confirm curriculum lifecycle statuses and transition policy.
- Confirm migration order.
- Mark documents as approved.
- Prevent uncontrolled additions.


## Deliverable

```text
Database Documentation v1.0 Approved
```


# Phase 2A — Documentation-to-Prisma Schema Mapping

## Objective

Translate the approved documentation into a Prisma-first schema design without creating migrations, modifying the database, generating Prisma Client, or implementing application code.

## Activities

- Review approved documentation from Phases 1, 1.1, and 1.2.
- Confirm Prisma baseline and naming conventions.
- Map entities, enums, relations, constraints, indexes, and deletion rules.
- Identify custom PostgreSQL requirements such as case-insensitive username enforcement.
- Document deferred entities and open questions for implementation planning.

## Deliverable

```text
Phase 2A Prisma Mapping Draft Approved
```

## Exit Criteria

- No schema.prisma edits are required for approval of the mapping draft.
- No migration files are created.
- No database commands are run.
- No backend or frontend implementation is started.

## Next Milestone

Phase 2B: Prisma Schema Foundation Implementation, limited to the approved first model group.


# Phase 2B — Prisma Schema Foundation Implementation

## Objective

Implement the first Prisma slice for school, user identity, RBAC, learner identity, guardian relationships, and immutable audit logging.

## Completed Scope

- School tenant foundation.
- Shared user identity foundation.
- Roles, permissions, role-permission joins, and user-role joins.
- Learner identity separated from login identity.
- Guardian profiles and learner-guardian joins.
- Minimum audit-log foundation.

## Validation Status

- Prisma schema validation passed.
- Prisma Client generation passed.
- No migrations were run.
- No database commands were executed.

## Remaining Implementation Work

- Review and migrate the foundation schema.
- Add PostgreSQL `citext` extension support in the first migration.
- Add custom SQL for any partial uniqueness rule required by active scoped user-role assignments.

## Next Milestone

Phase 2C: Review and migrate the foundation schema.


# Phase 2C — Foundation Schema Review and First Migration

## Objective

Review the Phase 2B schema, correct foundation-level defects, create and apply the first controlled development migration, and verify core constraints.

## Completed Outcomes

- Foundation schema reviewed and corrected.
- First migration created and applied: `20260712181640_foundation_identity_rbac`.
- PostgreSQL `citext` extension enabled in migration SQL.
- Custom partial unique indexes added for global role-code and active user-role scope rules.
- Migration status confirmed clean.
- Prisma validation, Prisma client generation, and DB health checks passed.
- Constraint verification suite passed for foundation identity and RBAC rules.

## Deferred Items

- One-primary-guardian-per-student uniqueness remains deferred pending explicit policy approval.
- Academic structure, curriculum, reports, assessments, CBT, external resources, and file storage remain out of scope.

## Next Milestone

Phase 2D: Academic Structure Schema Mapping and Implementation.


# Phase 2D — Academic Structure Schema Mapping and Implementation

## Objective

Implement academic structure foundation models and constraints required before programme component and subject-domain expansion.

## Completed Outcomes

- Added academic foundation models: AcademicSession, Term, AcademicClass, StudentEnrolment, AcademicClassTeacherAssignment.
- Added approved academic enums for session, term, class, and enrolment status.
- Added school-scoped composite foreign keys for tenant-safe academic references.
- Added partial unique constraints for one current active session and one current active term per school.
- Added partial unique constraints for active learner enrolment and class-level teacher assignment deduplication.
- Added date-range check constraints for session, term, enrolment, assignment, and class-age range consistency.
- Corrected student number policy from global uniqueness to school-scoped uniqueness.
- Clarified student email as optional profile contact, with user email remaining account-auth authority where email login is used.
- Re-ran Phase 2C foundation constraints successfully after Phase 2D migration.

## Deferred Items

- Class arms remain deferred from this phase.
- Subject or integration-domain models remain deferred to next milestone.
- Programme-component-linked assignment remains deferred.
- Cross-table term-within-session date containment remains service validation or trigger-level follow-up.

## Next Milestone

Phase 2E: Programme Component and Subject or Integration-Domain Foundation.


# Phase 2E - Programme Component and Subject or Integration-Domain Foundation

## Objective

Implement subject, integration-domain, and programme-component foundation models and constraints required before master content library and curriculum source implementation.

## Completed Outcomes

- Added foundation models: Subject, SchoolSubject, IntegrationDomain, SubjectIntegrationDomain.
- Added programme-component foundation models: ProgrammeComponent, ProgrammeComponentSubject, ProgrammeComponentIntegrationDomain.
- Added school-term-class enablement models: SchoolProgrammeComponent, TermProgrammeComponent, ClassProgrammeComponent.
- Added supporting models: ProgrammeComponentSetting and ProgrammeComponentStatusHistory.
- Added approved enums for subject, integration-domain, and programme-component lifecycle statuses.
- Added school-scoped composite foreign keys for tenant-safe term and class component joins.
- Added partial unique constraints for active school, term, and class component or subject deduplication.
- Added date-range and positive-value check constraints for activation windows and frequency or duration fields.
- Re-ran Phase 2D academic constraints successfully after Phase 2E migration.
- Re-ran Phase 2C foundation constraints successfully after Phase 2E migration.

## Deferred Items

- Master content library operational tables remain deferred to next milestone.
- Curriculum source ingestion, extraction, and publication workflows remain deferred.
- Subject-level or programme-component-level instructor assignment beyond class-level foundation remains deferred unless explicitly approved later.

## Next Milestone

Phase 2F: Master Content Library and Curriculum Source Foundation.


# Phase 2F - Master Content Library and Curriculum Source Foundation

## Objective

Implement the approved schema foundation for curriculum source ingestion and reusable master content before operational curriculum workflows.

## Completed Outcomes

- Added curriculum source foundation models: CurriculumSource and CurriculumSourceContent.
- Added master library foundation models: MasterCurriculumUnit, MasterTopic, MasterConcept, MasterSkill, MasterLearningOutcome, MasterActivity, MasterProject, MasterProjectImplementation, MasterResource, MasterAssessmentTemplate, MasterRubric, MasterRubricCriterion, MasterRubricLevel.
- Added lineage and mapping models: CurriculumSourceMasterContentLink and all approved master join tables for subjects, integration domains, programme components, concepts, skills, outcomes, activities, projects, and resources.
- Added approved enums for source type and format, review and publication states, and activity, implementation, resource, and assessment classifications.
- Added custom SQL checks for source ownership scope, lifecycle consistency, positive sequencing or duration rules, assessment and rubric score consistency, and single-target lineage enforcement.
- Added partial unique indexes for case-insensitive active source and master code uniqueness and typed lineage deduplication.
- Applied migration `20260713001000_master_content_source_foundation` and verified clean migration status.
- Re-ran validation suites and confirmed Phase 2F checks passed together with Phase 2C, 2D, and 2E regression checks.

## Deferred Items

- Operational curriculum drafting, review, approval, versioning, and publication workflows remain deferred.
- Backend services, API endpoints, frontend integration, and AI generation remain out of scope for this milestone.

## Next Milestone

Phase 2G: Operational Curriculum Draft, Review, Approval, Versioning and Publication Foundation.


# Phase 2 — Create Migration Folder Structure

## Recommended Structure

```text
database/

├── migrations/

├── seeds/

├── enums/

├── indexes/

├── constraints/

├── views/

├── functions/

├── triggers/

└── README.md
```


# Phase 3 — Create PostgreSQL Migration Files

## Recommended Migration Order

```text
001_create_extensions.sql

002_create_enum_types.sql

003_create_core_platform_tables.sql

004_create_security_and_auth_tables.sql

005_create_academic_tables.sql

006_create_curriculum_tables.sql

007_create_file_storage_tables.sql

008_create_settings_tables.sql

009_create_assessment_tables.sql

010_create_cbt_tables.sql

011_create_report_tables.sql

012_create_portfolio_tables.sql

013_create_notification_tables.sql

014_create_analytics_tables.sql

015_create_indexes.sql

016_create_seed_data.sql
```

This order prevents foreign key dependency issues.


# Phase 4 — Core Implementation Order

## Step 1

Create PostgreSQL extensions.

```text
pgcrypto

citext
```


## Step 2

Create ENUM types.

Examples:

```text
account_status

report_status

assessment_status

approval_status

upload_status

notification_status
```


## Step 3

Create foundation tables.

```text
schools

users

roles

permissions

role_permissions

user_roles

audit_logs
```


## Step 4

Create academic foundation.

```text
academic_sessions

terms

classes

class_arms

subjects

programme_components

students

teachers

guardians

student_guardians

student_enrolments

teacher_assignments
```


## Step 5

Create curriculum tables.

```text
curricula

curriculum_components

curriculum_units

curriculum_topics

curriculum_projects

curriculum_project_implementations

learning_outcomes

curriculum_versions
```

Curriculum lifecycle states must be implemented as:

```text
GENERATED_DRAFT

DRAFT

UNDER_REVIEW

REVISION_REQUIRED

APPROVED

PUBLISHED

ARCHIVED
```

Approval and publication must be implemented as separate permissions and workflow transitions.


## Step 6

Create operational engine tables.

```text
assessments

cbt

reports

portfolios

notifications

files

settings

analytics
```


# Phase 5 — Seed Default Data

## Required Seed Data

```text
Default Roles

Default Permissions

Default System Settings

Default Terms

Default Education Levels

Default Programme Components

Default File Categories

Default Feature Flags

Default Notification Events

Default Assessment Types

Default Report Settings
```

Seed scripts must be repeatable and must not create duplicates.


# Phase 6 — Prisma Setup

## Recommended ORM

```text
Prisma
```

## Required Actions

```text
Install Prisma

Initialize Prisma

Connect PostgreSQL

Define Prisma models

Generate Prisma client

Run migrations

Test database connection
```


# Phase 7 — Backend Database Foundation

## Backend Setup

```text
Node.js

Express.js

TypeScript

Prisma Client

Environment Variables

Centralized Error Handling

Logging

Validation
```


## Required Backend Folders

```text
backend/

├── src/

│   ├── config/

│   ├── controllers/

│   ├── services/

│   ├── repositories/

│   ├── routes/

│   ├── middleware/

│   ├── validators/

│   ├── types/

│   ├── utils/

│   └── app.ts
```


# Phase 8 — First Backend Modules to Build

Build the backend in this order:

```text
1. Authentication

2. Roles and Permissions

3. Schools

4. Academic Sessions

5. Terms

6. Classes

7. Students

8. Teachers

9. Guardians

10. Curriculum
```

These modules are required before Assessment, CBT, Reports, Portfolio, and Analytics.


# Phase 9 — API Implementation Order

## Core APIs

```text
/auth

/users

/roles

/permissions

/schools

/academic-sessions

/terms

/classes

/students

/teachers

/guardians

/curriculum
```


## Next APIs

```text
/assessments

/cbt

/reports

/portfolios

/certificates

/files

/notifications

/settings

/analytics
```


# Phase 10 — Testing Order

## Database Testing

Verify:

- Tables created successfully.
- ENUMs created successfully.
- Foreign keys compile.
- Indexes exist.
- Seed data loads.
- Rollback works.


## Backend Testing

Verify:

- Database connection.
- Prisma queries.
- Authentication.
- RBAC.
- CRUD operations.
- Error handling.
- Tenant isolation.


## API Testing

Verify:

- Request validation.
- Response structure.
- Authorization.
- Pagination.
- Filtering.
- Sorting.
- Error responses.


# Phase 11 — Frontend Integration

Frontend development should begin only after the following backend modules are stable:

```text
Authentication

Schools

Users

Roles

Academic Sessions

Terms

Classes

Students

Teachers
```


# Phase 12 — Implementation Control Rule

After this roadmap:

```text
No new database documents should be added.
```

Any future change should be handled through:

```text
Change Request

↓

Impact Review

↓

Migration Update

↓

Documentation Update

↓

Implementation
```


# Final Database Implementation Checklist

Before coding starts, confirm:

- All database documents are saved.
- All filenames are consistent.
- Document numbering is final.
- Migration order is agreed.
- ORM is selected.
- PostgreSQL is selected.
- Backend stack is confirmed.
- First implementation modules are confirmed.
- Database architecture is frozen.

Phase 1.2 alignment gate before Prisma mapping:

- Pupil and student email optionality is documented.
- Permanent learner identity separation (student_id vs student_number vs username vs email) is documented.
- Username uniqueness, change control, and recovery policy is documented.
- Concept modelling recommendation is documented without breaking approved hierarchy.
- External learning resource launch modes and embedding fallback policy are documented.
- External learning resource termly review policy is documented.
- One-page end-of-term report constraints and overflow handling are documented.
- Rendered-height measurement is documented as the final overflow authority.
- Learner dashboard visibility gates for approved and published content are documented.


# Final Recommendation

After completing this document, the next action is:

```text
Upload the full project folder as a ZIP file for architecture audit.
```

The audit should check:

- Completeness
- Duplicates
- Missing documents
- Naming consistency
- Database readiness
- Backend readiness
- Frontend readiness
- Security readiness
- Implementation readiness

After the audit is complete, the project should move into coding.

# AI-Assisted Implementation Workflow

The NEMP implementation process will follow the workflow below:

```text
Approved NEMP Documentation
        ↓
Create Project Framework and Folder Structure
        ↓
Connect the Project to GitHub
        ↓
Open the Repository in VS Code
        ↓
Use GitHub Copilot with Saved Project Prompts
        ↓
Copilot Generates the Code
        ↓
Review, Test, Correct, and Commit Each Module
```

This workflow establishes GitHub Copilot as the primary code-generation assistant while ensuring that every generated module remains subject to human review, testing, correction, documentation, and version control.

# Summary

The Database Implementation Roadmap marks the end of the database documentation phase and the beginning of the implementation phase.

It provides the practical sequence for converting the approved NEMP database architecture into PostgreSQL migration files, Prisma models, backend services, APIs, tests, and frontend integration.

This document should be treated as the final database transition document.

Future database changes should be controlled through formal change requests rather than additional architecture documents.


# End of Document

## Phase 2H Progress Update

- Backend implementation now covers curriculum authoring/review/publication service foundation over approved schema.
- API wiring and validation middleware are in place for school-scoped curriculum operations.
- Phase 2H AI generation capabilities remain intentionally deferred.