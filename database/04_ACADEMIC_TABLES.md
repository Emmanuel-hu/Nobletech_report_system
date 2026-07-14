# Nobletech Education Management Platform (NEMP)

# 04_ACADEMIC_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform |
| Document | Academic Structure Tables |
| Document Code | NEMP-DB-ACA-004 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

This document defines the academic structure of NEMP.

The academic structure provides the hierarchy used throughout the platform and ensures that every curriculum, assessment, report, and student record belongs to a specific academic session, term, class, and class arm.

---

# Academic Structure

School

↓

Academic Session

↓

Academic Term

↓

Class

↓

Class Arm

↓

Students

↓

Curriculum

↓

Assessment

↓

Reports

---

# Tables

1. academic_sessions
2. academic_terms
3. classes
4. class_arms
5. class_teachers
6. academic_calendar

---

# Table: academic_sessions

## Purpose

Stores academic sessions for each school.

Examples

2025/2026

2026/2027

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| session_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| session_name | VARCHAR(50) | Academic session |
| start_date | DATE | Session start |
| end_date | DATE | Session end |
| is_current | BOOLEAN | Current active session |
| status | VARCHAR(50) | Active, Closed, Archived |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |
| created_by | UUID | User who created record |
| updated_by | UUID | User who updated record |
| is_active | BOOLEAN | Active status |
| deleted_at | TIMESTAMP NULL | Soft delete |

---

# Business Rules

- A school may have many sessions.
- Only one session can be current.
- Published reports remain linked to the original academic session.

---

# Table: academic_terms

## Purpose

Stores academic terms within a session.

Examples

First Term

Second Term

Third Term

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| term_id | UUID | Primary key |
| school_id | UUID | Foreign key |
| session_id | UUID | Academic session |
| term_name | VARCHAR(50) | Term name |
| term_order | INTEGER | Display order |
| start_date | DATE | Start date |
| end_date | DATE | End date |
| is_current | BOOLEAN | Current term |
| status | VARCHAR(50) | Active, Closed |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

---

# Business Rules

- Every term belongs to one academic session.
- One session may contain multiple terms.
- Only one term can be current.

---

# Table: classes

## Purpose

Stores classes for each school.

Examples

Nursery 1

Nursery 2

Primary 1

Primary 2

Primary 3

Primary 4

Primary 5

Primary 6

JSS 1

JSS 2

JSS 3

SSS 1

SSS 2

SSS 3

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| class_id | UUID | Primary key |
| school_id | UUID | Foreign key |
| class_name | VARCHAR(100) | Class name |
| class_code | VARCHAR(50) | Unique code |
| display_order | INTEGER | Display order |
| educational_level | VARCHAR(100) | Nursery, Primary, Secondary, Academy |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |
| is_active | BOOLEAN | Active status |

---

# Business Rules

- Classes are unique within each school.
- Schools may customise class names where necessary.

---

# Table: class_arms

## Purpose

Stores class arms.

Examples

Gold

Silver

A

B

Blue

Green

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| class_arm_id | UUID | Primary key |
| class_id | UUID | Parent class |
| school_id | UUID | School |
| arm_name | VARCHAR(100) | Arm name |
| display_order | INTEGER | Display order |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |
| is_active | BOOLEAN | Active status |

---

# Business Rules

- A class may have multiple arms.
- Arm names must be unique within a class.

---

# Table: class_teachers

## Purpose

Assigns teachers to classes.

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| class_teacher_id | UUID | Primary key |
| class_id | UUID | Class |
| class_arm_id | UUID | Class arm |
| teacher_id | UUID | Teacher |
| session_id | UUID | Academic session |
| term_id | UUID NULL | Optional term assignment |
| assignment_type | VARCHAR(100) | Class Teacher, Subject Teacher, Assistant |
| start_date | DATE | Assignment start |
| end_date | DATE NULL | Assignment end |
| created_at | TIMESTAMP | Date created |

---

# Business Rules

- Teachers may teach multiple classes.
- Classes may have multiple teachers.
- Assignment history should be preserved.

---

# Table: academic_calendar

## Purpose

Stores important academic events.

Examples

Resumption

Mid-Term Break

Examination

Open Day

Graduation

Holiday

Coding Competition

Robotics Exhibition

STEAM Fair

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| calendar_event_id | UUID | Primary key |
| school_id | UUID | School |
| session_id | UUID | Session |
| term_id | UUID | Term |
| event_title | VARCHAR(200) | Event |
| event_description | TEXT | Description |
| start_date | DATE | Start |
| end_date | DATE | End |
| event_type | VARCHAR(100) | Academic, Examination, Holiday, Activity |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

---

# Business Rules

- Calendar events belong to a school.
- Events may span multiple days.
- Academic calendars may differ between schools.

---

# Relationships

Schools

↓

Academic Sessions

↓

Academic Terms

↓

Classes

↓

Class Arms

↓

Class Teachers

↓

Students

↓

Curriculum

↓

Assessment

↓

Reports

---

# Summary

The Academic Structure Tables define the organizational framework for every school using NEMP.

They provide a flexible and scalable hierarchy that supports multiple schools, academic sessions, terms, classes, and class arms while maintaining consistency across curriculum management, assessments, reports, CBT, analytics, and student portfolios.

---

# End of Document

---

# Phase 2D Implementation Notes (Prisma Foundation)

This document remains the approved academic reference. Phase 2D implementation has mapped the approved subset into Prisma using these canonical technical entities:

- `AcademicSession` -> `academic_sessions`
- `Term` -> `terms`
- `AcademicClass` -> `academic_classes`
- `StudentEnrolment` -> `student_enrolments`
- `AcademicClassTeacherAssignment` -> `academic_class_teacher_assignments`

Scope decisions applied in this milestone:

- `AcademicClass` is the canonical technical class model for implementation.
- User-facing labeling may remain "Class" or "Grade" by school preference.
- `class_arms` remains deferred from Phase 2D implementation.
- Subject and programme-component assignment scopes are deferred from Phase 2D teacher assignment implementation.
- Teacher assignment in Phase 2D is restricted to class-level academic assignment using existing `users` linkage with role-policy enforcement deferred to service layer.

Session and term current-state constraints implemented:

- One current active academic session per school.
- One current active term per school.

Date and ordering constraints implemented:

- Session start date must be before end date.
- Term start date must be before end date.
- Term sequence order must be positive.

Cross-table temporal constraint still requiring service validation:

- Term dates must remain within parent session date range.

Historical retention decisions:

- Academic records are restricted from destructive cascades.
- Enrolment and assignment history are preserved through status and archival patterns.