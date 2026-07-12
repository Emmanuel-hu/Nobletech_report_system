# Nobletech Education Management Platform (NEMP)

# 36_POSTGRESQL_PHYSICAL_SCHEMA

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | PostgreSQL Physical Schema |
| Document Code | NEMP-DB-SCHEMA-036 |
| Version | 1.0 |
| Status | Draft for Implementation |
| Database | PostgreSQL |
| Schema Strategy | Migration-Based Physical Schema |

---

This document defines how the approved NEMP database architecture will be converted into a real PostgreSQL physical database schema.

- Migration order

This document serves as the bridge between the database design documents and actual PostgreSQL implementation.
# Objectives

The PostgreSQL Physical Schema aims to:
- Support multi-tenant isolation.
- Improve query performance.
- Support safe migrations.
- Reduce implementation errors.
- Provide a stable foundation for Prisma or any approved ORM.


↓


Migration Files

Seed Data

↓

Testing Database

↓

Production Database
```

All physical database changes must be implemented through version-controlled migration files.

## Phase 2B Foundation Scope

The first Prisma implementation slice currently covers:

- schools
- users
- roles
- permissions
- role_permissions
- user_roles
- students
- guardians
- student_guardians
- audit_logs

The foundation slice requires PostgreSQL `citext` support for case-insensitive username and email handling where enforced by the approved design.

Curriculum, academic, report, external-resource, assessment, CBT, and file-storage tables remain deferred to later milestones.

## Phase 2C Migration Status

The first controlled migration has now been created and applied in local development:

- Migration: `20260712181640_foundation_identity_rbac`.
- Scope: Foundation identity, RBAC, learner, guardian, and audit tables only.
- Extension enabled: `citext`.

Custom SQL indexes applied:

- `roles_global_role_code_active_key`
- `user_roles_active_scoped_unique_idx`
- `user_roles_active_global_unique_idx`

Verification status:

- Migration status: clean.
- Prisma validation: passed.
- Prisma client generation: passed.
- Database health check: passed.
- Foundation constraint checks: passed.

Deferred constraints:

- One-primary-guardian-per-student partial uniqueness remains deferred pending explicit policy approval.

## Phase 2D Migration Status

The academic foundation migration has now been implemented and applied in local development:

- Migration: `20260712221000_academic_structure_foundation`.
- Scope: Academic session, term, academic class, student enrolment, class-level teacher assignment, and required supporting constraints only.

Tables added:

- `academic_sessions`
- `terms`
- `academic_classes`
- `student_enrolments`
- `academic_class_teacher_assignments`

Enums added:

- `AcademicSessionStatus`
- `TermStatus`
- `AcademicClassStatus`
- `EnrolmentStatus`
- `AcademicClassTeacherAssignmentType`

Key constraint additions:

- School-scoped unique academic session code and name.
- School-scoped unique class code and name.
- Session-scoped unique term code, name, and sequence.
- School-scoped student number uniqueness.
- Partial uniqueness for one current active session per school.
- Partial uniqueness for one current active term per school.
- Partial uniqueness for active or pending enrolment per student and session.
- Partial uniqueness for active class teacher assignments by scope.
- Date-range check constraints for sessions, terms, enrolments, and assignments.

Tenant integrity hardening:

- Composite foreign keys `(entity_id, school_id)` enforce school-bound academic joins for sessions, terms, classes, enrolments, and teacher class assignments.

Verification status:

- Prisma schema validation passed.
- Prisma client generation passed.
- Migration status is clean and up to date.
- Database health check passed.
- Academic structure constraint checks passed.
- Phase 2C foundation constraint checks re-passed.

## Phase 2E Migration Status

The programme component and subject/integration-domain foundation migration has now been implemented and applied in local development:

- Migration: `20260712233500_programme_component_subject_foundation`.
- Scope: subject and integration-domain foundation, programme-component foundation, school-term-class enablement, component settings, and status history.

Tables added:

- `subjects`
- `school_subjects`
- `integration_domains`
- `subject_integration_domains`
- `programme_components`
- `programme_component_subjects`
- `programme_component_integration_domains`
- `school_programme_components`
- `term_programme_components`
- `class_programme_components`
- `programme_component_settings`
- `programme_component_status_history`

Enums added:

- `SubjectStatus`
- `IntegrationDomainStatus`
- `ProgrammeComponentStatus`

Key constraint additions:

- Date-range checks for school and term scoped subject/component activation windows.
- Positive-value checks for weekly frequency and lesson duration fields.
- Partial unique indexes for one active school subject or component link while preserving archival history.
- Partial unique indexes for one active term/class configuration per scoped component.

Tenant integrity hardening:

- Composite foreign keys `(entity_id, school_id)` enforce school-bound joins on term and class programme-component tables.

Verification status:

- Prisma schema validation passed.
- Prisma client generation passed.
- Migration deploy succeeded and migration status is clean and up to date.
- Database health check passed.
- Phase 2E table or index or constraint verification passed.
- Phase 2E constraint behavior suite passed (12 of 12).
- Phase 2D academic structure constraint checks re-passed.
- Phase 2C foundation constraint checks re-passed.

---

# PostgreSQL Standards

The physical database schema will follow PostgreSQL best practices.

Core standards include:

- UUID primary keys
- Foreign key constraints
- Indexed foreign keys
- Explicit data types
- JSONB for flexible configuration
- TIMESTAMP fields for auditability
- BOOLEAN fields for status flags
- Soft delete support where required
- Referential integrity enforcement

---

# UUID Strategy

All major business entities will use UUID primary keys.

Example:

```sql
student_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

Recommended extension:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

UUIDs improve security, scalability, and multi-tenant compatibility.

---

# Naming Conventions

## Table Names

Use lowercase plural snake_case.

Examples:

```text
students
teachers
schools
assessments
reports
files
settings
```

---

## Column Names

Use lowercase snake_case.

Examples:

```text
student_id
school_id
created_at
updated_at
deleted_at
```

---

## Primary Key Names

Use the format:

```text
<table_name_singular>_id
```

Examples:

```text
student_id
teacher_id
school_id
report_id
```

---

## Foreign Key Names

Use the referenced parent entity name.

Examples:

```text
school_id
student_id
teacher_id
assessment_id
```

---

# Data Type Standards

| Purpose | PostgreSQL Type |
|--------|-----------------|
| Primary Key | UUID |
| Foreign Key | UUID |
| Short Text | VARCHAR |
| Long Text | TEXT |
| Money / Scores | DECIMAL |
| Whole Numbers | INTEGER |
| Large Counts | BIGINT |
| True / False | BOOLEAN |
| Flexible Data | JSONB |
| Date Only | DATE |
| Date and Time | TIMESTAMP |
| Status Values | ENUM or VARCHAR |

---

# ENUM Strategy

ENUM types may be used for stable values that rarely change.

Examples:

```sql
CREATE TYPE account_status AS ENUM (
    'Active',
    'Inactive',
    'Suspended',
    'Locked',
    'Archived'
);
```

Recommended ENUM areas:

- Account Status
- Report Status
- Assessment Status
- CBT Status
- Upload Status
- Approval Status

Where values may change frequently, use lookup tables instead of ENUMs.

---

# Standard Audit Columns

Most operational tables should include:

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

Where applicable:

```sql
created_by UUID NULL,
updated_by UUID NULL,
deleted_at TIMESTAMP NULL,
deleted_by UUID NULL
```

Audit columns improve traceability and operational accountability.

---

# Soft Delete Strategy

Critical academic and operational records should use soft deletion.

Example:

```sql
deleted_at TIMESTAMP NULL
```

Soft-deleted records remain in the database for audit and recovery purposes.

Permanent deletion should be reserved for approved cleanup or retention policies.

---

# Multi-Tenant Column Standard

Most school-specific tables must include:

```sql
school_id UUID NOT NULL
```

This supports tenant isolation.

Examples:

- students
- teachers
- classes
- assessments
- reports
- files
- notifications
- settings

Global platform tables may allow `school_id` to be `NULL`.

---

# Foreign Key Strategy

Every parent-child relationship must be enforced using a foreign key.

Example:

```sql
school_id UUID NOT NULL REFERENCES schools(school_id)
```

Foreign keys should be indexed to improve query performance.

---

# Indexing Strategy

Indexes should be created for:

- Primary keys
- Foreign keys
- Frequently searched fields
- Status fields
- Date fields
- Composite tenant queries

Example:

```sql
CREATE INDEX idx_students_school_id
ON students(school_id);
```

Composite example:

```sql
CREATE INDEX idx_students_school_class
ON students(school_id, class_id);
```

---

# Constraint Strategy

Constraints should protect data quality.

Recommended constraints include:

- Primary key constraints
- Foreign key constraints
- Unique constraints
- NOT NULL constraints
- CHECK constraints
- Default values

Example:

```sql
email VARCHAR(255) UNIQUE
```

---

# Migration Order Strategy

Tables must be created in dependency order.

Recommended order:

```text
1. Extensions

2. ENUM Types

3. Global Platform Tables

4. Schools

5. Users, Roles, Permissions

6. Academic Structure

7. Students and Teachers

8. Curriculum

9. Assessment

10. CBT

11. Reports

12. Portfolio

13. Certificates

14. Notifications

15. File Storage

16. Settings

17. Analytics

18. Audit and Security Logs

19. Seed Data
```

This order prevents foreign key dependency errors.

---

# Seed Data Strategy

Seed data should initialize required platform values.

Examples:

- Default Roles
- Default Permissions
- Default System Settings
- Default Assessment Types
- Default Report Templates
- Default File Categories
- Default Feature Flags

Seed scripts must be repeatable and should not create duplicate records.

---

# PostgreSQL Schema Organization

NEMP adopts a modular schema organization while maintaining compatibility with PostgreSQL best practices.

## Initial Implementation

Version 1.0 will use the default PostgreSQL schema:

```text
public
```

This simplifies deployment, development, backup, and maintenance during the initial implementation.

---

## Future Enterprise Expansion

As the platform grows, modules may be separated into dedicated schemas.

Example:

```text
public

├── core

├── academic

├── assessment

├── cbt

├── reporting

├── security

├── storage

├── analytics

├── notifications
```

The database architecture has been designed to support schema separation without requiring structural redesign.

---

# Approved PostgreSQL Extensions

The following PostgreSQL extensions are approved for use within NEMP.

| Extension | Purpose |
|-----------|---------|
| pgcrypto | UUID generation using `gen_random_uuid()` |
| uuid-ossp (Optional) | Alternative UUID generation |
| citext | Case-insensitive text (e.g., email addresses) |
| pg_trgm (Future) | Fast fuzzy search |
| unaccent (Future) | Accent-insensitive searching |

Example:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Additional extensions require technical review before adoption.

---

# Timestamp Standard

All date and time values should be stored using UTC.

Recommended PostgreSQL data type:

```sql
TIMESTAMPTZ
```

Example:

```sql
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

Application services are responsible for converting UTC timestamps to the user's local timezone during presentation.

---

# Standard Base Columns

Most operational tables should include the following common fields.

| Column | Purpose |
|---------|---------|
| created_at | Record creation timestamp |
| updated_at | Last modification timestamp |
| created_by | User who created the record |
| updated_by | User who last updated the record |
| deleted_at | Soft delete timestamp |
| deleted_by | User performing deletion |
| version_number | Optimistic locking support (Future) |
| is_active | Active status flag |

These columns provide consistency across all modules.

---

# Constraint Naming Convention

All database constraints should follow standardized naming conventions.

| Constraint | Format |
|------------|--------|
| Primary Key | pk_<table_name> |
| Foreign Key | fk_<table>_<parent> |
| Unique Constraint | uq_<table>_<column> |
| Check Constraint | chk_<table>_<rule> |
| Default Constraint | df_<table>_<column> |

Examples:

```text
pk_students

fk_students_school

uq_users_email

chk_assessment_score

df_reports_status
```

Consistent naming improves maintenance and troubleshooting.

---

# Index Naming Convention

Indexes should follow a predictable naming standard.

Examples:

```text
idx_students_school

idx_students_class

idx_reports_student

idx_files_category

idx_assessments_teacher
```

Composite indexes should clearly identify the indexed columns.

Example:

```text
idx_students_school_class
```

---

# Transaction Management Strategy

Business operations affecting multiple tables should execute within a single database transaction.

Example:

```text
BEGIN

↓

Create Student

↓

Create User Account

↓

Assign Class

↓

Create Parent Relationship

↓

Create Student Profile

↓

COMMIT
```

If any operation fails:

```text
ROLLBACK
```

This ensures database consistency and prevents partial updates.

---

# Concurrency Control Strategy

NEMP should support optimistic concurrency control for critical records.

Recommended approach:

- Version Number
- Updated Timestamp
- Transaction Validation

Examples of modules benefiting from optimistic locking include:

- Report Approval
- Assessment Scores
- Student Profiles
- Teacher Profiles
- School Settings
- CBT Results

Future enhancements may introduce row-level locking where necessary.

---

# Migration File Naming Standard

Migration files should follow a sequential naming convention.

Examples:

```text
001_create_extensions.sql

002_create_enum_types.sql

003_create_schools.sql

004_create_roles.sql

005_create_users.sql

006_create_students.sql
```

For automated migration tools such as Prisma or TypeORM, timestamp-based naming may also be used.

Migration files should remain immutable after execution.

---

# DDL Coding Standards

Every SQL migration should follow consistent coding standards.

Requirements include:

- One logical change per migration.
- Explicit constraint names.
- Explicit index names.
- Clear SQL formatting.
- Meaningful comments for complex objects.
- No destructive operations without approval.
- Idempotent seed scripts where applicable.
- Foreign keys created after parent tables exist.

SQL scripts should remain readable, maintainable, and version controlled.

---
# Physical Schema Business Rules

- Every table must have a clear purpose.
- Every major table must use UUID primary keys.
- Foreign keys must enforce relationships.
- School-specific tables must include `school_id`.
- All frequently queried foreign keys must be indexed.
- Critical records should support soft deletion.
- Flexible configuration should use JSONB where appropriate.
- ENUMs should be used only for stable value sets.
- All migration scripts must be version controlled.
- Seed data must be safe to run repeatedly.

---

# Relationship Overview

```text
Logical Database Design

↓

PostgreSQL Physical Schema

↓

Migration Scripts

↓

Seed Data

↓

Backend Integration

↓

Production Database
```

---

# End of Part 1

# Core Database Schema Implementation

This section defines the physical implementation specifications for the core platform entities.

These entities form the foundation upon which every other database module depends.

The implementation order defined here should be followed during database migration.

---

# Implementation Layer 1

The first implementation layer contains the platform foundation.

```text
Extensions

↓

ENUM Types

↓

Platform Configuration

↓

Schools

↓

Roles

↓

Permissions

↓

Users

↓

Authentication

↓

Audit Logs
```

No academic tables should be created before these foundational entities.

---

# Module 1 — Platform Configuration

## Purpose

Stores global platform configuration shared across all tenants.

---

### Primary Table

```text
system_settings
```

---

### Primary Key

```text
system_setting_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| system_setting_id | UUID |
| setting_key | VARCHAR(150) |
| setting_value | TEXT |
| data_type | VARCHAR(50) |
| description | TEXT |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

- Primary Key
- Unique(setting_key)
- NOT NULL(setting_key)

---

### Indexes

```text
idx_system_settings_key
```

---

### Relationships

```text
Standalone Global Table
```

---

# Module 2 — Schools

## Purpose

Represents every tenant within the platform.

Every operational record ultimately belongs to one school.

---

### Primary Table

```text
schools
```

---

### Primary Key

```text
school_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| school_id | UUID |
| school_code | VARCHAR(50) |
| school_name | VARCHAR(255) |
| email | CITEXT |
| phone | VARCHAR(50) |
| website | VARCHAR(255) |
| address | TEXT |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

Primary Key

Unique(school_code)

Unique(email)

NOT NULL(school_name)

---

### Indexes

```text
idx_school_code

idx_school_name

idx_school_active
```

---

### Relationships

```text
Schools

1

↓

∞

Students
```

```text
Schools

1

↓

∞

Teachers
```

```text
Schools

1

↓

∞

Users
```

```text
Schools

1

↓

∞

Settings
```

Nearly every operational entity references `school_id`.

---

# Module 3 — Roles

## Purpose

Stores Role-Based Access Control (RBAC) roles.

---

### Primary Table

```text
roles
```

---

### Primary Key

```text
role_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| role_id | UUID |
| role_name | VARCHAR(150) |
| role_code | VARCHAR(50) |
| description | TEXT |
| is_system_role | BOOLEAN |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |

---

### Constraints

Unique(role_name)

Unique(role_code)

---

### Relationships

```text
Roles

1

↓

∞

Users
```

```text
Roles

∞

↓

∞

Permissions

via role_permissions
```

---

# Module 4 — Permissions

## Purpose

Stores individual platform permissions.

---

### Primary Table

```text
permissions
```

---

### Primary Key

```text
permission_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| permission_id | UUID |
| permission_name | VARCHAR(150) |
| permission_code | VARCHAR(100) |
| module | VARCHAR(100) |
| description | TEXT |
| created_at | TIMESTAMPTZ |

---

### Constraints

Unique(permission_code)

---

### Junction Table

```text
role_permissions
```

---

### Relationships

```text
Roles

∞

↓

role_permissions

↓

∞

Permissions
```

---

# Module 5 — Users

## Purpose

Represents every authenticated user of the platform.

Users include:

- Super Administrators
- School Administrators
- Teachers
- Students
- Parents
- Support Staff

---

### Primary Table

```text
users
```

---

### Primary Key

```text
user_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| user_id | UUID |
| school_id | UUID |
| role_id | UUID |
| username | VARCHAR(100) |
| email | CITEXT |
| password_hash | TEXT |
| account_status | account_status |
| last_login | TIMESTAMPTZ |
| created_at | TIMESTAMPTZ |

---

### Constraints

Primary Key

Unique(username)

Unique(email)

Foreign Key(school_id)

Foreign Key(role_id)

---

### Indexes

```text
idx_users_school

idx_users_role

idx_users_email

idx_users_username
```

---

### Relationships

```text
Schools

1

↓

∞

Users
```

```text
Roles

1

↓

∞

Users
```

```text
Users

1

↓

∞

Learner Identities (Planned)

```

```text
Users

1

↓

1

Authentication Account
```

---

### Phase 1.1 Planned Extension Notes

For learner-supporting accounts, planned identity guidance is:

- `email` should be nullable for pupil and student account profiles.
- `username` remains the primary login identifier for learner accounts.
- uniqueness strategy should be globally unique or tenant-safe according to final implementation policy.
- username changes require restricted permission and full audit logging.

Identity distinction to preserve during schema mapping:

- student_id = immutable internal identity
- student_number or admission_number = academic reference
- username = login identifier
- email = optional contact or optional login attribute

---

# Module 6 — Authentication

## Purpose

Stores authentication-specific records separate from business user information.

---

### Primary Tables

```text
authentication_accounts

login_sessions

refresh_tokens

password_history

authentication_logs
```

---

### Relationships

```text
Users

1

↓

1

Authentication Accounts
```

```text
Authentication Accounts

1

↓

∞

Login Sessions
```

```text
Authentication Accounts

1

↓

∞

Password History
```

```text
Authentication Accounts

1

↓

∞

Refresh Tokens
```

---

# Module 7 — Audit Logs

## Purpose

Maintains immutable records of all security-sensitive and business-critical actions performed within the platform.

---

### Primary Table

```text
audit_logs
```

---

### Primary Key

```text
audit_log_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| audit_log_id | UUID |
| school_id | UUID NULL |
| user_id | UUID |
| module | VARCHAR(100) |
| entity_name | VARCHAR(100) |
| entity_id | UUID |
| action | VARCHAR(100) |
| previous_value | JSONB |
| new_value | JSONB |
| ip_address | VARCHAR(100) |
| user_agent | TEXT |
| created_at | TIMESTAMPTZ |

---

### Relationships

```text
Users

1

↓

∞

Audit Logs
```

```text
Schools

1

↓

∞

Audit Logs
```

---

# Implementation Validation Rules

Before proceeding to the next implementation layer, verify that:

- PostgreSQL extensions are installed.
- ENUM types have been created.
- Global tables exist.
- Foreign key constraints compile successfully.
- Required indexes have been created.
- Unique constraints are functioning correctly.
- Seed data loads without errors.
- Authentication works successfully.
- Audit logging records platform events.
- Migration executes without rollback.

---

# Business Rules

- Foundation tables must be created before all dependent modules.
- UUIDs are mandatory for all primary entities.
- Every operational user must belong to a role.
- Every tenant-specific user must belong to a school.
- Authentication data must remain separate from user profile data.
- Audit logs must be immutable.
- Platform configuration must exist before school provisioning.
- Role-permission relationships must be managed through junction tables.
- Foreign key constraints must be enforced.
- Migration validation must complete successfully before implementing Layer 2.

---

# End of Part 2

# Academic Database Schema Implementation

This section defines the physical implementation specifications for the core academic entities within NEMP.

The Academic Layer depends on the foundational platform layer defined in Part 2.

No student, teacher, assessment, report, CBT, or portfolio records should be created before the academic structure exists.

---

# Implementation Layer 2

The second implementation layer contains the academic foundation.

```text
Schools

↓

Academic Sessions

↓

Terms

↓

Classes

↓

Arms

↓

Students

↓

Teachers

↓

Parent / Guardian Relationships

↓

Class Enrolments

↓

Teacher Assignments

↓

Academic Calendar
```

This layer forms the academic structure used by the rest of the platform.

---

# Module 8 — Academic Sessions

## Purpose

Represents an academic year or session within a school.

Examples:

```text
2025/2026

2026/2027
```

---

### Primary Table

```text
academic_sessions
```

---

### Primary Key

```text
session_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| session_id | UUID |
| school_id | UUID |
| session_name | VARCHAR(100) |
| start_date | DATE |
| end_date | DATE |
| is_current | BOOLEAN |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_academic_sessions

fk_academic_sessions_school

uq_academic_sessions_school_name
```

---

### Indexes

```text
idx_academic_sessions_school

idx_academic_sessions_current

idx_academic_sessions_active
```

---

### Relationships

```text
Schools

1

↓

∞

Academic Sessions
```

```text
Academic Sessions

1

↓

∞

Terms
```

---

# Module 9 — Terms

## Purpose

Represents academic terms within a session.

Examples:

```text
First Term

Second Term

Third Term
```

---

### Primary Table

```text
terms
```

---

### Primary Key

```text
term_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| term_id | UUID |
| school_id | UUID |
| session_id | UUID |
| term_name | VARCHAR(100) |
| term_order | INTEGER |
| start_date | DATE |
| end_date | DATE |
| is_current | BOOLEAN |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_terms

fk_terms_school

fk_terms_session

uq_terms_session_name

chk_terms_order
```

---

### Indexes

```text
idx_terms_school

idx_terms_session

idx_terms_current

idx_terms_order
```

---

### Relationships

```text
Academic Sessions

1

↓

∞

Terms
```

```text
Terms

1

↓

∞

Academic Calendar Events
```

---

# Module 10 — Classes

## Purpose

Represents academic class levels within a school.

Examples:

```text
Nursery 1

Primary 1

Primary 5

JSS 1

SSS 2
```

---

### Primary Table

```text
classes
```

---

### Primary Key

```text
class_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| class_id | UUID |
| school_id | UUID |
| class_name | VARCHAR(100) |
| class_code | VARCHAR(50) |
| education_level | VARCHAR(100) |
| display_order | INTEGER |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_classes

fk_classes_school

uq_classes_school_code

uq_classes_school_name
```

---

### Indexes

```text
idx_classes_school

idx_classes_level

idx_classes_display_order

idx_classes_active
```

---

### Relationships

```text
Schools

1

↓

∞

Classes
```

```text
Classes

1

↓

∞

Class Arms
```

```text
Classes

1

↓

∞

Student Enrolments
```

---

# Module 11 — Class Arms

## Purpose

Represents class subdivisions.

Examples:

```text
Primary 5 Gold

Primary 5 Diamond

JSS 1A

SSS 2 Science
```

---

### Primary Table

```text
class_arms
```

---

### Primary Key

```text
class_arm_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| class_arm_id | UUID |
| school_id | UUID |
| class_id | UUID |
| arm_name | VARCHAR(100) |
| arm_code | VARCHAR(50) |
| class_teacher_id | UUID NULL |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_class_arms

fk_class_arms_school

fk_class_arms_class

fk_class_arms_class_teacher

uq_class_arms_class_code
```

---

### Indexes

```text
idx_class_arms_school

idx_class_arms_class

idx_class_arms_teacher
```

---

### Relationships

```text
Classes

1

↓

∞

Class Arms
```

```text
Teachers

1

↓

∞

Class Arms
```

```text
Class Arms

1

↓

∞

Student Enrolments
```

---

# Module 12 — Students

## Purpose

Stores student records.

Students are core academic entities used across assessments, reports, CBT, attendance, portfolios, certificates, and file storage.

---

### Primary Table

```text
students
```

---

### Primary Key

```text
student_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| student_id | UUID |
| school_id | UUID |
| admission_number | VARCHAR(100) |
| first_name | VARCHAR(100) |
| middle_name | VARCHAR(100) NULL |
| last_name | VARCHAR(100) |
| gender | VARCHAR(20) |
| date_of_birth | DATE NULL |
| photo_file_id | UUID NULL |
| admission_date | DATE |
| student_status | VARCHAR(50) |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |
| deleted_at | TIMESTAMPTZ NULL |

---

### Constraints

```text
pk_students

fk_students_school

fk_students_photo_file

uq_students_school_admission_number
```

---

### Indexes

```text
idx_students_school

idx_students_admission_number

idx_students_name

idx_students_status

idx_students_photo_file
```

---

### Relationships

```text
Schools

1

↓

∞

Students
```

```text
Students

1

↓

∞

Student Enrolments
```

---

### Phase 1.1 Planned Extension Notes

Future schema mapping should include explicit identity distinctions:

- immutable `student_id`
- school-facing `student_number` (or equivalent)
- login linkage to learner `username`

Student identity persistence rule:

- `student_id` must not change because of class, term, session, branch, or programme movement.

Guardian contact linkage should remain separate from learner authentication credentials.

```text
Students

1

↓

∞

Attendance Records
```

```text
Students

1

↓

∞

Assessment Results
```

```text
Students

1

↓

∞

Reports
```

```text
Students

1

↓

∞

Portfolios
```

---

# Module 13 — Teachers

## Purpose

Stores teacher and instructor records.

Teachers may be assigned to classes, subjects, programme components, assessments, CBT examinations, and reports.

---

### Primary Table

```text
teachers
```

---

### Primary Key

```text
teacher_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| teacher_id | UUID |
| school_id | UUID |
| user_id | UUID NULL |
| staff_number | VARCHAR(100) |
| first_name | VARCHAR(100) |
| middle_name | VARCHAR(100) NULL |
| last_name | VARCHAR(100) |
| gender | VARCHAR(20) |
| phone | VARCHAR(50) |
| email | CITEXT NULL |
| photo_file_id | UUID NULL |
| employment_date | DATE NULL |
| teacher_status | VARCHAR(50) |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |
| deleted_at | TIMESTAMPTZ NULL |

---

### Constraints

```text
pk_teachers

fk_teachers_school

fk_teachers_user

fk_teachers_photo_file

uq_teachers_school_staff_number
```

---

### Indexes

```text
idx_teachers_school

idx_teachers_user

idx_teachers_staff_number

idx_teachers_status

idx_teachers_email
```

---

### Relationships

```text
Schools

1

↓

∞

Teachers
```

```text
Users

1

↓

1

Teachers
```

```text
Teachers

1

↓

∞

Teacher Assignments
```

```text
Teachers

1

↓

∞

Assessments
```

---

# Module 14 — Parents / Guardians

## Purpose

Stores parent and guardian records linked to students.

A student may have multiple guardians, and a guardian may be linked to multiple students.

---

### Primary Table

```text
guardians
```

---

### Primary Key

```text
guardian_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| guardian_id | UUID |
| school_id | UUID |
| user_id | UUID NULL |
| first_name | VARCHAR(100) |
| last_name | VARCHAR(100) |
| phone | VARCHAR(50) |
| email | CITEXT NULL |
| address | TEXT NULL |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Junction Table

```text
student_guardians
```

---

### student_guardians Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| student_guardian_id | UUID |
| school_id | UUID |
| student_id | UUID |
| guardian_id | UUID |
| relationship_type | VARCHAR(50) |
| is_primary_contact | BOOLEAN |
| can_receive_reports | BOOLEAN |
| can_receive_notifications | BOOLEAN |
| created_at | TIMESTAMPTZ |

---

### Relationships

```text
Students

∞

↓

student_guardians

↓

∞

Guardians
```

---

# Module 15 — Student Enrolments

## Purpose

Tracks student class placement per session and term.

This prevents overwriting historical class records when students are promoted.

---

### Primary Table

```text
student_enrolments
```

---

### Primary Key

```text
student_enrolment_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| student_enrolment_id | UUID |
| school_id | UUID |
| student_id | UUID |
| session_id | UUID |
| term_id | UUID |
| class_id | UUID |
| class_arm_id | UUID NULL |
| enrolment_status | VARCHAR(50) |
| promoted_from_class_id | UUID NULL |
| promoted_to_class_id | UUID NULL |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_student_enrolments

fk_student_enrolments_school

fk_student_enrolments_student

fk_student_enrolments_session

fk_student_enrolments_term

fk_student_enrolments_class

fk_student_enrolments_class_arm

uq_student_enrolments_student_session_term
```

---

### Indexes

```text
idx_student_enrolments_school

idx_student_enrolments_student

idx_student_enrolments_session_term

idx_student_enrolments_class

idx_student_enrolments_class_arm
```

---

# Module 16 — Teacher Assignments

## Purpose

Tracks teacher assignment to classes, class arms, subjects, programme components, or academic responsibilities.

---

### Primary Table

```text
teacher_assignments
```

---

### Primary Key

```text
teacher_assignment_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| teacher_assignment_id | UUID |
| school_id | UUID |
| teacher_id | UUID |
| session_id | UUID |
| term_id | UUID |
| class_id | UUID NULL |
| class_arm_id | UUID NULL |
| subject_id | UUID NULL |
| programme_component_id | UUID NULL |
| assignment_type | VARCHAR(100) |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Relationships

```text
Teachers

1

↓

∞

Teacher Assignments
```

```text
Classes

1

↓

∞

Teacher Assignments
```

```text
Programme Components

1

↓

∞

Teacher Assignments
```

---

# Module 17 — Academic Calendar

## Purpose

Stores school academic calendar events.

Examples:

```text
Term Begins

Mid-Term Break

Examination Week

Open Day

Vacation
```

---

### Primary Table

```text
academic_calendar_events
```

---

### Primary Key

```text
calendar_event_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| calendar_event_id | UUID |
| school_id | UUID |
| session_id | UUID |
| term_id | UUID NULL |
| event_title | VARCHAR(255) |
| event_type | VARCHAR(100) |
| start_date | DATE |
| end_date | DATE |
| description | TEXT |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

# Implementation Validation Rules

Before proceeding to Layer 3, verify that:

- Academic sessions are linked to schools.
- Terms are linked to sessions.
- Classes are linked to schools.
- Class arms are linked to classes.
- Students are linked to schools.
- Teachers are linked to schools.
- Guardians can link to multiple students.
- Students can maintain historical enrolments.
- Teacher assignments support class and programme responsibilities.
- Academic calendar events are session-aware.
- All required foreign keys compile successfully.
- All indexes are created successfully.

---

# Business Rules

- A school may have many academic sessions.
- A session may have many terms.
- A school may have many classes.
- A class may have many arms.
- A student must belong to one school.
- A teacher must belong to one school.
- A student may have multiple guardians.
- A guardian may be linked to multiple students.
- Student class history must be preserved through enrolments.
- Teacher responsibilities must be tracked through assignment records.
- Academic calendar events must be tied to session and school context.
- No assessment, report, CBT, or portfolio records should exist without valid academic structure.

---

# Module 18 — Subjects

## Purpose

Stores academic subjects offered by a school.

Subjects may be used for traditional academic programmes, general school subjects, examination management, teacher assignment, and report generation.

Examples:

```text
Mathematics

English Language

Basic Science

ICT

Coding

Robotics

Computer Studies
```

---

### Primary Table

```text
subjects
```

---

### Primary Key

```text
subject_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| subject_id | UUID |
| school_id | UUID |
| subject_code | VARCHAR(50) |
| subject_name | VARCHAR(150) |
| subject_category | VARCHAR(100) |
| education_level | VARCHAR(100) NULL |
| display_order | INTEGER |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |
| deleted_at | TIMESTAMPTZ NULL |

---

### Constraints

```text
pk_subjects

fk_subjects_school

uq_subjects_school_code

uq_subjects_school_name
```

---

### Indexes

```text
idx_subjects_school

idx_subjects_category

idx_subjects_level

idx_subjects_active
```

---

### Relationships

```text
Schools

1

↓

∞

Subjects
```

```text
Subjects

1

↓

∞

Teacher Assignments
```

```text
Subjects

1

↓

∞

Assessments
```

```text
Subjects

1

↓

∞

Reports
```

---

# Module 19 — Programme Components

## Purpose

Stores the structured programme components delivered within NEMP.

Programme components are used especially for Coding, Robotics, STEAM, AI, and other skills-based learning areas.

Examples:

```text
Coding

Robotics

STEAM

Artificial Intelligence

Python

Web Development

Arduino

IoT

Cybersecurity

Animation

Electronics

Fun Science
```

---

### Primary Table

```text
programme_components
```

---

### Primary Key

```text
programme_component_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| programme_component_id | UUID |
| school_id | UUID NULL |
| component_code | VARCHAR(50) |
| component_name | VARCHAR(150) |
| description | TEXT |
| display_order | INTEGER |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_programme_components

fk_programme_components_school

uq_programme_components_school_code
```

---

### Indexes

```text
idx_programme_components_school

idx_programme_components_code

idx_programme_components_active

idx_programme_components_order
```

---

### Relationships

```text
Programme Components

1

↓

∞

Curriculum
```

```text
Programme Components

1

↓

∞

Teacher Assignments
```

```text
Programme Components

1

↓

∞

Assessments
```

```text
Programme Components

1

↓

∞

Reports
```

---

# Module 20 — Curriculum

## Purpose

Stores curriculum root records for each school, session, term, and class.

This module is the lifecycle and versioning root for operational curriculum delivery.

This module must be used together with child hierarchy tables for:

- curriculum_components
- curriculum_units
- curriculum_topics
- curriculum_projects
- curriculum_learning_outcomes

---

### Primary Table

```text
curricula
```

---

### Primary Key

```text
curriculum_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| curriculum_id | UUID |
| school_id | UUID |
| session_id | UUID |
| term_id | UUID |
| class_id | UUID |
| subject_id | UUID NULL |
| curriculum_title | VARCHAR(255) |
| description | TEXT |
| status | ENUM (GENERATED_DRAFT, DRAFT, UNDER_REVIEW, REVISION_REQUIRED, APPROVED, PUBLISHED, ARCHIVED) |
| current_version_number | VARCHAR(20) NULL |
| derived_from_master | BOOLEAN |
| master_derivation_metadata | JSONB NULL |
| created_by | UUID |
| approved_by | UUID NULL |
| approved_at | TIMESTAMPTZ NULL |
| published_by | UUID NULL |
| published_at | TIMESTAMPTZ NULL |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_curriculum

fk_curriculum_school

fk_curriculum_session

fk_curriculum_term

fk_curriculum_class

fk_curriculum_subject

fk_curriculum_created_by

fk_curriculum_approved_by

fk_curriculum_published_by
```

---

### Indexes

```text
idx_curriculum_school

idx_curriculum_session_term

idx_curriculum_class

idx_curriculum_subject

idx_curriculum_status

idx_curriculum_version

idx_curriculum_derivation
```

---

### Relationships

```text
Schools

1

↓

∞

Curriculum
```

```text
Curriculum

1

↓

∞

Curriculum Components
```

```text
Curriculum Components

1

↓

∞

Curriculum Units
```

```text
Curriculum Units

1

↓

∞

Curriculum Topics
```

```text
Curriculum Topics

1

↓

∞

Curriculum Projects
```

```text
Curriculum Topics

1

↓

∞

Learning Outcomes
```

---

### Governance Rules

- GENERATED_DRAFT is required for generated curriculum content.
- APPROVED and PUBLISHED are separate states controlled by separate permissions.
- PUBLISHED curricula are immutable.
- Post-publication edits require a new DRAFT version.
- Master Library records cannot be published directly; only derived operational curricula can be published.

Phase 1.1 concept planning notes:

- Topics may teach multiple Concepts.
- Concepts are planned as reusable instructional entities linked to topics.
- Concept structures should remain compatible with skills and learning outcomes.

Phase 1.1 external resource planning notes:

- curriculum resources should support launch mode metadata: EMBEDDED, NEW_TAB, SAME_WINDOW, INTERNAL_RESOURCE.
- embedding should be attempted only where target platform policy permits it.
- blocked embedding must fall back to secure NEW_TAB launch.
- only approved active resources should be learner-visible.

---

# Module 21 — Curriculum Topics (Legacy Numbering)

## Purpose

Stores topics covered under a curriculum.

Examples:

```text
Introduction to Scratch

Variables

Loops

HTML Basics

Arduino LED Circuit

Micro:bit Display

AI Prompting
```

---

### Primary Table

```text
curriculum_topics
```

---

### Primary Key

```text
curriculum_topic_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| curriculum_topic_id | UUID |
| school_id | UUID |
| curriculum_id | UUID |
| topic_title | VARCHAR(255) |
| topic_description | TEXT |
| week_number | INTEGER NULL |
| display_order | INTEGER |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_curriculum_topics

fk_curriculum_topics_school

fk_curriculum_topics_curriculum
```

---

### Indexes

```text
idx_curriculum_topics_school

idx_curriculum_topics_curriculum

idx_curriculum_topics_week

idx_curriculum_topics_order
```

---

# Module 22 — Curriculum Projects (Legacy Numbering)

## Purpose

Stores projects attached to a curriculum.

Examples:

```text
Traffic Light Simulation

Weather App

Smart Dustbin

Portfolio Website

AI Chatbot

Robot Car
```

---

### Primary Table

```text
curriculum_projects
```

---

### Primary Key

```text
curriculum_project_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| curriculum_project_id | UUID |
| school_id | UUID |
| curriculum_id | UUID |
| project_title | VARCHAR(255) |
| project_description | TEXT |
| expected_output | TEXT |
| difficulty_level | VARCHAR(50) |
| display_order | INTEGER |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_curriculum_projects

fk_curriculum_projects_school

fk_curriculum_projects_curriculum
```

---

### Indexes

```text
idx_curriculum_projects_school

idx_curriculum_projects_curriculum

idx_curriculum_projects_difficulty

idx_curriculum_projects_order
```

---

# Module 23 — Learning Outcomes

## Purpose

Stores measurable learning outcomes attached to curriculum topics, projects, or programme components.

Examples:

```text
Student can write a simple Scratch program.

Student can connect an LED circuit safely.

Student can explain what a sensor does.

Student can design a simple web page.
```

---

### Primary Table

```text
learning_outcomes
```

---

### Primary Key

```text
learning_outcome_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| learning_outcome_id | UUID |
| school_id | UUID |
| curriculum_id | UUID |
| curriculum_topic_id | UUID NULL |
| curriculum_project_id | UUID NULL |
| outcome_text | TEXT |
| outcome_level | VARCHAR(100) |
| display_order | INTEGER |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_learning_outcomes

fk_learning_outcomes_school

fk_learning_outcomes_curriculum

fk_learning_outcomes_topic

fk_learning_outcomes_project
```

---

### Indexes

```text
idx_learning_outcomes_school

idx_learning_outcomes_curriculum

idx_learning_outcomes_topic

idx_learning_outcomes_project
```

---

# Module 24 — School Timetables

## Purpose

Stores timetable headers for each school, class, session, and term.

A timetable defines the weekly instructional schedule.

---

### Primary Table

```text
school_timetables
```

---

### Primary Key

```text
school_timetable_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| school_timetable_id | UUID |
| school_id | UUID |
| session_id | UUID |
| term_id | UUID |
| class_id | UUID |
| class_arm_id | UUID NULL |
| timetable_name | VARCHAR(255) |
| effective_from | DATE |
| effective_to | DATE NULL |
| active | BOOLEAN |
| created_by | UUID |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_school_timetables

fk_school_timetables_school

fk_school_timetables_session

fk_school_timetables_term

fk_school_timetables_class

fk_school_timetables_class_arm

fk_school_timetables_created_by
```

---

### Indexes

```text
idx_school_timetables_school

idx_school_timetables_session_term

idx_school_timetables_class

idx_school_timetables_active
```

---

# Module 25 — Timetable Entries

## Purpose

Stores individual timetable periods.

Examples:

```text
Monday 8:00 AM - 8:40 AM Mathematics

Tuesday 10:00 AM - 10:40 AM Coding

Friday 11:20 AM - 12:00 PM Robotics
```

---

### Primary Table

```text
timetable_entries
```

---

### Primary Key

```text
timetable_entry_id UUID
```

---

### Required Columns

| Column | PostgreSQL Type |
|---------|-----------------|
| timetable_entry_id | UUID |
| school_id | UUID |
| school_timetable_id | UUID |
| day_of_week | VARCHAR(20) |
| start_time | TIME |
| end_time | TIME |
| subject_id | UUID NULL |
| programme_component_id | UUID NULL |
| teacher_id | UUID NULL |
| room_name | VARCHAR(100) NULL |
| active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

### Constraints

```text
pk_timetable_entries

fk_timetable_entries_school

fk_timetable_entries_timetable

fk_timetable_entries_subject

fk_timetable_entries_programme_component

fk_timetable_entries_teacher

chk_timetable_time_range
```

---

### Indexes

```text
idx_timetable_entries_school

idx_timetable_entries_timetable

idx_timetable_entries_day

idx_timetable_entries_teacher

idx_timetable_entries_subject
```

---

# Academic Implementation Order

The academic layer should be implemented in the following order.

```text
Academic Sessions

↓

Terms

↓

Classes

↓

Class Arms

↓

Subjects

↓

Programme Components

↓

Students

↓

Teachers

↓

Guardians

↓

Student Guardians

↓

Student Enrolments

↓

Teacher Assignments

↓

Curriculum

↓

Curriculum Topics

↓

Curriculum Projects

↓

Learning Outcomes

↓

Academic Calendar Events

↓

School Timetables

↓

Timetable Entries
```

This order prevents foreign key dependency errors.

---

# Academic Composite Indexes

The following composite indexes are recommended.

```text
idx_student_enrolments_student_session_term
```

```text
idx_student_enrolments_school_class_session
```

```text
idx_teacher_assignments_teacher_session_term
```

```text
idx_teacher_assignments_school_class
```

```text
idx_curriculum_school_class_term
```

```text
idx_curriculum_school_component_term
```

```text
idx_timetable_entries_teacher_day
```

```text
idx_timetable_entries_timetable_day_time
```

Composite indexes should be reviewed after real usage patterns are observed.

---

# Academic Validation Rules

The following validation rules must be enforced by the application and, where appropriate, database constraints.

- A term must belong to a valid academic session.
- Term dates must fall within the academic session date range.
- A class arm cannot exist without a valid class.
- A student cannot be enrolled into a class unless the class exists.
- A student should not have duplicate enrolments for the same session and term.
- A teacher assignment must reference a valid teacher.
- A timetable entry must belong to a valid timetable.
- Timetable end time must be later than start time.
- A curriculum must reference either a subject or a programme component.
- Curriculum topics cannot exist without a parent curriculum.
- Learning outcomes must belong to a valid curriculum.
- Teacher assignments should not be duplicated for the same responsibility within the same session and term.

---

# Academic Seed Data

The following seed data should be prepared during implementation.

## Default Terms

```text
First Term

Second Term

Third Term
```

---

## Education Levels

```text
Nursery

Primary

Junior Secondary

Senior Secondary

Coding Academy

STEAM Programme

Bootcamp

Summer Camp
```

---

## Common Subject Categories

```text
Core Academic

Elective

ICT

Coding

Robotics

STEAM

Language

Science

Creative Arts
```

---

## Default Programme Components

```text
Coding

Robotics

STEAM

Artificial Intelligence

Python

Web Development

Arduino

IoT

Cybersecurity

Animation

Electronics

Fun Science
```

---

# Academic Dependency Diagram

```text
School

↓

Academic Session

↓

Term

↓

Class

↓

Class Arm

↓

Student

↓

Student Enrolment

↓

Subject / Programme Component

↓

Curriculum

↓

Topic

↓

Project

↓

Learning Outcome

↓

Assessment

↓

Report
```

---

# Additional Business Rules

- Subjects are school-specific unless defined as platform defaults.
- Programme components may be global or school-specific.
- Curriculum must always be linked to a school, session, term, and class.
- Curriculum may be linked to either a subject or programme component.
- Timetable entries may reference either a subject or programme component.
- Student enrolment preserves academic history across sessions and terms.
- Teacher assignments preserve responsibility history.
- Seed data must be repeatable and should not create duplicate records.
- The academic layer must be fully implemented before Assessment, CBT, Reports, and Portfolio modules.

---

# End of Part 3

# Functional Module Schema Implementation

This section defines the physical implementation specifications for the main operational modules built on top of the foundational and academic layers.

These modules depend on the platform, security, user, school, and academic structures already defined in Parts 2 and 3.

---

# Implementation Layer 3

The third implementation layer contains the main academic and operational engines.

```text
Academic Layer

↓

Attendance

↓

Assessment

↓

CBT

↓

Reports

↓

Portfolio

↓

Certificates

↓

Notifications

↓

File Storage

↓

Settings

↓

Analytics
```

This layer powers the daily operations of the NEMP platform.

---

# Module 26 — Attendance

## Purpose

Stores attendance records for students and teachers.

Attendance data contributes to reports, dashboards, analytics, and school administration.

---

### Primary Tables

```text
attendance_registers

attendance_records
```

---

### Key Relationships

```text
Schools

1

↓

∞

Attendance Registers
```

```text
Attendance Registers

1

↓

∞

Attendance Records
```

```text
Students

1

↓

∞

Attendance Records
```

```text
Teachers

1

↓

∞

Attendance Registers
```

---

### Required Indexes

```text
idx_attendance_registers_school

idx_attendance_records_student

idx_attendance_records_date

idx_attendance_records_status
```

---

# Module 27 — Assessment

## Purpose

Stores all academic, practical, project-based, competency-based, and skills-based assessments.

---

### Primary Tables

```text
assessments

assessment_attempts

assessment_scores

assessment_evidence

assessment_observations

assessment_comments

assessment_approvals

assessment_results

student_achievements

achievement_badges

student_certificates

assessment_history
```

---

### Key Relationships

```text
Assessments

1

↓

∞

Assessment Attempts
```

```text
Assessment Attempts

1

↓

∞

Assessment Scores
```

```text
Students

1

↓

∞

Assessment Attempts
```

```text
Assessment Results

↓

Reports
```

```text
Assessment Evidence

↓

Files
```

---

### Required Indexes

```text
idx_assessments_school

idx_assessments_curriculum

idx_assessment_attempts_student

idx_assessment_scores_attempt

idx_assessment_results_student

idx_assessment_results_assessment
```

---

# Module 28 — CBT

## Purpose

Stores computer-based testing data, including question banks, examinations, attempts, submitted answers, security events, and results.

---

### Primary Tables

```text
question_banks

question_categories

questions

question_options

exam_blueprints

examinations

examination_sections

examination_candidates

examination_attempts

examination_answers

examination_results

cbt_security_logs
```

---

### Key Relationships

```text
Question Banks

1

↓

∞

Questions
```

```text
Questions

1

↓

∞

Question Options
```

```text
Examinations

1

↓

∞

Examination Candidates
```

```text
Candidates

1

↓

∞

Examination Attempts
```

```text
Examination Attempts

1

↓

∞

Examination Answers
```

```text
Examination Results

↓

Assessment Results
```

---

### Required Indexes

```text
idx_questions_category

idx_examinations_school

idx_examinations_assessment

idx_examination_candidates_student

idx_examination_attempts_candidate

idx_examination_answers_attempt

idx_examination_results_student
```

---

# Module 29 — Reports

## Purpose

Stores report generation records, snapshots, approvals, generated PDFs, verification records, distribution history, and report logs.

---

### Primary Tables

```text
reports

report_builders

report_snapshots

report_generation_jobs

report_versions

report_approvals

generated_pdfs

report_archives

report_verifications

report_distribution

report_download_history

report_generation_logs
```

---

### Key Relationships

```text
Students

1

↓

∞

Reports
```

```text
Reports

1

↓

∞

Report Versions

```

---

### Phase 1.1 Planned Extension Notes

One-page end-of-term report planning rules:

- A4 Portrait is default.
- A4 Landscape is an approved template exception only.
- one-page mode should include preview and overflow warning prior to publication.
- published outputs are immutable and corrections generate revised versions and snapshots.

1

Report Snapshot
```

```text
Reports

1

↓

∞

Report Approvals
```

```text
Reports

1

↓

∞

Generated PDFs
```

```text
Generated PDFs

↓

Files
```

```text
Reports

1

↓

1

Report Verification
```

---

### Required Indexes

```text
idx_reports_school

idx_reports_student

idx_reports_session_term

idx_reports_status

idx_report_approvals_report

idx_generated_pdfs_report

idx_report_verifications_code
```

---

# Module 30 — Portfolio

## Purpose

Stores each student's digital learning portfolio, including projects, skills, evidence, achievements, certificates, showcase items, and sharing records.

---

### Primary Tables

```text
student_portfolios

portfolio_programmes

portfolio_projects

portfolio_skills

portfolio_evidence

portfolio_achievements

portfolio_certificates

portfolio_showcase

portfolio_sharing

portfolio_activity_history
```

---

### Key Relationships

```text
Students

1

↓

1

Student Portfolio
```

```text
Student Portfolio

1

↓

∞

Portfolio Projects
```

```text
Portfolio Projects

1

↓

∞

Portfolio Evidence
```

```text
Portfolio Evidence

↓

Files
```

```text
Student Portfolio

1

↓

∞

Portfolio Skills
```

```text
Student Portfolio

1

↓

∞

Portfolio Certificates
```

---

### Required Indexes

```text
idx_student_portfolios_student

idx_portfolio_projects_portfolio

idx_portfolio_evidence_project

idx_portfolio_skills_portfolio

idx_portfolio_sharing_portfolio
```

---

# Module 31 — Certificates

## Purpose

Stores certificates issued to students, programme participants, and award recipients.

Certificate PDFs are generated through the Report PDF Rendering Engine and stored through the File Storage Module.

---

### Primary Tables

```text
student_certificates

certificate_settings

generated_pdfs

report_verifications

files
```

---

### Key Relationships

```text
Students

1

↓

∞

Student Certificates
```

```text
Student Certificates

↓

Generated PDF
```

```text
Generated PDF

↓

Files
```

```text
Student Certificates

↓

Verification Record
```

---

### Required Indexes

```text
idx_student_certificates_student

idx_student_certificates_number

idx_student_certificates_issue_date

idx_generated_pdfs_file

idx_report_verifications_code
```

---

# Module 32 — Notifications

## Purpose

Stores notification templates, events, rules, queues, recipients, delivery logs, preferences, failures, and history.

---

### Primary Tables

```text
notification_templates

notification_events

notification_rules

notification_queue

notifications

notification_recipients

notification_delivery_logs

notification_preferences

notification_failures

notification_history
```

---

### Key Relationships

```text
Notification Events

1

↓

∞

Notifications
```

```text
Notification Templates

1

↓

∞

Notifications
```

```text
Notifications

1

↓

∞

Notification Recipients
```

```text
Users

1

↓

∞

Notification Recipients
```

```text
Notifications

1

↓

∞

Delivery Logs
```

---

### Required Indexes

```text
idx_notifications_event

idx_notifications_template

idx_notification_recipients_user

idx_notification_recipients_status

idx_notification_queue_status

idx_notification_delivery_logs_notification
```

---

# Module 33 — File Storage

## Purpose

Stores metadata for all digital files while actual binary content is stored in object storage.

---

### Primary Tables

```text
storage_providers

storage_locations

folders

files

file_versions

file_categories

file_permissions

file_access_logs

file_shares

storage_quotas

upload_sessions

file_retention_policies

archived_files

deleted_files

storage_statistics
```

---

### Key Relationships

```text
Storage Providers

1

↓

∞

Storage Locations
```

```text
Folders

1

↓

∞

Files
```

```text
Files

1

↓

∞

File Versions
```

```text
Files

1

↓

∞

File Permissions
```

```text
Files

1

↓

∞

File Access Logs
```

---

### Required Indexes

```text
idx_files_school

idx_files_folder

idx_files_category

idx_files_uploaded_by

idx_files_checksum

idx_file_versions_file

idx_file_access_logs_file

idx_file_shares_token
```

---

# Module 34 — Settings

## Purpose

Stores all configurable platform, school, module, security, notification, storage, grading, and integration settings.

---

### Primary Tables

```text
system_settings

school_settings

branding_settings

academic_settings

assessment_settings

cbt_settings

report_settings

notification_settings

email_settings

sms_settings

authentication_settings

security_settings

storage_settings

ai_settings

feature_flags

grading_settings

certificate_settings

backup_settings

integration_settings
```

---

### Key Relationships

```text
Schools

1

↓

∞

School Settings
```

```text
Schools

1

↓

∞

Branding Settings
```

```text
Schools

1

↓

∞

Module Settings
```

```text
Feature Flags

↓

Runtime Behaviour
```

---

### Required Indexes

```text
idx_school_settings_school

idx_school_settings_key

idx_feature_flags_school

idx_feature_flags_key

idx_branding_settings_school

idx_security_settings_school
```

---

# Module 35 — Analytics

## Purpose

Stores aggregated data used for dashboards, reporting, trends, operational insights, and performance monitoring.

Analytics tables should be read-oriented and should not replace operational data.

---

### Primary Table Groups

```text
student_performance_analytics

teacher_performance_analytics

school_performance_analytics

assessment_analytics

cbt_analytics

report_analytics

attendance_analytics

storage_statistics

dashboard_statistics
```

---

### Key Relationships

```text
Schools

1

↓

∞

Analytics Records
```

```text
Students

1

↓

∞

Student Performance Analytics
```

```text
Teachers

1

↓

∞

Teacher Performance Analytics
```

```text
Assessments

↓

Assessment Analytics
```

```text
CBT Results

↓

CBT Analytics
```

---

### Required Indexes

```text
idx_analytics_school

idx_student_analytics_student

idx_teacher_analytics_teacher

idx_assessment_analytics_assessment

idx_cbt_analytics_examination

idx_dashboard_statistics_school
```

---

# Functional Module Implementation Order

The functional layer should be implemented in this order:

```text
Attendance

↓

Assessment

↓

CBT

↓

Reports

↓

Portfolio

↓

Certificates

↓

Notifications

↓

File Storage

↓

Settings

↓

Analytics
```

However, because many modules reference `files`, the File Storage schema may be physically created earlier if required for foreign key support.

---

# Cross-Module Dependency Notes

Some modules have circular business dependencies but should avoid circular database dependency where possible.

Examples:

```text
Reports reference Files

Files may be used by Reports
```

To avoid circular migration problems:

- Create `files` before `generated_pdfs` where file references are required.
- Allow nullable file references during initial creation where necessary.
- Add foreign keys in later migrations if needed.
- Use service-layer enforcement where hard database enforcement creates migration complexity.

---

# Functional Layer Validation Rules

Before proceeding to production schema generation, verify:

- Attendance references valid students and classes.
- Assessments reference valid curriculum, students, and teachers.
- CBT examinations reference valid question banks and assessments.
- Reports reference valid students, sessions, terms, and templates.
- Portfolio records reference valid students and files.
- Certificates reference valid students and generated files.
- Notifications reference valid users and templates.
- Files reference valid storage locations and categories.
- Settings reference valid schools where school-specific.
- Analytics records are derived from valid operational records.

---

# Physical Schema Completion Rules

The physical schema is considered complete only when:

- All foundational tables exist.
- All academic tables exist.
- All functional module tables exist.
- All required foreign keys compile.
- All required indexes are created.
- Required seed data is inserted.
- Migration scripts execute in order.
- Rollback strategy is documented.
- Test database validates successfully.
- Backend ORM models can be generated successfully.

---

# Implementation Readiness Checklist

Before generating actual SQL migration files, confirm:

- All table names are finalized.
- All primary keys are finalized.
- All foreign keys are identified.
- All ENUM values are agreed.
- All lookup tables are defined.
- All seed data is prepared.
- All nullable fields are intentional.
- All soft-delete fields are intentional.
- All indexes are justified.
- All constraints are documented.
- All migration ordering dependencies are resolved.

---

# Final Business Rules

- Functional module tables must not be created before their parent entities exist.
- Foreign keys should enforce referential integrity wherever practical.
- Analytics should not replace operational records.
- Files should store metadata only, not binary content.
- Settings should control configuration but should not duplicate operational data.
- Notifications should reference users and events.
- Reports should be immutable once published.
- Assessment results should be approved before report generation.
- CBT results should synchronize with assessment results.
- Portfolio records should be derived from approved academic and project activities.
- All modules must preserve tenant isolation through `school_id`.

---

# Relationship Overview

```text
Foundation Layer

↓

Academic Layer

↓

Functional Modules

↓

Generated Reports

↓

Analytics

↓

Operations
```

---

# End of Part 4
