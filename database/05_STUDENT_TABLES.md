# Nobletech Education Management Platform (NEMP)

# 05_STUDENT_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform |
| Document | Student Tables |
| Document Code | NEMP-DB-STU-005 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

This document defines the student-related database tables for NEMP.

Student data is central to the platform because every curriculum record, assessment, CBT result, portfolio, achievement, certificate, and report card is linked to a student.

---

# Tables

1. students
2. student_guardians
3. student_enrollments
4. student_class_history
5. student_photos
6. student_status_history

---

# Table: students

## Purpose

Stores the primary profile of every student registered on the platform.

## Columns

| Column | Type | Description |
|------|------|-------------|
| student_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| student_number | VARCHAR(100) NULL | School or academic reference number |
| admission_number | VARCHAR(100) | Unique admission number within school |
| first_name | VARCHAR(100) | First name |
| middle_name | VARCHAR(100) NULL | Middle name |
| last_name | VARCHAR(100) | Last name |
| gender | VARCHAR(20) | Male, Female, Other |
| date_of_birth | DATE NULL | Date of birth |
| email | VARCHAR(150) NULL | Student email, if available |
| phone_number | VARCHAR(50) NULL | Student phone, if available |
| residential_address | TEXT NULL | Residential address |
| status | VARCHAR(50) | Active, Inactive, Graduated, Transferred, Archived |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |
| created_by | UUID | User who created record |
| updated_by | UUID | User who updated record |
| is_active | BOOLEAN | Active status |
| deleted_at | TIMESTAMP NULL | Soft delete date |

---

## Business Rules

- Admission number must be unique within a school.
- A student must belong to one school.
- A student must have an enrollment record before assessment or report generation.
- Student records should be soft deleted, not permanently deleted.
- Historical reports must remain linked to the student even if the student becomes inactive, transferred, or graduated.
- student_id is immutable and remains the permanent internal learner identity.
- student_number or admission_number are academic references and do not replace student_id.
- Learner login username is a separate authentication identifier and must not replace student_id.
- Student email is optional and may be added later without changing learner identity.
- `users.email` is authoritative for account-login email usage where email login is enabled.
- `students.email` is retained as optional learner profile contact email and is not treated as the canonical authentication email.

---

# Table: student_guardians

## Purpose

Stores parent or guardian information linked to a student.

## Columns

| Column | Type | Description |
|------|------|-------------|
| guardian_id | UUID | Primary key |
| student_id | UUID | Foreign key to students |
| school_id | UUID | Foreign key to schools |
| guardian_name | VARCHAR(150) | Parent or guardian name |
| relationship | VARCHAR(100) | Father, Mother, Guardian, Sponsor |
| phone_number | VARCHAR(50) | Guardian phone number |
| alternate_phone | VARCHAR(50) NULL | Optional alternate phone |
| email | VARCHAR(150) NULL | Guardian email |
| address | TEXT NULL | Guardian address |
| is_primary | BOOLEAN | Primary guardian |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

---

## Business Rules

- A student may have multiple guardians.
- One guardian should be marked as primary where applicable.
- Guardian details may be used for future notifications, reports, and parent portal access.

---

# Table: student_enrollments

## Purpose

Stores each student's enrollment for a specific academic session, term, class, and class arm.

This table allows the system to preserve student academic history over time.

## Columns

| Column | Type | Description |
|------|------|-------------|
| enrollment_id | UUID | Primary key |
| student_id | UUID | Foreign key to students |
| school_id | UUID | Foreign key to schools |
| session_id | UUID | Academic session |
| term_id | UUID | Academic term |
| class_id | UUID | Class |
| class_arm_id | UUID NULL | Optional class arm |
| enrollment_status | VARCHAR(50) | Active, Completed, Withdrawn, Promoted |
| enrolled_at | TIMESTAMP | Enrollment date |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

---

## Business Rules

- A student must have one active enrollment per school, session, term, and class.
- Reports must be generated using the enrollment record for the selected session and term.
- Assessment records must reference the correct enrollment context.
- Enrollment history must be preserved.
- Phase 2D implementation uses session-anchored enrolment with optional term linkage.
- Active or pending duplicate enrolment for the same student, school, and session is prohibited.
- Historical completed, withdrawn, transferred, promoted, graduated, archived, and re-enrolment flows are preserved through status lifecycle and linked history references.

---

# Table: student_class_history

## Purpose

Tracks a student's class movement over time.

Examples:

- Promotion
- Transfer to another class
- Change of class arm
- Repeat class
- Graduation

## Columns

| Column | Type | Description |
|------|------|-------------|
| class_history_id | UUID | Primary key |
| student_id | UUID | Foreign key to students |
| school_id | UUID | Foreign key to schools |
| previous_class_id | UUID NULL | Previous class |
| previous_class_arm_id | UUID NULL | Previous class arm |
| new_class_id | UUID | New class |
| new_class_arm_id | UUID NULL | New class arm |
| session_id | UUID | Academic session |
| term_id | UUID | Academic term |
| movement_type | VARCHAR(100) | Promotion, Transfer, Repeat, Graduation |
| reason | TEXT NULL | Reason for movement |
| changed_by | UUID | User who made the change |
| changed_at | TIMESTAMP | Date changed |

---

## Business Rules

- Every class movement must be recorded.
- Class history must not be deleted.
- Historical reports must continue to show the class originally used at the time of report generation.

---

# Table: student_photos

## Purpose

Stores student passport photographs and image history.

## Columns

| Column | Type | Description |
|------|------|-------------|
| photo_id | UUID | Primary key |
| student_id | UUID | Foreign key to students |
| school_id | UUID | Foreign key to schools |
| photo_url | TEXT | Student photo URL |
| is_current | BOOLEAN | Current photo |
| uploaded_by | UUID | User who uploaded photo |
| uploaded_at | TIMESTAMP | Upload date |

---

## Business Rules

- A student may have multiple photos over time.
- Only one photo should be marked as current.
- Published report snapshots must preserve the photo used during generation where applicable.

---

# Table: student_status_history

## Purpose

Tracks changes to a student's status.

Examples:

- Active
- Inactive
- Transferred
- Graduated
- Archived

## Columns

| Column | Type | Description |
|------|------|-------------|
| status_history_id | UUID | Primary key |
| student_id | UUID | Foreign key to students |
| school_id | UUID | Foreign key to schools |
| previous_status | VARCHAR(50) | Previous status |
| new_status | VARCHAR(50) | New status |
| reason | TEXT NULL | Reason for change |
| changed_by | UUID | User who changed status |
| changed_at | TIMESTAMP | Date changed |

---

## Business Rules

- Every status change must be recorded.
- Status history must not be deleted.
- Inactive students should remain available for historical reports and analytics.

---

# Relationships

---

# Phase 2D Implementation Notes

Prisma implementation in Phase 2D introduces `student_enrolments` as the authoritative historical placement anchor for class progression.

Applied implementation policy:

- One primary enrolment per learner, school, and session for active/pending state.
- Optional term linkage remains available for term-specific operational references.
- Student class progression across sessions is represented by new enrolment records, not destructive overwrite of prior records.
- Cross-school enrolment references are blocked by school-scoped composite foreign key constraints.

schools

↓

students

↓

student_guardians

↓

student_enrollments

↓

student_class_history

↓

student_photos

↓

student_status_history

students

↓

assessments

↓

reports

↓

portfolios

↓

certificates

---

# Summary

The Student Tables provide the foundation for managing student identity, guardianship, enrollment, class history, photo history, and status changes.

These tables ensure that student records remain accurate, traceable, and historically consistent across curriculum, assessment, CBT, portfolio, report generation, analytics, and future parent/student portals.

---

# End of Document