# Nobletech Education Management Platform (NEMP)

# 03_DATABASE_DESIGN

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Database Design |
| Document Code | NEMP-DBD-003 |
| Version | 1.0 |
| Status | Approved |
| Prepared By | Nobletech Academy |
| Classification | Internal Use Only |

---

# 1. Purpose

This document defines the database architecture and design principles of the Nobletech Education Management Platform (NEMP).

It describes how data will be organized, stored, secured, related, retrieved, archived, and maintained across the platform.

This document does **not** define individual table columns. Those are documented separately in **11_DATABASE_SCHEMA.md**.

---

# 2. Database Objectives

The database shall:

- Support unlimited schools.
- Support unlimited users.
- Support unlimited students.
- Support unlimited academic sessions.
- Support unlimited terms.
- Support unlimited classes.
- Support unlimited programme components.
- Support unlimited curriculum structures.
- Support unlimited assessments.
- Support unlimited reports.
- Support unlimited CBT examinations.
- Maintain data integrity.
- Prevent data duplication.
- Ensure high performance.
- Support future expansion without redesign.

---

# 3. Database Management System

The platform shall use:

**PostgreSQL**

Reasons for selection:

- Enterprise-grade reliability
- Excellent performance
- Advanced indexing
- JSON support
- ACID compliance
- Strong security
- Open source
- Scalable
- Excellent support for complex relationships

---

# 4. Database Architecture

The platform follows a **Relational Database Model**.

Data shall be organized into normalized tables connected by primary keys and foreign keys.

Relationships shall enforce data integrity.

---

# 5. Multi-Tenant Database Design

The platform is a Multi-Tenant SaaS application.

Each record belonging to a school shall contain a `school_id`.

This ensures complete separation of data between schools.

Example:

Schools

↓

Classes

↓

Students

↓

Curriculum

↓

Assessments

↓

Reports

No school shall have access to another school's records.

---

# 6. Database Design Principles

The database shall follow these principles:

- Data normalization
- Referential integrity
- Minimal redundancy
- High performance
- Scalability
- Consistency
- Flexibility
- Maintainability
- Security
- Auditability

---

# 7. Normalization Strategy

The database shall be normalized to at least **Third Normal Form (3NF)**.

Benefits include:

- Reduced duplication
- Easier maintenance
- Better consistency
- Improved scalability

Selective denormalization may be applied only where performance testing demonstrates a measurable benefit.

---

# 8. Primary Keys

Every table shall contain a unique primary key.

Standard:

- UUID (Universally Unique Identifier)

Example:

- school_id
- student_id
- curriculum_id
- report_id

UUIDs reduce predictability and simplify distributed systems.

---

# 9. Foreign Keys

Relationships shall be enforced using foreign keys.

Examples:

- student → class
- class → school
- curriculum → programme component
- report → student
- assessment → curriculum

Foreign key constraints shall maintain referential integrity.

---

# 10. Standard Columns

Unless there is a justified exception, every business table shall include:

- table-specific UUID primary key, for example school_id, student_id, curriculum_id
- school_id (where applicable)
- created_at
- updated_at
- created_by
- updated_by
- is_active
- is_deleted

Soft deletion shall be preferred over permanent deletion.

---

# 11. Soft Delete Strategy

Records shall not be permanently deleted during normal operations.

Instead:

- is_deleted = TRUE
- deleted_at
- deleted_by

This preserves historical data and supports audit requirements.

Permanent deletion shall be restricted to authorized administrators.

---

# 12. Audit Data

Critical business tables shall support audit tracking.

Audit information includes:

- Record created by
- Record updated by
- Record deleted by
- Timestamp of each action

Separate audit logs shall record detailed user activities.

---

# 13. Version Control

Certain entities shall support versioning.

Examples:

- Curriculum
- Assessment Templates
- Report Templates
- School Branding
- Generated Reports
- Published Report Snapshots

Previous versions shall remain available for historical reference.

---

# 14. File Storage Strategy

Large files shall **not** be stored directly in the database.

Examples:

- Logos
- Student photographs
- Principal signatures
- School stamps
- PDF reports
- Curriculum PDFs
- Attachments

The database shall store only metadata and secure file references.

---

# 15. Naming Standards

## Tables

Use plural nouns in snake_case.

Examples:

- schools
- students
- classes
- reports
- assessments

---

## Columns

Use snake_case.

Examples:

- first_name
- created_at
- admission_number
- programme_component_id

---

## Primary Keys

Use:

`table_name_singular_id`

Examples:

- school_id
- student_id
- report_id

---

# 16. Data Types

Preferred data types include:

- UUID
- VARCHAR
- TEXT
- BOOLEAN
- INTEGER
- DECIMAL
- DATE
- TIME
- TIMESTAMP
- JSONB

JSONB shall be used only where structured flexibility is required.

---

# 17. Indexing Strategy

Indexes shall be created for:

- Primary Keys
- Foreign Keys
- Admission Number
- Student Name
- School Name
- Academic Session
- Class
- Programme Component
- Report Number
- CBT Questions
- Curriculum Unit
- Topic
- Project
- Assessment Result
- Report Status
- Created Date
- School + Session + Term + Class composite indexes

Composite indexes shall be used where appropriate to optimize common queries.

---

# 18. Data Integrity

The database shall enforce:

- Primary Keys
- Foreign Keys
- Unique Constraints
- Check Constraints
- Required Fields
- Default Values

Business rules shall also be enforced within the application layer.

---

# 19. Transactions

Operations affecting multiple tables shall execute within database transactions.

Examples:

- Student registration
- Report approval
- Assessment submission
- Curriculum publishing

Transactions shall guarantee atomicity and consistency.

---

# 20. Performance Strategy

Performance optimization shall include:

- Proper indexing
- Query optimization
- Pagination
- Lazy loading
- Efficient joins
- Connection pooling
- Query analysis

Performance shall be monitored continuously.

---

# 21. Backup Strategy

The platform shall support:

- Automatic daily backups
- Manual backups
- Encrypted backups
- Point-in-time recovery (where supported)
- Backup verification

Backup retention policies shall be configurable.

---

# 22. Security Strategy

Database security shall include:

- Encrypted connections
- Strong authentication
- Least-privilege access
- Role-based permissions
- Backup encryption
- Audit logging
- Sensitive data protection

Passwords shall never be stored in plain text.

---

# 23. Data Retention

Historical records shall be retained unless explicitly removed according to organizational policies.

Examples:

- Reports
- Assessments
- Curriculum versions
- Audit logs

Retention policies shall be configurable.

---

# 24. Scalability Strategy

The database shall support:

- Unlimited schools
- Millions of students
- Millions of reports
- Millions of assessments
- Millions of CBT records

The design shall allow future:

- Read replicas
- Database partitioning
- Horizontal scaling
- Cloud-managed database services

---

# 25. High-Level Entity Relationships

The following entities form the core of the platform:

- Schools
- Users
- Roles
- Permissions
- Academic Sessions
- Terms
- Classes
- Students
- Programme Components
- Curriculum Templates
- Curriculum Units
- Topics
- Projects
- Learning Outcomes
- Resources
- Assessments
- Assessment Types
- Skills
- Reports
- Report Templates
- PDF Files
- CBT Questions
- CBT Exams
- Notifications
- Audit Logs
- Concepts
- Project Implementations
- Student Portfolios
- Achievement Badges
- Certificates
- Report Snapshots
- Report Verification
- Analytics Metrics
- File Metadata

These entities will be defined in detail within **11_DATABASE_SCHEMA.md**.

---

# 26. Database Design Summary

The NEMP database is designed as a secure, normalized, scalable, and multi-tenant relational database.

It provides a robust foundation for curriculum management, assessment processing, dynamic report generation, PDF rendering, CBT examinations, analytics, and future platform expansion.

The database architecture emphasizes:

- Data integrity
- Performance
- Scalability
- Security
- Maintainability
- Configurability

This design serves as the authoritative guide for implementing the PostgreSQL database and all related data access layers.

---

# 27. Phase 1.2 Identity and Access Planning Decisions

The database design must preserve a strict identity distinction:

- student_id: immutable internal learner identifier.
- student_number: canonical NEMP academic reference identifier.
- admission_number: optional external school-provided reference identifier.
- username: login identifier.
- email: optional contact or optional login attribute based on policy.

For pupil and student identities:

- Email must not be mandatory.
- Username must be globally unique across NEMP.
- Username must support permanent learner access unless changed by authorized administrators.
- Username generation must be case-insensitive.
- Username change history must remain auditable.
- Password reset and account recovery must not rely exclusively on learner email.

---

# 28. Phase 1.1 Curriculum Concept Planning Decisions

The approved instructional hierarchy remains unchanged:

Programme Component -> Curriculum -> Curriculum Unit -> Topic -> Project -> Learning Outcome

Concept modelling recommendation for future schema mapping:

- Introduce reusable concept structures linked to topics through relationships, not by replacing Topic.
- A topic may map to multiple concepts.
- Skills and learning outcomes remain distinct measurable entities.

No new concept table is created in this phase.

---

# 29. Phase 1.1 External Resource and Reporting Planning Decisions

External learning resources should support launch policy metadata including EMBEDDED, NEW_TAB, SAME_WINDOW, and INTERNAL_RESOURCE modes.

Design controls:

- Embed only where external platform policy permits.
- Enforce secure fallback to NEW_TAB where embedding is blocked.
- Require approval and active status before learner visibility.
- Store third-party access details securely and never in plain text.

One-page report planning controls:

- A4 Portrait default.
- A4 Landscape only for approved template exceptions.
- One-page mode must support preview and overflow warning before publication.
- Published outputs remain immutable and corrected via versioned revisions.

---

# End of Document