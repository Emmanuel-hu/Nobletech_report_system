# Nobletech Education Management Platform (NEMP)

# 03_SCHOOL_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform |
| Document | School Tables |
| Document Code | NEMP-DB-SCH-003 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

This document defines all database tables related to school setup, school branding, school configuration, report identity, signatures, and school-specific settings.

These tables support the multi-school architecture of NEMP.

Each school must be able to operate independently with its own branding, colours, logo, signatures, curriculum settings, report configuration, and users.

---

# School Tables

The School module consists of the following tables:

1. schools
2. school_profiles
3. school_branding
4. school_signatures
5. school_report_settings
6. school_contacts
7. school_status_history

---

# Table: schools

## Purpose

Stores the main record of every school registered on the platform.

## Columns

| Column | Type | Description |
|------|------|-------------|
| school_id | UUID | Primary key |
| school_code | VARCHAR(50) | Unique school code |
| school_name | VARCHAR(200) | Official school name |
| short_name | VARCHAR(100) | Short display name |
| school_type | VARCHAR(100) | Nursery, Primary, Secondary, Academy, etc. |
| status | VARCHAR(50) | Active, Suspended, Archived |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |
| created_by | UUID | User who created the record |
| updated_by | UUID | User who last updated the record |
| is_active | BOOLEAN | Active status |
| deleted_at | TIMESTAMP NULL | Soft delete date |

## Business Rules

- Each school must have a unique school code.
- Each school must have a unique official name.
- A school must not be permanently deleted if it has students, reports, curriculum, or assessments.
- School records should be soft deleted when necessary.

---

# Table: school_profiles

## Purpose

Stores extended school profile information.

## Columns

| Column | Type | Description |
|------|------|-------------|
| profile_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| motto | VARCHAR(255) | School motto |
| address | TEXT | School address |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State |
| country | VARCHAR(100) | Country |
| phone_number | VARCHAR(50) | Main phone number |
| email | VARCHAR(150) | Official email |
| website | VARCHAR(200) | School website |
| principal_name | VARCHAR(150) | Principal or Head of School |
| report_title | VARCHAR(200) | Report card title |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

## Business Rules

- One school should have one active profile.
- School profile details appear on reports where enabled.
- Profile changes should not automatically alter already published report snapshots.

---

# Table: school_branding

## Purpose

Stores branding settings for each school.

## Columns

| Column | Type | Description |
|------|------|-------------|
| branding_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| logo_url | TEXT | School logo |
| stamp_url | TEXT | School stamp |
| watermark_url | TEXT | Optional watermark |
| primary_colour | VARCHAR(20) | Main brand colour |
| secondary_colour | VARCHAR(20) | Secondary colour |
| accent_colour | VARCHAR(20) | Accent colour |
| header_style | VARCHAR(100) | Report header style |
| footer_style | VARCHAR(100) | Report footer style |
| font_family | VARCHAR(100) | Preferred font |
| is_current | BOOLEAN | Current branding version |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

## Business Rules

- Each school may have multiple branding records over time.
- Only one branding record should be marked as current.
- Published reports must preserve the branding used at the time of generation.

---

# Table: school_signatures

## Purpose

Stores signatures used on reports.

## Columns

| Column | Type | Description |
|------|------|-------------|
| signature_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| signature_title | VARCHAR(100) | Principal, Teacher, Supervisor, Director |
| signer_name | VARCHAR(150) | Name of signer |
| signer_position | VARCHAR(150) | Position |
| signature_url | TEXT | Signature image |
| display_order | INTEGER | Order on report |
| is_active | BOOLEAN | Active status |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

## Business Rules

- A school may have multiple signatures.
- Signatures may be shown or hidden based on report configuration.
- Historical reports must retain the signature used when the report was generated.

---

# Table: school_report_settings

## Purpose

Stores school-specific report settings.

## Columns

| Column | Type | Description |
|------|------|-------------|
| report_setting_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| show_logo | BOOLEAN | Display logo on report |
| show_motto | BOOLEAN | Display motto |
| show_address | BOOLEAN | Display address |
| show_signature | BOOLEAN | Display signatures |
| show_stamp | BOOLEAN | Display stamp |
| show_qr_code | BOOLEAN | Display QR code |
| show_barcode | BOOLEAN | Display barcode |
| show_tools_used | BOOLEAN | Display tools/software |
| show_projects | BOOLEAN | Display projects |
| show_topics | BOOLEAN | Display topics |
| show_learning_outcomes | BOOLEAN | Display learning outcomes |
| default_paper_size | VARCHAR(20) | A4, Letter |
| default_orientation | VARCHAR(20) | Portrait, Landscape |
| compact_report_mode | BOOLEAN | Compact report layout |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

## Business Rules

- Report settings control what appears on the printed report.
- Tools and software may be hidden while still stored internally.
- These settings must not alter historical published report snapshots.

---

# Table: school_contacts

## Purpose

Stores additional school contact persons.

## Columns

| Column | Type | Description |
|------|------|-------------|
| contact_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| contact_name | VARCHAR(150) | Contact person |
| position | VARCHAR(150) | Position |
| phone_number | VARCHAR(50) | Phone number |
| email | VARCHAR(150) | Email address |
| is_primary | BOOLEAN | Primary contact |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

## Business Rules

- A school may have multiple contact persons.
- Only one contact should be marked as primary where applicable.

---

# Table: school_status_history

## Purpose

Tracks changes in school status.

## Columns

| Column | Type | Description |
|------|------|-------------|
| status_history_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| previous_status | VARCHAR(50) | Previous status |
| new_status | VARCHAR(50) | New status |
| reason | TEXT | Reason for change |
| changed_by | UUID | User who changed status |
| changed_at | TIMESTAMP | Date changed |

## Business Rules

- Every school suspension, reactivation, or archive action must be recorded.
- Status history must not be deleted.

---

# Relationships

schools

↓

school_profiles

↓

school_branding

↓

school_signatures

↓

school_report_settings

↓

school_contacts

↓

school_status_history

---

# Summary

The School Tables provide the foundation for managing partner schools within NEMP.

They allow each school to maintain its own identity, branding, signatures, report settings, and operational status while preserving historical accuracy for published reports.

---

# End of Document