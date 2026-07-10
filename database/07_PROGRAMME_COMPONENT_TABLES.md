# Nobletech Education Management Platform (NEMP)

# 07_PROGRAMME_COMPONENT_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform |
| Document | Programme Component Tables |
| Document Code | NEMP-DB-PCO-007 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

This document defines the database tables for managing Programme Components within NEMP.

Programme Components represent the learning areas delivered by Nobletech Academy.

Examples include:

- Coding
- Robotics
- STEAM
- Artificial Intelligence
- Python
- Web Development
- Arduino
- IoT
- Electronics
- Cybersecurity
- Animation
- Fun Science
- Game Development

Programme Components must be configurable and must not be hardcoded.

---

# Tables

1. programme_components
2. school_programme_components
3. term_programme_components
4. class_programme_components
5. programme_component_settings
6. programme_component_status_history

---

# Table: programme_components

## Purpose

Stores the master list of Programme Components available on the platform.

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| programme_component_id | UUID | Primary key |
| component_name | VARCHAR(150) | Component name |
| component_code | VARCHAR(50) | Unique component code |
| description | TEXT | Description |
| icon_url | TEXT NULL | Optional icon |
| default_display_order | INTEGER | Default order |
| status | VARCHAR(50) | Active, Inactive, Archived |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |
| created_by | UUID | Created by |
| updated_by | UUID | Updated by |
| is_active | BOOLEAN | Active status |
| deleted_at | TIMESTAMP NULL | Soft delete |

---

## Business Rules

- Programme Component names must be unique.
- Programme Components are reusable across schools.
- Components may be archived but should not be permanently deleted if used in curriculum, assessment, reports, or CBT.
- New components can be added without code changes.

---

# Table: school_programme_components

## Purpose

Defines which Programme Components are available to a specific school.

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| school_programme_component_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| programme_component_id | UUID | Foreign key to programme_components |
| custom_component_name | VARCHAR(150) NULL | School-specific display name |
| display_order | INTEGER | Display order for school |
| is_enabled | BOOLEAN | Enabled for school |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

---

## Business Rules

- A school may enable only the components it offers.
- A school may rename a component for display purposes without changing the master component.
- Disabled components must not appear in curriculum assignment, assessment entry, or report generation for that school.

---

# Table: term_programme_components

## Purpose

Defines which Programme Components are active for a school in a specific academic session and term.

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| term_programme_component_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| session_id | UUID | Academic session |
| term_id | UUID | Academic term |
| programme_component_id | UUID | Programme component |
| is_enabled | BOOLEAN | Enabled for the term |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

---

## Business Rules

- Components may be enabled or disabled per term.
- A component disabled for a term must not appear in reports for that term.
- Term settings support changes in scheme of work across First, Second, and Third Term.

---

# Table: class_programme_components

## Purpose

Defines which Programme Components are active for a particular class within a school, session, and term.

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| class_programme_component_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| session_id | UUID | Academic session |
| term_id | UUID | Academic term |
| class_id | UUID | Class |
| class_arm_id | UUID NULL | Optional class arm |
| programme_component_id | UUID | Programme component |
| is_enabled | BOOLEAN | Enabled for class |
| display_order | INTEGER | Report display order |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

---

## Business Rules

- Programme Components may differ by class.
- A class may offer Coding and Robotics only, while another class may offer Coding, Robotics, AI, and Python.
- Only enabled class components shall appear in report generation.
- Disabled components must not leave blank spaces on the report.

---

# Table: programme_component_settings

## Purpose

Stores display and reporting preferences for each Programme Component.

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| component_setting_id | UUID | Primary key |
| school_id | UUID | Foreign key to schools |
| programme_component_id | UUID | Programme component |
| show_on_report | BOOLEAN | Display component on report |
| show_topics | BOOLEAN | Display topics |
| show_projects | BOOLEAN | Display projects |
| show_tools | BOOLEAN | Display tools/software |
| show_websites | BOOLEAN | Display websites |
| show_robotics_kits | BOOLEAN | Display robotics kits |
| show_learning_outcomes | BOOLEAN | Display learning outcomes |
| show_resources | BOOLEAN | Display resources |
| compact_display | BOOLEAN | Compact display mode |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

---

## Business Rules

- Visibility settings control report display only.
- Hidden information remains stored internally.
- Schools may decide not to expose tools/software used.
- Reports must respect component visibility settings.

---

# Table: programme_component_status_history

## Purpose

Tracks status changes for Programme Components.

---

## Columns

| Column | Type | Description |
|------|------|-------------|
| status_history_id | UUID | Primary key |
| programme_component_id | UUID | Programme component |
| previous_status | VARCHAR(50) | Previous status |
| new_status | VARCHAR(50) | New status |
| reason | TEXT NULL | Reason |
| changed_by | UUID | User who changed status |
| changed_at | TIMESTAMP | Date changed |

---

## Business Rules

- Every status change must be recorded.
- Status history must not be deleted.
- Archived components remain available for historical reports.

---

# Relationships

programme_components

↓

school_programme_components

↓

term_programme_components

↓

class_programme_components

↓

programme_component_settings

programme_components

↓

curriculum

↓

assessment

↓

report

↓

analytics

---

# Summary

The Programme Component Tables provide the configurable structure for managing all learning areas delivered by Nobletech Academy.

They allow Programme Components to be enabled or disabled at school, session, term, and class level while supporting flexible report visibility, curriculum assignment, assessment, CBT, analytics, and historical reporting.

---

# End of Document