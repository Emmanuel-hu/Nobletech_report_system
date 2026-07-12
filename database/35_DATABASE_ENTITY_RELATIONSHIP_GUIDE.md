# Nobletech Education Management Platform (NEMP)

# 35_DATABASE_ENTITY_RELATIONSHIP_GUIDE

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Database Entity Relationship Guide |
| Document Code | NEMP-DB-035 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

This document defines the master Entity Relationship Model (ERM) for the Nobletech Education Management Platform (NEMP).

It provides a comprehensive reference showing how all database entities relate to one another across every module within the platform.

The guide serves as the authoritative reference for:

- Database Developers
- Backend Developers
- Frontend Developers
- API Developers
- DevOps Engineers
- System Architects
- QA Engineers

It ensures that all database relationships remain consistent throughout the lifetime of the platform.

---

# Objectives

The Database Entity Relationship Guide aims to:

- Define relationships between all entities.
- Maintain referential integrity.
- Standardize foreign key usage.
- Support scalable database design.
- Simplify database maintenance.
- Improve developer understanding.
- Reduce data duplication.
- Improve query optimization.
- Support future expansion.
- Preserve architectural consistency.

---

# Database Design Principles

The NEMP database follows these principles:

- Normalized Design
- Referential Integrity
- UUID Primary Keys
- Foreign Key Constraints
- Auditability
- Soft Delete Support
- Multi-Tenant Isolation
- High Scalability
- Modular Architecture
- Performance Optimization

These principles apply to every database module.

---

# Relationship Types

The platform uses three primary relationship types.

## One-to-One (1:1)

Example

```text
Student

↓

Student Profile
```

One record relates to exactly one other record.

---

## One-to-Many (1:N)

Example

```text
School

↓

Students
```

One school contains many students.

---

## Many-to-Many (M:N)

Example

```text
Teacher

↓

Teacher Subject Assignment

↓

Subjects
```

Many teachers may teach many subjects through a junction table.

---

# Primary Entity Groups

The database is organized into the following major domains.

- Tenant Management
- User Management
- Academic Management
- Student Management
- Teacher Management
- Curriculum Management
- Assessment Management
- CBT Management
- Attendance Management
- Reporting
- Portfolio Management
- Notification Management
- File Storage
- Security
- Analytics
- Configuration

Each domain contains related entities that work together.

---

# High-Level Entity Relationship Model

```text
Platform

↓

Schools

↓

Academic Sessions

↓

Terms

↓

Classes

↓

Students

↓

Assessments

↓

Reports
```

This represents the core academic hierarchy.

---

# Tenant Management Relationships

```text
Platform

1

↓

∞

Schools
```

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

Storage Quotas
```

Every operational entity belongs to a school (tenant) unless explicitly defined as a global platform resource.

---

# User Management Relationships

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
Roles

1

↓

∞

Permissions
```

```text
Users

∞

↓

∞

Permissions

(Via Role Permissions)
```

User authorization is managed through Role-Based Access Control (RBAC).

---

# Academic Structure Relationships

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

```text
Terms

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

Students
```

This hierarchy defines the academic structure for each school.

---

# Student Relationships

```text
Students

1

↓

∞

Attendance
```

```text
Students

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

Reports
```

```text
Students

1

↓

∞

Portfolios
```

```text
Students

1

↓

∞

Certificates
```

```text
Students

1

↓

∞

Files
```

Students represent one of the primary entities within the platform.

---

# Teacher Relationships

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

```text
Teachers

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

Files
```

Teachers own academic activities within assigned classes.

---

# Business Rules

- Every business entity should belong to a school unless defined as global.
- UUIDs are used for all primary business entities.
- Relationships should enforce referential integrity.
- Junction tables should be used for many-to-many relationships.
- Foreign keys should be indexed where appropriate.
- Tenant isolation is mandatory.
- Every relationship should support auditing.
- Soft deletes should preserve historical relationships.
- Database normalization should be maintained.
- Entity relationships should remain consistent across all modules.

---

# Relationship Overview

```text
Platform

↓

Schools

↓

Academic Structure

↓

Students & Teachers

↓

Assessments

↓

Reports

↓

Analytics
```

---

# End of Part 1

# Curriculum Relationships

The Curriculum Module defines the educational structure used across all academic programmes within NEMP.

Every curriculum belongs to a school and is assigned by session, term, class, and programme component context.

---

## Curriculum Relationship Model

```text
Schools

1

↓

∞

Curriculum

↓

1

↓

∞

Programme Components

↓

1

↓

∞

Curriculum Units

↓

1

↓

∞

Topics

↓

1

↓

∞

Projects

↓

1

↓

∞

Learning Outcomes
```

---

## Curriculum Relationships

```text
Curriculum

1

↓

∞

Programme Components
```

```text
Programme Components

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

Topics
```

```text
Topics

1

↓

∞

Projects
```

```text
Topics

1

↓

∞

Assessment Criteria
```

```text
Topics

1

↓

∞

Lesson Resources
```

Curriculum entities form the instructional foundation for every programme delivered within the platform.

Curriculum state transitions must follow the lifecycle GENERATED_DRAFT -> DRAFT -> UNDER_REVIEW -> REVISION_REQUIRED/APPROVED -> PUBLISHED -> ARCHIVED.

Approval and publication are separate workflow steps and must remain distinct in relationship-level business rules.

Concept modelling recommendation for future schema mapping:

- Concepts should be reusable instructional entities associated with Topics.
- A Topic may teach multiple Concepts.
- Concepts should remain linkable to lesson notes, assessments, learner progress, and reporting.
- This should be implemented without breaking the approved core hierarchy.

Learner dashboard visibility rule:

- Only approved and published assigned curriculum content should be visible to learners.
- Draft, review, revision, and unpublished content must remain hidden from learner views.

---

# Assessment Relationships

The Assessment Module records all learner evaluations.

Assessments are linked directly to curriculum delivery.

---

## Assessment Relationship Model

```text
Schools

↓

Classes

↓

Subjects

↓

Assessments

↓

Assessment Questions

↓

Assessment Scores

↓

Student Reports
```

---

## Assessment Relationships

```text
Classes

1

↓

∞

Assessments
```

```text
Teachers

1

↓

∞

Assessments
```

```text
Assessments

1

↓

∞

Assessment Questions
```

```text
Assessments

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

Assessment Scores
```

```text
Assessment Scores

↓

Reports
```

Assessment results ultimately contribute to report generation.

---

# CBT Relationships

The CBT Module extends the Assessment Module.

Every CBT examination originates from an approved assessment.

---

## CBT Relationship Model

```text
Assessment

↓

CBT Examination

↓

Question Bank

↓

Questions

↓

Options

↓

Student Attempt

↓

Result
```

---

## CBT Relationships

```text
Assessments

1

↓

∞

CBT Examinations
```

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
Students

1

↓

∞

CBT Attempts
```

```text
CBT Attempts

1

↓

∞

Attempt Answers
```

```text
CBT Attempts

↓

CBT Results
```

---

# Attendance Relationships

Attendance is recorded daily for students and teachers.

---

## Attendance Relationship Model

```text
Schools

↓

Classes

↓

Attendance Register

↓

Attendance Records

↓

Students
```

---

## Attendance Relationships

```text
Classes

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

# Portfolio Relationships

Student portfolios showcase learning achievements.

---

## Portfolio Relationship Model

```text
Students

↓

Portfolio

↓

Projects

↓

Evidence

↓

Files

↓

Badges

↓

Certificates
```

---

## Portfolio Relationships

```text
Students

1

↓

∞

Portfolio Entries
```

```text
Portfolio Entries

1

↓

∞

Projects
```

```text
Projects

1

↓

∞

Portfolio Files
```

```text
Portfolio Entries

1

↓

∞

Portfolio Reflections
```

```text
Portfolio Entries

↓

Badges
```

---

# Certificate Relationships

Certificates are generated after successful completion of defined requirements.

---

## Certificate Relationship Model

```text
Students

↓

Certificates

↓

Certificate Templates

↓

Certificate Files
```

---

## Certificate Relationships

```text
Students

1

↓

∞

Certificates
```

```text
Certificate Templates

1

↓

∞

Certificates
```

```text
Certificates

1

↓

1

Certificate Files
```

Each issued certificate references a generated PDF stored in the File Storage Module.

---

# Report Relationships

Reports consolidate information from multiple modules.

---

## Report Relationship Model

```text
Student

↓

Assessment Scores

↓

Attendance

↓

Psychomotor

↓

Affective Domain

↓

Teacher Comments

↓

Principal Comments

↓

Generated Report
```

---

## Report Relationships

```text
Students

1

↓

∞

Reports
```

```text
Reports

↓

Assessment Scores
```

```text
Reports

↓

Attendance
```

```text
Reports

↓

Teacher Comments
```

```text
Reports

↓

Principal Comments
```

```text
Reports

↓

Report PDF
```

Reports serve as one of the primary aggregation entities within the database.

---

# File Storage Relationships

Almost every module references the File Storage Module.

---

## File Relationship Model

```text
Student

↓

Files
```

```text
Teacher

↓

Files
```

```text
School

↓

Logo

↓

Files
```

```text
Report

↓

PDF

↓

Files
```

```text
Certificate

↓

PDF

↓

Files
```

```text
Portfolio

↓

Evidence

↓

Files
```

---

## File Relationships

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

Access Logs
```

```text
Files

1

↓

∞

Shares
```

```text
Files

↓

Storage Locations
```

The File Storage Module functions as a shared enterprise service used across the entire platform.

---

# Business Rules

- Curriculum supports assessments, projects, and learning outcomes.
- Assessments generate assessment scores and CBT examinations.
- CBT results contribute to student performance records.
- Attendance contributes to report generation.
- Portfolios aggregate projects, files, badges, and certificates.
- Certificates reference approved templates and generated files.
- Reports consolidate data from multiple academic modules.
- Files are shared resources referenced by numerous business entities.
- Cross-module relationships should always maintain referential integrity.
- No module should duplicate information already managed by another module.

---

# End of Part 2

# Notification Relationships

The Notification Module delivers timely communication to users across the platform.

Notifications may be generated automatically by business events or manually by authorized users.

Notifications support multiple delivery channels while maintaining centralized tracking.

---

## Notification Relationship Model

```text
Schools

↓

Notification Templates

↓

Notification Events

↓

Notifications

↓

Recipients

↓

Delivery Channels

↓

Delivery Logs
```

---

## Notification Relationships

```text
Schools

1

↓

∞

Notification Templates
```

```text
Notification Templates

1

↓

∞

Notifications
```

```text
Notification Events

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
Notifications

1

↓

∞

Notification Delivery Logs
```

```text
Users

1

↓

∞

Notification Recipients
```

Every notification should maintain a complete delivery history.

---

# Authentication Relationships

Authentication controls secure access to the platform.

Authentication entities are closely integrated with User Management and Security.

---

## Authentication Relationship Model

```text
Users

↓

Authentication Accounts

↓

Login Sessions

↓

Refresh Tokens

↓

Password History

↓

Authentication Logs
```

---

## Authentication Relationships

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

Authentication Logs
```

```text
Users

1

↓

∞

Refresh Tokens
```

Authentication data should remain isolated from business data.

---

# Security Relationships

The Security Module monitors platform integrity and user activities.

---

## Security Relationship Model

```text
Users

↓

Audit Logs

↓

Security Events

↓

Incident Records

↓

Investigations
```

---

## Security Relationships

```text
Users

1

↓

∞

Audit Logs
```

```text
Users

1

↓

∞

Security Events
```

```text
Security Events

1

↓

∞

Incident Records
```

```text
Incident Records

↓

Investigations
```

Every security-sensitive action should be auditable.

---

# Settings Relationships

The Settings Module provides configuration used across all platform modules.

---

## Settings Relationship Model

```text
Platform

↓

System Settings

↓

School Settings

↓

Module Settings

↓

Application Behaviour
```

---

## Settings Relationships

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

Academic Settings
```

```text
Schools

1

↓

∞

Assessment Settings
```

```text
Schools

1

↓

∞

CBT Settings
```

```text
Schools

1

↓

∞

Report Settings
```

```text
Schools

1

↓

∞

Notification Settings
```

```text
Schools

1

↓

∞

Storage Settings
```

```text
Schools

1

↓

∞

Security Settings
```

Settings should never duplicate business data.

---

# Analytics Relationships

The Analytics Module aggregates operational and academic information.

Analytics tables should remain read-oriented and should not replace transactional records.

---

## Analytics Relationship Model

```text
Students

↓

Assessment Scores

↓

Reports

↓

Analytics

↓

Dashboards
```

---

## Analytics Relationships

```text
Schools

1

↓

∞

Dashboard Statistics
```

```text
Students

1

↓

∞

Performance Analytics
```

```text
Teachers

1

↓

∞

Teaching Analytics
```

```text
CBT Results

↓

Performance Analytics
```

```text
Reports

↓

Academic Analytics
```

Analytics should derive data from operational modules rather than storing duplicate business records.

---

# Audit Relationships

Audit logging spans the entire platform.

Nearly every business entity should generate audit records.

---

## Audit Relationship Model

```text
Users

↓

Audit Logs

↓

Business Entity

↓

Change History
```

---

## Audit Relationships

```text
Users

1

↓

∞

Audit Logs
```

```text
Audit Logs

↓

Students
```

```text
Audit Logs

↓

Teachers
```

```text
Audit Logs

↓

Reports
```

```text
Audit Logs

↓

Files
```

```text
Audit Logs

↓

Settings
```

Audit relationships support accountability and compliance.

---

# Cross-Module Relationships

The following diagram illustrates how the major modules interact.

```text
Schools

↓

Academic Structure

↓

Classes

↓

Students

↓

Curriculum

↓

Assessments

↓

Assessment Scores

↓

CBT

↓

Attendance

↓

Reports

↓

Certificates

↓

Portfolio

↓

Files

↓

Analytics

↓

Dashboard
```

This represents the primary academic data flow across the platform.

---

# Shared Entity Relationships

Certain entities serve multiple modules.

Examples include:

| Shared Entity | Referenced By |
|--------------|---------------|
| Schools | All Modules |
| Users | Authentication, Security, Audit, Notifications |
| Students | Assessments, Reports, CBT, Attendance, Portfolio |
| Teachers | Assessments, Attendance, Curriculum, Reports |
| Files | Reports, Portfolios, Certificates, Branding, CBT |
| Settings | Every Module |
| Audit Logs | Every Module |

Shared entities should never contain duplicated information.

---

# Junction Table Relationships

Many-to-many relationships should always be implemented through junction tables.

Examples include:

```text
Teachers

↓

Teacher_Subject_Assignments

↓

Subjects
```

```text
Students

↓

Student_Class_Enrollments

↓

Classes
```

```text
Users

↓

Role_Permissions

↓

Permissions
```

```text
Reports

↓

Report_Approvals

↓

Approvers
```

Junction tables simplify normalization and improve scalability.

---

# Dependency Flow

Module dependencies follow a layered structure.

```text
Platform

↓

Schools

↓

Users

↓

Academic Structure

↓

Students & Teachers

↓

Curriculum

↓

Assessments

↓

Reports

↓

Certificates

↓

Analytics

↓

Dashboard
```

Higher-level modules should not depend directly on reporting or analytics layers.

---

# Referential Integrity Rules

Every foreign key should enforce referential integrity.

Requirements include:

- Valid Parent Record
- Valid Foreign Key
- Consistent UUID Usage
- Indexed Foreign Keys
- Controlled Cascade Behaviour
- Constraint Validation

Broken relationships should never exist in production.

---

# Business Rules

- Every module should reference existing parent entities.
- Analytics must consume operational data without duplicating records.
- Settings provide configuration but do not replace business entities.
- Authentication entities remain separate from business entities.
- Security entities monitor every major module.
- Shared entities should remain normalized.
- Junction tables should implement all many-to-many relationships.
- Foreign key constraints are mandatory.
- Referential integrity must be maintained throughout the platform.
- Cross-module dependencies should remain consistent with the approved architecture.

---

# End of Part 3

# Enterprise Relationship Governance

This section establishes the enterprise governance framework for database relationships within the Nobletech Education Management Platform (NEMP).

The objective is to ensure that all relationships remain consistent, scalable, secure, maintainable, and fully aligned with the platform architecture throughout its lifecycle.

These standards apply to:

- Primary Keys
- Foreign Keys
- Junction Tables
- Referential Integrity
- Entity Dependencies
- Database Constraints
- Relationship Naming
- Cascade Operations
- Indexing
- Query Optimization

---

# Relationship Governance Principles

NEMP adopts the following database relationship principles:

- Referential Integrity First
- Normalization Before Duplication
- UUID-Based Relationships
- Explicit Foreign Keys
- Multi-Tenant Isolation
- Consistent Naming
- Controlled Cascade Operations
- Auditability
- Performance Optimization
- Future Expandability

These principles govern every relationship within the database.

---

# Primary Key Standards

Every business entity shall have a single primary key.

Requirements:

- UUID Version 4 (UUIDv4)
- Immutable
- Unique
- Non-Nullable
- Indexed

Examples:

```text
student_id

teacher_id

school_id

assessment_id

report_id
```

Primary keys should never change after record creation.

---

# Foreign Key Standards

Every child entity should reference its parent using an explicit foreign key.

Examples:

```text
students.school_id

→ schools.school_id
```

```text
classes.term_id

→ terms.term_id
```

```text
reports.student_id

→ students.student_id
```

```text
assessment_scores.assessment_id

→ assessments.assessment_id
```

Foreign keys must always reference existing parent records.

---

# Foreign Key Naming Convention

Foreign keys should follow a consistent naming pattern.

Standard:

```text
<parent_entity>_id
```

Examples:

```text
school_id

student_id

teacher_id

assessment_id

report_id

class_id

session_id

term_id
```

Consistent naming improves readability and maintainability.

---

# Cascade Rules

Relationships should use carefully selected cascade behaviors.

Recommended standards:

| Action | Usage |
|---------|------|
| RESTRICT | Default for critical academic records |
| CASCADE | Junction tables and dependent child records |
| SET NULL | Optional relationships |
| NO ACTION | Controlled business validation |

Examples:

```text
School

↓

Students

ON DELETE RESTRICT
```

```text
Report

↓

Report PDF

ON DELETE CASCADE
```

```text
Teacher

↓

Optional Profile Picture

ON DELETE SET NULL
```

Cascade rules should protect historical educational records.

---

# Referential Integrity

Referential integrity ensures that relationships remain valid.

Requirements:

- Valid Parent Records
- Valid Foreign Keys
- No Orphan Records
- Constraint Enforcement
- Transaction Safety

Integrity violations should never occur in production.

---

# Many-to-Many Standards

Many-to-many relationships should never be implemented directly.

Instead, use junction tables.

Examples:

```text
Teachers

↓

teacher_subject_assignments

↓

Subjects
```

```text
Students

↓

student_class_enrollments

↓

Classes
```

```text
Users

↓

role_permissions

↓

Permissions
```

Junction tables improve normalization and scalability.

---

# Relationship Cardinality Standards

Supported relationship types include:

## One-to-One

```text
Student

1

↓

1

Student Profile
```

---

## One-to-Many

```text
School

1

↓

∞

Students
```

---

## Many-to-Many

```text
Teachers

∞

↓

Teacher Subject Assignment

↓

∞

Subjects
```

Relationship cardinality should be documented for every entity pair.

---

# Indexing Strategy

Every relationship should support efficient querying.

Indexes should exist on:

- Primary Keys
- Foreign Keys
- Frequently Joined Columns
- Frequently Filtered Columns

Composite indexes should be introduced where query patterns justify them.

---

# Relationship Performance

Database relationships should support:

- Fast JOIN Operations
- Efficient Filtering
- Efficient Sorting
- Aggregate Queries
- Reporting
- Analytics

Relationship design should minimize unnecessary table scans.

---

# Entity Lifecycle Management

Entities should maintain valid relationships throughout their lifecycle.

Typical lifecycle:

```text
Create

↓

Read

↓

Update

↓

Archive

↓

Soft Delete

↓

Permanent Delete (Where Applicable)
```

Relationships should remain valid at every stage.

---

# Soft Delete Strategy

Critical academic records should support logical deletion.

Requirements:

- Preserve Foreign Keys
- Preserve Audit History
- Maintain Reporting Integrity
- Support Restoration

Soft-deleted records should remain excluded from standard application queries.

---

# Database Dependency Hierarchy

The platform follows the following dependency hierarchy:

```text
Platform

↓

Schools

↓

Users

↓

Academic Structure

↓

Students

↓

Teachers

↓

Curriculum

↓

Assessments

↓

Assessment Scores

↓

Attendance

↓

Reports

↓

Certificates

↓

Portfolios

↓

Files

↓

Analytics

↓

Dashboards
```

Dependencies should always flow downward.

---

# Relationship Validation

Relationships should be validated during:

- Record Creation
- Record Update
- Database Migration
- Import Operations
- Synchronization
- Restore Operations

Validation failures should prevent invalid data from being committed.

---

# Audit Requirements

Relationship changes should generate audit records.

Examples:

- Parent Changed
- Class Reassignment
- Teacher Assignment
- Student Transfer
- Report Approval
- Permission Changes

Audit logs should preserve both previous and new relationship values where appropriate.

---

# Multi-Tenant Relationship Isolation

Every tenant (school) should remain completely isolated.

Rules include:

- Foreign keys must not cross tenants.
- Queries must always filter by `school_id` where applicable.
- Shared platform tables should not expose tenant-specific data.
- Cross-school relationships are prohibited unless explicitly supported by platform design.

Tenant isolation is mandatory for data security.

---

# AI-Assisted Relationship Analysis

Artificial Intelligence may assist with:

- Relationship Validation
- Foreign Key Analysis
- Missing Index Detection
- Query Optimization Suggestions
- Dependency Analysis
- Schema Documentation
- ER Diagram Generation

AI recommendations should always be reviewed by a qualified developer or database administrator before implementation.

---

# Future Expansion Strategy

The relationship architecture supports future modules including:

- Finance
- Payroll
- Human Resources
- Library Management
- Hostel Management
- Transportation
- Inventory
- Parent Mobile App
- Student Mobile App
- Learning Management System (LMS)
- AI Academic Assistant

Future modules should integrate using the same relationship standards defined in this document.

---

# Master Relationship Overview

```text
Platform

↓

Schools

↓

Users

↓

Academic Sessions

↓

Terms

↓

Classes

↓

Students

↓

Teachers

↓

Curriculum

↓

Programme Components

↓

Topics

↓

Projects

↓

Assessments

↓

Assessment Scores

↓

CBT

↓

Attendance

↓

Reports

↓

Certificates

↓

Portfolio

↓

Files

↓

Notifications

↓

Analytics

↓

Dashboard
```

This represents the master logical relationship hierarchy for the entire NEMP platform.

---

# Summary

The Database Entity Relationship Guide establishes the authoritative relationship architecture for the Nobletech Education Management Platform (NEMP). It defines how every entity interacts within the platform while preserving referential integrity, normalization, performance, security, and multi-tenant isolation.

By standardizing primary keys, foreign keys, relationship cardinality, junction tables, cascade behaviors, indexing strategies, validation rules, and governance principles, this guide ensures that all database modules operate as a unified and scalable enterprise system.

Designed to support long-term growth, the relationship model accommodates future modules and integrations without requiring structural redesign. It also provides a consistent reference for developers, architects, database administrators, testers, and future maintenance teams.

This document serves as the definitive reference for all entity relationships, foreign key mappings, database dependencies, and referential integrity rules throughout the NEMP ecosystem.

---

# End of Document

---

# Phase 2D Academic Relationship Alignment Notes

Phase 2D implementation confirms the following canonical academic relationship chain for foundation schema:

```text
Schools

1

↓

∞

Academic Sessions

1

↓

∞

Terms

1

↓

∞

Academic Classes

1

↓

∞

Student Enrolments
```

Learner placement and history handling:

- Student-to-class placement is represented through enrolment records, not mutable class overwrite on student identity.
- Promotion, repetition, transfer, withdrawal, graduation, correction, and re-enrolment are supported through additional enrolment rows and linked history references.
- Historical reports and assessments remain linked to historical enrolment context.

Teacher assignment in Phase 2D foundation:

- Class-level assignment is represented through `academic_class_teacher_assignments`.
- Assignment is school-scoped and session-scoped, with optional term scope.
- Subject- and programme-component-specific assignment remains deferred to later milestone implementation.

Tenant-isolation enforcement notes:

- Composite school-scoped foreign keys are implemented on key academic joins to prevent cross-tenant linkage.
- Additional service validation is still required for date containment rules such as term-within-session windows.

---

# Phase 2E Programme Component and Subject/Domain Relationship Alignment Notes

Phase 2E implementation confirms the following additional relationship chain for foundation schema:

```text
Subjects

1

↓

∞

School Subjects

Subjects

∞

↔

∞

Integration Domains

(through subject_integration_domains)

Programme Components

∞

↔

∞

Subjects

(through programme_component_subjects)

Programme Components

∞

↔

∞

Integration Domains

(through programme_component_integration_domains)

Schools

1

↓

∞

School Programme Components

1

↓

∞

Term Programme Components

1

↓

∞

Class Programme Components
```

Tenant-isolation and history handling:

- Composite school-scoped foreign keys are implemented on term and class programme-component links to prevent cross-school joins.
- Partial unique indexes enforce one active scoped configuration while preserving archival history via archived rows.
- Subject and programme-component local school codes are unique per school only for active non-archived rows.

Assignment boundary retained:

- Subject-level or programme-component-level teacher assignment remains deferred from Phase 2E operational implementation.

---

# Phase 2F Master Content and Curriculum Source Relationship Alignment Notes

Phase 2F implementation adds the reusable source and master relationship foundation before operational curriculum publication workflows.

```text
Curriculum Sources

1

↓

∞

Curriculum Source Contents

Curriculum Sources

1

↓

∞

Curriculum Source Master Content Links

Curriculum Source Master Content Links

∞

→

1

Exactly one target master entity per link row
```

```text
Master Curriculum Units

1

↓

∞

Master Topics

Master Topics

∞

↔

∞

Master Concepts / Master Skills / Master Learning Outcomes

Master Topics

∞

↔

∞

Master Activities / Master Projects
```

```text
Master Projects

1

↓

∞

Master Project Implementations

Master Activities and Master Projects

∞

↔

∞

Master Resources
```

Governance and isolation alignment:

- Global reusable records are represented by nullable `school_id`; school-owned records use non-null `school_id`.
- Source-type checks enforce ownership shape for school-scheme and internal Nobletech source records.
- Lineage rows enforce single-target integrity per record for auditable provenance.
- Cross-tenant visibility and authorization remain service-layer and RBAC controls, while referential integrity remains database-enforced.