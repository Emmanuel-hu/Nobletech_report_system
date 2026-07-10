# Nobletech Education Management Platform (NEMP)

# 11_MASTER_REPORT_LIBRARY_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Master Report Library Tables |
| Document Code | NEMP-DB-MRL-011 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

The Master Report Library serves as the centralized repository for reusable report templates used throughout the Nobletech Education Management Platform (NEMP).

Rather than hardcoding report cards, NEMP provides a flexible report engine that enables schools to use, duplicate, customize, version, and publish report templates while preserving Nobletech Academy's master templates.

This architecture separates report design from report data, allowing report layouts to evolve without modifying application code.

The Master Report Library supports:

- Nursery Reports
- Primary Reports
- Secondary Reports
- Coding & Robotics Reports
- STEAM Reports
- Artificial Intelligence Reports
- Summer Camp Reports
- Bootcamp Reports
- Future Programme Reports

Each school may customize copied templates independently while the Master Library remains protected.

---

# Objectives

The Master Report Library is designed to:

- Standardize report design.
- Eliminate duplicated report templates.
- Support multiple educational programmes.
- Support multiple report layouts.
- Support Compact and Detailed Reports.
- Support Single-page and Multi-page reports.
- Support configurable branding.
- Support QR Code verification.
- Support PDF generation.
- Support multilingual reports in future releases.
- Provide the presentation layer for the Report Engine.

---

# Report Architecture

```text
Master Report Library

↓

Report Templates

↓

Report Sections

↓

Report Fields

↓

Display Rules

↓

Branding

↓

Header & Footer

↓

Signature Layout

↓

QR & Barcode

↓

PDF Layout

↓

School Report Templates

↓

Generated Reports
```

---

# Master Report Tables

The Master Report Library consists of the following tables:

1. master_report_templates
2. master_report_sections
3. master_report_fields
4. master_report_display_rules
5. master_pdf_layouts
6. master_branding_profiles
7. master_signature_layouts
8. master_qr_barcode_settings
9. master_report_comments
10. master_report_versions

---

# Table: master_report_templates

## Purpose

Stores reusable report templates supplied by Nobletech Academy.

These templates provide the foundation for report generation across different educational programmes.

Examples

- Nursery Report
- Primary Report
- Secondary Report
- Coding & Robotics Report
- STEAM Report
- Artificial Intelligence Report
- Summer Camp Report
- Bootcamp Report

Schools may duplicate these templates into their own environment and customize them independently.

---

## Columns

| Column | Type |
|---------|------|
| master_report_template_id | UUID |
| template_name | VARCHAR(200) |
| education_level | VARCHAR(100) |
| description | TEXT |
| orientation | VARCHAR(20) |
| paper_size | VARCHAR(20) |
| report_type | VARCHAR(100) |
| default_language | VARCHAR(50) |
| is_default | BOOLEAN |
| version | VARCHAR(20) |
| status | VARCHAR(50) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Report Templates are managed only by Platform Administrators.
- Schools may duplicate Report Templates.
- Copied templates become independent of the Master Library.
- Updates to the Master Library shall not overwrite school-customized templates.
- Every Report Template supports version control.
- Templates may support multiple educational programmes.

---

# Table: master_report_sections

## Purpose

Defines reusable sections contained within a Report Template.

Sections organize report information into logical groups.

Examples

- Student Information
- Academic Performance
- Attendance
- Coding & Robotics Performance
- STEAM Performance
- Curriculum Covered
- Projects Completed
- Skills Evaluation
- Teacher Comments
- Supervisor Comments
- Principal Remarks
- Signatures

---

## Columns

| Column | Type |
|---------|------|
| master_report_section_id | UUID |
| master_report_template_id | UUID |
| section_name | VARCHAR(150) |
| description | TEXT |
| display_order | INTEGER |
| is_required | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Report Template may contain multiple Sections.
- Sections may be reordered.
- Schools may hide optional sections.
- Required sections cannot be removed from the Master Library.
- Display Order determines how sections appear on generated reports.

---

# Table: master_report_fields

## Purpose

Defines the individual data fields displayed within each Report Section.

Fields determine what information is presented on the report and where it appears.

Examples

Student Information

↓

Student Name

Admission Number

Class

Class Arm

Gender

Academic Information

↓

Programme Component

Assessment Score

Grade

Average

Attendance

Teacher Comment

Promotion Status

Coding & Robotics

↓

Projects Completed

Skills Acquired

Learning Outcomes

Portfolio Score

---

## Columns

| Column | Type |
|---------|------|
| master_report_field_id | UUID |
| master_report_section_id | UUID |
| field_name | VARCHAR(150) |
| field_key | VARCHAR(150) |
| field_type | VARCHAR(100) |
| data_source | VARCHAR(150) |
| display_order | INTEGER |
| is_required | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Report Section may contain multiple Fields.
- Field Keys shall be unique within a Report Template.
- Display Order determines field placement.
- Data Source identifies the originating module.
- Required Fields cannot be removed from the Master Library.

---

# Table: master_report_display_rules

## Purpose

Controls which information appears on generated reports.

Display Rules affect presentation only and do not modify the underlying assessment or curriculum data.

Schools may configure visibility according to their reporting requirements.

---

## Examples

Show Attendance

YES

Show Position

NO

Show Programme Components

YES

Show Coding

YES

Show Robotics

YES

Show Artificial Intelligence

NO

Show Curriculum

YES

Show Topics

YES

Show Projects

YES

Show Learning Outcomes

YES

Show Software

NO

Show Websites

NO

Show Robotics Kits

NO

Show Electronics

NO

Show AI Tools

NO

Show Resources

NO

---

## Columns

| Column | Type |
|---------|------|
| master_report_display_rule_id | UUID |
| master_report_template_id | UUID |
| show_attendance | BOOLEAN |
| show_position | BOOLEAN |
| show_average | BOOLEAN |
| show_grade | BOOLEAN |
| show_percentage | BOOLEAN |
| show_programme_components | BOOLEAN |
| show_curriculum | BOOLEAN |
| show_concepts | BOOLEAN |
| show_topics | BOOLEAN |
| show_projects | BOOLEAN |
| show_learning_outcomes | BOOLEAN |
| show_software | BOOLEAN |
| show_websites | BOOLEAN |
| show_robotics_kits | BOOLEAN |
| show_electronics | BOOLEAN |
| show_ai_tools | BOOLEAN |
| show_resources | BOOLEAN |
| show_teacher_comments | BOOLEAN |
| show_supervisor_comments | BOOLEAN |
| show_principal_comments | BOOLEAN |
| show_qr_code | BOOLEAN |
| show_barcode | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Display Rules affect presentation only.
- Hidden information remains stored in the database.
- Schools may customize copied Display Rules.
- Reports must always respect the configured visibility settings.

---

# Table: master_pdf_layouts

## Purpose

Stores reusable PDF layout configurations.

Layouts determine how reports are rendered when exported to PDF.

Supports:

- Portrait
- Landscape
- Compact Reports
- Detailed Reports
- Single Page Reports
- Multi-page Reports

---

## Columns

| Column | Type |
|---------|------|
| master_pdf_layout_id | UUID |
| master_report_template_id | UUID |
| paper_size | VARCHAR(20) |
| orientation | VARCHAR(20) |
| margin_top | DECIMAL(5,2) |
| margin_bottom | DECIMAL(5,2) |
| margin_left | DECIMAL(5,2) |
| margin_right | DECIMAL(5,2) |
| font_family | VARCHAR(100) |
| font_size | INTEGER |
| compact_mode | BOOLEAN |
| single_page_mode | BOOLEAN |
| include_cover_page | BOOLEAN |
| compression_enabled | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Layouts are reusable.
- Schools may customize copied layouts.
- Layout changes affect PDF generation only.
- Compact Mode minimizes page usage while maintaining readability.

---

# Table: master_branding_profiles

## Purpose

Stores reusable branding configurations used during report generation.

Branding provides a consistent visual identity while allowing schools to customize copied templates.

---

## Branding Elements

- School Logo
- School Motto
- Primary Colour
- Secondary Colour
- Accent Colour
- Header Style
- Footer Style
- Watermark

---

## Columns

| Column | Type |
|---------|------|
| master_branding_profile_id | UUID |
| master_report_template_id | UUID |
| default_logo | TEXT |
| watermark | TEXT |
| primary_colour | VARCHAR(20) |
| secondary_colour | VARCHAR(20) |
| accent_colour | VARCHAR(20) |
| header_style | VARCHAR(100) |
| footer_style | VARCHAR(100) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Branding Profiles are reusable.
- Schools may customize copied Branding Profiles.
- Branding changes affect presentation only.

---

# Table: master_signature_layouts

## Purpose

Defines the signature blocks displayed on reports.

Supports multiple signature arrangements depending on school requirements.

Examples

- Teacher
- Subject Teacher
- Coding Instructor
- Robotics Instructor
- STEAM Instructor
- Supervisor
- Principal
- Director
- Parent / Guardian

---

## Columns

| Column | Type |
|---------|------|
| master_signature_layout_id | UUID |
| master_report_template_id | UUID |
| signature_title | VARCHAR(100) |
| display_order | INTEGER |
| is_required | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Report Template may contain multiple Signature Blocks.
- Signature order is configurable.
- Schools may hide optional signatures.
- Required signatures remain protected within the Master Library.

---

# Table: master_qr_barcode_settings

## Purpose

Defines QR Code and Barcode behaviour for report verification and authentication.

These settings enable digital validation of reports and help prevent report forgery.

Supported Features

- Student Verification
- Report Verification
- Online Result Verification
- Digital Authentication
- Secure Report Identification

---

## Columns

| Column | Type |
|---------|------|
| master_qr_barcode_setting_id | UUID |
| master_report_template_id | UUID |
| enable_qr | BOOLEAN |
| enable_barcode | BOOLEAN |
| verification_url | TEXT |
| verification_hash_algorithm | VARCHAR(100) |
| digital_signature_enabled | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- QR Codes are optional.
- Barcodes are optional.
- Verification URLs must be configurable.
- QR Codes and Barcodes shall support future online verification services.
- Digital verification settings affect generated reports only.

---

# Table: master_report_comments

## Purpose

Stores reusable report comments that may be automatically selected during report generation.

Comments may be based on score range, competency level, teacher selection, or administrator selection.

Examples

- Outstanding Performance.
- Excellent Progress.
- Keep Improving.
- Demonstrates Creativity.
- Excellent Coding Skills.
- Strong Robotics Skills.
- Excellent Problem Solving Skills.
- Requires Additional Practice.

---

## Columns

| Column | Type |
|---------|------|
| master_report_comment_id | UUID |
| category | VARCHAR(100) |
| minimum_score | DECIMAL(6,2) |
| maximum_score | DECIMAL(6,2) |
| gender_specific | BOOLEAN |
| comment_text | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Comments are reusable.
- Comments may be selected automatically using score ranges.
- Gender-specific comments shall be supported.
- Schools may customize copied comments independently.

---

# Table: master_report_versions

## Purpose

Maintains version history for Report Templates.

Versioning preserves previous report designs while allowing schools to continue improving copied templates.

Supported Status

- Draft
- Review
- Approved
- Published
- Archived

---

## Columns

| Column | Type |
|---------|------|
| master_report_version_id | UUID |
| master_report_template_id | UUID |
| version_number | VARCHAR(20) |
| description | TEXT |
| publication_status | VARCHAR(50) |
| created_by | UUID |
| created_at | TIMESTAMP |

---

## Business Rules

- Every Report Template supports version control.
- Published versions become read-only.
- Previous versions remain available for historical report generation.
- Schools may restore previous versions when required.

---

# Business Rules

- Master Report Templates are managed only by Platform Administrators.
- School Administrators cannot modify the Master Report Library directly.
- Schools may duplicate Master Report Templates into their own report libraries.
- Copied templates become independent of the Master Library.
- Updates to the Master Library shall not overwrite school-customized templates.
- Report Templates support version control.
- Display Rules affect presentation only.
- Hidden information remains stored within the database.
- PDF Layouts are fully configurable without modifying application code.
- Compact and Detailed Report formats shall both be supported.
- Single-page and Multi-page Reports shall both be supported.
- QR Codes and Barcodes are optional.
- Digital verification shall be supported.
- Report Sections may be reordered.
- Schools may customize copied Branding Profiles, Signature Layouts, PDF Layouts, Display Rules, and Comments independently.

---

# Relationship Overview

```text
Master Report Templates

↓

Report Sections

↓

Report Fields

↓

Display Rules

↓

Branding Profiles

↓

PDF Layouts

↓

Signature Layouts

↓

QR & Barcode Settings

↓

Report Comments

↓

Report Versions

↓

School Report Templates

↓

Generated Reports

↓

PDF Engine
```

---

# Summary

The Master Report Library provides the reusable presentation layer of the Nobletech Education Management Platform.

It centralizes Report Templates, Report Sections, Report Fields, Display Rules, Branding Profiles, PDF Layouts, Signature Layouts, QR and Barcode Settings, Report Comments, and Report Versioning into a single authoritative repository managed by Nobletech Academy.

This architecture separates report presentation from operational data, enabling schools to create highly customizable report cards while preserving standardized master templates.

The design supports Nursery, Primary, Secondary, Coding, Robotics, STEAM, Artificial Intelligence, Summer Camp, Bootcamp, and future educational programmes without requiring structural database changes.

It also provides configurable PDF generation, compact and detailed layouts, digital verification, multilingual readiness, and long-term scalability for future platform enhancements.

---

# End of Document