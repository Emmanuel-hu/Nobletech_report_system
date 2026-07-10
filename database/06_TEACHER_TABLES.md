# Nobletech Education Management Platform (NEMP)

# 06_TEACHER_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform |
| Document | Teacher Tables |
| Document Code | NEMP-DB-TCH-006 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

This document defines the database tables used to manage teachers and instructional staff within NEMP.

Teachers are responsible for curriculum delivery, assessments, attendance, CBT administration, report generation, project supervision, student evaluations, and academic comments.

---

# Tables

1. teachers
2. teacher_profiles
3. teacher_assignments
4. teacher_qualifications
5. teacher_specializations
6. teacher_status_history

---

# Table: teachers

## Purpose

Stores the primary record for every teacher or instructional staff member.

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| teacher_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| staff_number | VARCHAR(100) | Unique staff number |
| first_name | VARCHAR(100) | First name |
| middle_name | VARCHAR(100) NULL | Middle name |
| last_name | VARCHAR(100) | Last name |
| gender | VARCHAR(20) | Gender |
| date_of_birth | DATE NULL | Date of birth |
| email | VARCHAR(150) | Official email |
| phone_number | VARCHAR(50) | Phone number |
| employment_type | VARCHAR(100) | Full-time, Part-time, Contract, Volunteer |
| employment_date | DATE | Date employed |
| status | VARCHAR(50) | Active, Inactive, Suspended, Resigned |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |
| created_by | UUID | Created by |
| updated_by | UUID | Updated by |
| is_active | BOOLEAN | Active status |
| deleted_at | TIMESTAMP NULL | Soft delete |

---

## Business Rules

- Staff number must be unique within a school.
- A teacher belongs to one school.
- Teachers may teach multiple classes.
- Teachers may handle multiple programme components.
- Historical assessment and report records must remain linked to teachers even after resignation or transfer.

---

# Table: teacher_profiles

## Purpose

Stores additional teacher profile information.

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| profile_id | UUID | Primary key |
| teacher_id | UUID | Foreign key |
| residential_address | TEXT | Address |
| emergency_contact_name | VARCHAR(150) | Emergency contact |
| emergency_contact_phone | VARCHAR(50) | Contact number |
| profile_photo_url | TEXT NULL | Passport photograph |
| biography | TEXT NULL | Teacher profile |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

---

## Business Rules

- Each teacher has one active profile.
- Profile updates must not affect historical reports already published.

---

# Table: teacher_assignments

## Purpose

Stores teaching assignments.

Assignments may include:

- Class Teacher
- Subject Teacher
- Coding Instructor
- Robotics Instructor
- STEAM Instructor
- AI Instructor
- Supervisor
- CBT Coordinator

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| assignment_id | UUID | Primary key |
| teacher_id | UUID | Teacher |
| school_id | UUID | School |
| session_id | UUID | Academic session |
| term_id | UUID NULL | Academic term |
| class_id | UUID NULL | Class |
| class_arm_id | UUID NULL | Class arm |
| programme_component_id | UUID NULL | Programme component |
| assignment_role | VARCHAR(100) | Assignment role |
| start_date | DATE | Assignment start |
| end_date | DATE NULL | Assignment end |
| created_at | TIMESTAMP | Date created |

---

## Business Rules

- A teacher may have multiple assignments.
- Assignment history must be retained.
- Reports must reference the teacher assigned during the selected academic period.

---

# Table: teacher_qualifications

## Purpose

Stores teacher qualifications and certifications.

Examples

- B.Sc.
- B.Ed.
- PGDE
- TRCN
- Microsoft Certified Educator
- STEM Certification
- Robotics Certification

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| qualification_id | UUID | Primary key |
| teacher_id | UUID | Teacher |
| qualification_name | VARCHAR(200) | Qualification |
| institution | VARCHAR(200) | Institution |
| year_obtained | INTEGER | Year obtained |
| certificate_number | VARCHAR(100) NULL | Certificate number |
| created_at | TIMESTAMP | Date created |

---

## Business Rules

- Teachers may have multiple qualifications.
- Qualifications should remain permanently linked to the teacher.

---

# Table: teacher_specializations

## Purpose

Stores the areas of specialization for each teacher.

Examples

- Coding
- Robotics
- STEAM
- Python
- AI
- Web Development
- Arduino
- Electronics
- IoT
- Cybersecurity
- Animation
- Digital Literacy

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| specialization_id | UUID | Primary key |
| teacher_id | UUID | Teacher |
| programme_component_id | UUID | Programme component |
| competency_level | VARCHAR(100) | Beginner, Intermediate, Advanced, Expert |
| verified_by | UUID NULL | Verifying administrator |
| verified_at | TIMESTAMP NULL | Verification date |
| created_at | TIMESTAMP | Date created |

---

## Business Rules

- Teachers may have multiple specializations.
- Specializations support teacher assignment and analytics.

---

# Table: teacher_status_history

## Purpose

Tracks teacher status changes.

Examples

- Employed
- Confirmed
- Suspended
- Resigned
- Retired
- Contract Ended

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| status_history_id | UUID | Primary key |
| teacher_id | UUID | Teacher |
| school_id | UUID | School |
| previous_status | VARCHAR(50) | Previous status |
| new_status | VARCHAR(50) | New status |
| reason | TEXT NULL | Reason |
| changed_by | UUID | User making change |
| changed_at | TIMESTAMP | Date changed |

---

## Business Rules

- Every employment status change must be recorded.
- Status history must never be deleted.
- Historical academic records must continue referencing the teacher regardless of employment status.

---

# Relationships

Schools

↓

Teachers

↓

Teacher Profiles

↓

Teacher Assignments

↓

Teacher Qualifications

↓

Teacher Specializations

↓

Teacher Status History

Teachers

↓

Curriculum

↓

Assessment

↓

Attendance

↓

CBT

↓

Reports

↓

Student Portfolios

---

# Summary

The Teacher Tables provide a comprehensive framework for managing instructional staff within NEMP.

They support teacher identity, qualifications, assignments, programme specializations, and employment history while ensuring that curriculum delivery, assessments, reports, portfolios, CBT activities, and analytics remain historically accurate and fully traceable.

---

# End of Document