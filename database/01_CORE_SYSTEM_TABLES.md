# Nobletech Education Management Platform (NEMP)

# 01_CORE_SYSTEM_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Core System Tables |
| Document Code | NEMP-DB-CORE-001 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

This document defines the core database tables required for the operation of the Nobletech Education Management Platform.

These tables are shared across the entire application and are referenced by almost every other module.

These tables must be created before all other database tables.

---

# Standard Audit Columns

All operational tables within NEMP shall include the following standard audit fields unless there is a valid technical reason to omit them.

- created_at
- created_by
- updated_at
- updated_by
- is_active

Where soft deletion is supported, the following field shall also be included:

- deleted_at (nullable)

# Tenant Ownership

Every operational table shall clearly define its ownership.

Ownership Types

• Platform

• School

• Student

• User

Platform-owned tables shall not contain school_id.

School-owned tables shall contain school_id.

Student-owned tables shall reference student_id.

User-owned tables shall reference user_id.


# Core Tables

The Core System consists of the following tables.

1. schools
2. system_settings
3. academic_sessions
4. academic_terms
5. classes
6. class_arms
7. programme_components
8. grading_systems
9. grading_system_items

---

# Table: schools

## Purpose

Stores information about every school registered on the platform.

Every other business table references this table.

---

# Configuration Tables

Configuration tables store reusable data that allows schools to customize behaviour without requiring application code changes.

Examples include:

- Grading Systems
- Assessment Types
- Programme Components
- School Branding
- Notification Templates
- Report Templates

## Business Rules

- School Name must be unique.
- School Code must be unique.
- A school cannot be permanently deleted if it contains students.
- One school owns all its data.
- A school can have multiple academic sessions.
- A school can have multiple classes.
- A school can have multiple administrators.
- No operational table shall duplicate data that can be derived through existing    relationships.
- The system shall prioritize normalization while allowing controlled denormalization only where required for performance or reporting.

---

# Foreign Key Rules

Foreign keys shall enforce referential integrity across the platform.

Deletion rules shall be selected based on business requirements using:

- CASCADE
- RESTRICT
- SET NULL

Physical deletion of operational records should be avoided where audit history must be preserved.



## Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|-------------|-------------|
| school_id | UUID | Primary Key | Unique identifier |
| school_code | VARCHAR(20) | Unique, Required | Unique school code |
| school_name | VARCHAR(200) | Unique, Required | Official school name |
| school_logo | TEXT | Nullable | Logo URL |
| school_motto | VARCHAR(250) | Nullable | School motto |
| primary_colour | VARCHAR(20) | Nullable | Theme colour |
| secondary_colour | VARCHAR(20) | Nullable | Theme colour |
| address | TEXT | Nullable | School address |
| phone_number | VARCHAR(30) | Nullable | Contact number |
| email | VARCHAR(150) | Nullable | Official email |
| website | VARCHAR(200) | Nullable | School website |
| principal_name | VARCHAR(150) | Nullable | Principal's name |
| principal_signature | TEXT | Nullable | Signature URL |
| school_stamp | TEXT | Nullable | Stamp URL |
| report_title | VARCHAR(150) | Nullable | Report title |
| academic_year_format | VARCHAR(50) | Default '2026/2027' | Display format |
| is_active | BOOLEAN | Default TRUE | School status |
| is_deleted | BOOLEAN | Default FALSE | Soft delete |
| created_at | TIMESTAMP | Required | Created date |
| updated_at | TIMESTAMP | Required | Updated date |
| created_by | UUID | Nullable | User reference |
| updated_by | UUID | Nullable | User reference |

---

## Indexes

- school_id
- school_code
- school_name

---

## Relationships

schools

↓

academic_sessions

↓

classes

↓

students

↓

reports

---

# Table: system_settings

## Purpose

Stores global system configuration.

Only Super Administrator can modify.

---

## Business Rules

- Only one active record should exist.
- Stores platform-wide configuration.
- Does not contain school-specific settings.

---

## Columns

| Column | Data Type | Constraints |
|---------|-----------|-------------|
| setting_id | UUID | Primary Key |
| platform_name | VARCHAR(200) | Required |
| platform_version | VARCHAR(20) | Required |
| support_email | VARCHAR(150) | Nullable |
| support_phone | VARCHAR(50) | Nullable |
| default_timezone | VARCHAR(50) | Required |
| default_language | VARCHAR(50) | Required |
| maintenance_mode | BOOLEAN | Default FALSE |
| allow_registration | BOOLEAN | Default FALSE |
| created_at | TIMESTAMP | Required |
| updated_at | TIMESTAMP | Required |

---

# Table: academic_sessions

## Purpose

Stores every academic session belonging to a school.

Example

2025/2026

2026/2027

---

## Business Rules

- A school can have many sessions.
- Only one session can be active.
- Historical sessions cannot be deleted.

---

## Columns

| Column | Data Type | Constraints |
|---------|-----------|-------------|
| session_id | UUID | Primary Key |
| school_id | UUID | Foreign Key |
| session_name | VARCHAR(30) | Required |
| start_date | DATE | Required |
| end_date | DATE | Required |
| is_current | BOOLEAN | Default FALSE |
| created_at | TIMESTAMP | Required |
| updated_at | TIMESTAMP | Required |

---

## Foreign Keys

school_id

→ schools

---

# Table: academic_terms

## Purpose

Stores academic terms for each academic session.

Examples

First Term

Second Term

Third Term

---

## Business Rules

- A session may have multiple terms.
- Only one term can be active.
- Schools may customize term names.

---

## Columns

| Column | Data Type | Constraints |
|---------|-----------|-------------|
| term_id | UUID | Primary Key |
| session_id | UUID | Foreign Key |
| term_name | VARCHAR(50) | Required |
| start_date | DATE | Required |
| end_date | DATE | Required |
| is_current | BOOLEAN | Default FALSE |
| created_at | TIMESTAMP | Required |
| updated_at | TIMESTAMP | Required |

---

# Table: classes

## Purpose

Stores all classes within each school.

---

## Business Rules

- A class belongs to one school.
- A class may contain multiple students.
- A class may contain multiple programme components.

---

## Columns

| Column | Data Type | Constraints |
|---------|-----------|-------------|
| class_id | UUID | Primary Key |
| school_id | UUID | Foreign Key |
| class_name | VARCHAR(100) | Required |
| class_level | INTEGER | Nullable |
| description | TEXT | Nullable |
| is_active | BOOLEAN | Default TRUE |
| created_at | TIMESTAMP | Required |
| updated_at | TIMESTAMP | Required |

---

# Table: class_arms

## Purpose

Stores optional class arms.

Examples

Gold

Silver

Diamond

Emerald

---

## Columns

| Column | Data Type |
|---------|-----------|
| arm_id | UUID |
| class_id | UUID |
| arm_name | VARCHAR(100) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# Table: programme_components

## Purpose

Stores every programme component offered by Nobletech Academy.

Nothing is hardcoded.

Administrators may add new components anytime.

---

## Examples

- Coding
- Robotics
- STEAM
- AI
- Python
- Arduino
- Web Development
- IoT
- Cybersecurity
- Animation
- Electronics
- Fun Science

---

## Columns

| Column | Data Type |
|---------|-----------|
| component_id | UUID |
| school_id | UUID |
| component_name | VARCHAR(150) |
| component_code | VARCHAR(30) |
| description | TEXT |
| display_order | INTEGER |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# Table: grading_systems

## Purpose

Stores grading systems.

Each school may have multiple grading systems.

Example

Primary

Secondary

Coding

---

## Columns

| Column | Data Type |
|---------|-----------|
| grading_system_id | UUID |
| school_id | UUID |
| grading_name | VARCHAR(100) |
| description | TEXT |
| is_default | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# Table: grading_system_items

## Purpose

Stores grading ranges.

Example

A

70-100

Excellent

---

## Columns

| Column | Data Type |
|---------|-----------|
| grading_item_id | UUID |
| grading_system_id | UUID |
| grade | VARCHAR(10) |
| minimum_score | DECIMAL(5,2) |
| maximum_score | DECIMAL(5,2) |
| remark | VARCHAR(100) |
| display_order | INTEGER |
| created_at | TIMESTAMP |

---

# Entity Relationship Overview

schools

↓

academic_sessions

↓

academic_terms

↓

classes

↓

class_arms

↓

students

↓

reports

Programme Components

↓

Curriculum

↓

Assessment

↓

Reports

Grading Systems

↓

Grading Items

↓

Report Engine

---

# Future Scalability

The database architecture shall support future modules including:

- Parent Portal
- Student Portal
- Mobile Applications
- Learning Management System (LMS)
- Billing
- Inventory
- Human Resources
- AI Services

without requiring redesign of the core schema.

# Summary

These Core System Tables provide the structural foundation of the Nobletech Education Management Platform.

All subsequent database modules—including Users, Curriculum, Assessments, Reports, CBT, Notifications, Analytics, and Audit Logs—depend on these tables and their relationships.

No business module should be implemented before these core tables are created and validated.

---

# End of Document