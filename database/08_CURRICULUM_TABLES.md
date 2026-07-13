## Phase 2G Finalization Notes

- Implemented migration: `20260713055000_operational_curriculum_lifecycle_foundation`.
- `curriculum_components` removed from active design for this milestone due redundant ownership with `school_programme_component_id` on curriculum.
- Projects are owned by `curriculum_units` and linked to one or more topics via `curriculum_topic_projects`.
- Learning outcomes are reusable at curriculum level and linked through typed joins:
    - `curriculum_topic_learning_outcomes`
    - `curriculum_project_learning_outcomes`
- Version snapshots are immutable JSONB payloads on `curriculum_versions`.
# Nobletech Education Management Platform (NEMP)

# 08_CURRICULUM_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Curriculum Tables |
| Document Code | NEMP-DB-CUR-008 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

This document defines the operational curriculum structure used by individual schools within the Nobletech Education Management Platform (NEMP).

Unlike the Master Content Library, which stores reusable educational content shared across the platform, these tables store each school's customized curriculum for specific academic sessions, terms, classes, and programme components.

The Curriculum Engine allows every school to customize curriculum delivery without changing the underlying application.

The system supports:

- Building curriculum from the Master Content Library.
- Creating custom curriculum from scratch.
- Mixing Master and Custom curriculum.
- Assigning curriculum to schools, sessions, terms, and classes.
- Enabling or disabling Programme Components per term.
- Supporting multiple Curriculum Units, Topics, Projects, Resources, and Learning Outcomes.
- Controlling curriculum visibility on reports and printed documents.
- Generating Compact or Detailed Curriculum PDFs.
- Providing curriculum data for Assessments, CBT, Student Portfolios, Analytics, and Student Reports.

---

# Curriculum Architecture

```text
School

↓

Academic Session

↓

Academic Term

↓

Class

↓

Programme Component

↓

Curriculum

↓

Curriculum Unit

↓

Topics (Multiple)

↓

Projects (Multiple)

↓

Project Implementations (Multiple)

↓

Resources (Multiple)

↓

Learning Outcomes (Multiple)

↓

Assessment

↓

Outputs

├── Student Report

└── Curriculum PDF
    ├── Compact Version
    └── Detailed Version
```

---

# Curriculum Tables

The Curriculum Engine consists of the following operational tables:

1. curricula
2. curriculum_components
3. curriculum_units
4. curriculum_topics
5. curriculum_projects
6. curriculum_project_implementations
7. curriculum_resources
8. curriculum_learning_outcomes
9. curriculum_visibility_settings
10. curriculum_versions
11. curriculum_pdf_templates

---

# Table: curricula

## Purpose

Represents a complete curriculum assigned to a school for a specific academic session, academic term, and class.

Examples include:

- Primary 1 Coding
- Primary 3 Robotics
- Primary 5 STEAM
- Secondary 1 Artificial Intelligence
- Summer Bootcamp
- Holiday Coding Camp

Each curriculum serves as the parent record for all Curriculum Units, Topics, Projects, Learning Outcomes, Resources, Assessments, and Curriculum PDFs associated with that academic period.

---

## Columns

| Column | Type |
|---------|------|
| curriculum_id | UUID |
| school_id | UUID |
| session_id | UUID |
| term_id | UUID |
| class_id | UUID |
| curriculum_name | VARCHAR(200) |
| description | TEXT |
| source_type | ENUM (Master, Custom, Mixed) |
| status | ENUM (GENERATED_DRAFT, DRAFT, UNDER_REVIEW, REVISION_REQUIRED, APPROVED, PUBLISHED, ARCHIVED) |
| version | VARCHAR(20) |
| created_by | UUID |
| approved_by | UUID |
| approved_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- One curriculum belongs to one school.
- One curriculum belongs to one academic session.
- One curriculum belongs to one academic term.
- One curriculum belongs to one class.
- Curriculum names should be unique within the same school, session, term, and class.
- Generated curricula must always begin as GENERATED_DRAFT.
- Generated content must never be automatically approved or published.
- Approval and publication must remain separate actions.
- Published curricula become immutable and must be versioned before further modifications.
- A curriculum may be created from the Master Content Library, entirely from custom content, or as a combination of both.

# Table: curriculum_components

## Purpose

Defines the Programme Components that are active within a curriculum.

Programme Components represent the major learning areas delivered by Nobletech Academy.

Examples include:

- Coding
- Robotics
- STEAM
- Artificial Intelligence (AI)
- Python
- Web Development
- Arduino
- Internet of Things (IoT)
- Cybersecurity
- Electronics
- Animation
- Fun Science
- Game Development

Each Programme Component can be independently enabled or disabled without affecting other components.

This allows different schools or classes to offer different combinations of Programme Components during the same academic term.

---

## Columns

| Column | Type |
|---------|------|
| curriculum_component_id | UUID |
| curriculum_id | UUID |
| programme_component_id | UUID |
| display_order | INTEGER |
| is_enabled | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A curriculum may contain multiple Programme Components.
- A Programme Component may appear in multiple curricula.
- Programme Components may be enabled or disabled independently.
- Disabled Programme Components shall not appear on reports, curriculum PDFs, assessments, or dashboards for that curriculum.
- Display order determines how components appear on reports and curriculum documents.

---

# Table: curriculum_units

## Purpose

Stores Curriculum Units under each Programme Component.

A Curriculum Unit represents a major learning area that groups together related Topics.

Examples include:

Coding

- Programming Fundamentals
- Problem Solving
- Algorithms

Robotics

- Electronics
- Sensors
- Automation

Artificial Intelligence

- Machine Learning
- Computer Vision
- Natural Language Processing

Web Development

- HTML
- CSS
- JavaScript

---

## Columns

| Column | Type |
|---------|------|
| curriculum_unit_id | UUID |
| curriculum_component_id | UUID |
| master_curriculum_unit_id | UUID NULL |
| curriculum_unit_name | VARCHAR(200) |
| description | TEXT |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- One Programme Component may contain multiple Curriculum Units.
- Curriculum Units may originate from the Master Content Library or be created specifically for a school.
- Display order determines the teaching sequence.
- Curriculum Units remain editable until the curriculum is published.

---

# Table: curriculum_topics

## Purpose

Stores Topics under each Curriculum Unit.

Topics define the specific lessons to be delivered.

A Curriculum Unit may contain an unlimited number of Topics.

Examples

Programming Fundamentals

↓

Variables

↓

Data Types

↓

Operators

↓

Input & Output

↓

Conditional Statements

↓

Loops

Another Example

Electronics

↓

LED

↓

Resistors

↓

Breadboard

↓

Switches

↓

Servo Motors

↓

Sensors

---

## Columns

| Column | Type |
|---------|------|
| curriculum_topic_id | UUID |
| curriculum_unit_id | UUID |
| master_topic_id | UUID NULL |
| topic_name | VARCHAR(200) |
| description | TEXT |
| estimated_duration | INTEGER |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Curriculum Unit may contain unlimited Topics.
- Topics may be imported from the Master Content Library.
- Schools may create additional custom Topics.
- Multiple Topics may be taught within a single lesson or teaching period.
- Display order determines the recommended teaching sequence.
- Topics form the foundation for Projects, Resources, Learning Outcomes, Assessments, Student Reports, and Curriculum PDFs.

---

## Topic and Concept Planning Guidance

Concepts are instructional ideas taught within Topics.

Example:

Topic: Traffic Light System

Concepts:

- Sequence
- Timing
- Input and output
- Electrical circuits
- Conditional behaviour
- Road safety

Future modelling recommendation:

- Maintain Topic as the delivery anchor.
- Represent Concept as a reusable instructional entity linked to one or more Topics.
- Allow concepts to be referenced in lesson notes, assessments, progress reporting, curriculum filtering, and future AI-assisted generation.
- Preserve the approved hierarchy without introducing a mandatory extra hierarchy layer in this phase.

---

# Table: curriculum_projects

## Purpose

Stores Projects under each Topic.

Projects provide students with practical, hands-on activities that reinforce the knowledge gained from the Topics taught.

A Topic may contain multiple Projects.

Examples

Variables

↓

Simple Calculator

↓

Number Guessing Game

↓

Student Score Calculator

Another Example

Electronics

↓

Traffic Light System

↓

Automatic Dustbin

↓

Smart Street Light

↓

Obstacle Avoidance Robot

---

## Columns

| Column | Type |
|---------|------|
| curriculum_project_id | UUID |
| curriculum_topic_id | UUID |
| master_project_id | UUID NULL |
| project_name | VARCHAR(200) |
| description | TEXT |
| project_type | VARCHAR(100) |
| difficulty_level | VARCHAR(50) |
| estimated_duration | INTEGER |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Topic may contain multiple Projects.
- Projects may originate from the Master Content Library.
- Schools may create custom Projects.
- Projects may be Practical, Theory, Mini Project, Capstone Project, Assignment, or Group Project.
- Projects support Student Portfolio generation.
- Projects may optionally appear on Student Reports.

---

# Table: curriculum_project_implementations

## Purpose

Defines the different methods, platforms, or technologies that may be used to implement a Project.

The same Project may be implemented using different technologies depending on the class level, available resources, or school preference.

Example

Traffic Light Project

↓

Scratch

↓

mBlock

↓

Arduino

↓

Tinkercad

↓

Wokwi

Another Example

Calculator

↓

Scratch

↓

Python

↓

MIT App Inventor

↓

JavaScript

---

## Columns

| Column | Type |
|---------|------|
| implementation_id | UUID |
| curriculum_project_id | UUID |
| master_implementation_id | UUID NULL |
| implementation_name | VARCHAR(200) |
| implementation_description | TEXT |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Project may have multiple implementations.
- Schools may enable only the implementation(s) they intend to teach.
- Implementations support flexible curriculum delivery without duplicating Projects.
- Hidden implementations remain available internally for future curriculum revisions.

---

# Table: curriculum_resources

## Purpose

Assigns learning resources to Topics and Projects.

Resources provide the software, websites, robotics kits, electronic components, documents, videos, and other instructional materials required to deliver the curriculum.

Resources are optional and may be displayed or hidden on printed curriculum documents and Student Reports.

---

## Supported Resource Types

Software

Examples

- Scratch
- mBlock
- PictoBlox
- Arduino IDE
- Visual Studio Code
- Python IDLE

Websites

Examples

- Code.org
- Tinkercad
- Wokwi
- MIT App Inventor
- MakeCode
- Scratch Website

Robotics Kits

Examples

- Arduino Uno
- Raspberry Pi
- Micro:bit
- LEGO Robotics
- ESP32

Electronic Components

Examples

- LED
- Servo Motor
- Ultrasonic Sensor
- Breadboard
- Resistor
- Buzzer
- Push Button

AI Tools

Examples

- ChatGPT
- Teachable Machine
- TensorFlow
- Edge Impulse

Learning Materials

Examples

- PDF Notes
- Videos
- Images
- Presentations
- Worksheets

---

## Columns

| Column | Type |
|---------|------|
| curriculum_resource_id | UUID |
| curriculum_topic_id | UUID NULL |
| curriculum_project_id | UUID NULL |
| master_resource_id | UUID |
| resource_title | VARCHAR(200) NULL |
| platform_name | VARCHAR(150) NULL |
| website_url | TEXT NULL |
| activity_url | TEXT NULL |
| resource_type | VARCHAR(100) NULL |
| launch_mode | ENUM (EMBEDDED, NEW_TAB, SAME_WINDOW, INTERNAL_RESOURCE) NULL |
| embedded_access_permitted | BOOLEAN NULL |
| login_required | BOOLEAN NULL |
| external_class_code | VARCHAR(100) NULL |
| student_instructions | TEXT NULL |
| teacher_instructions | TEXT NULL |
| class_or_grade_restriction | VARCHAR(100) NULL |
| estimated_duration_minutes | INTEGER NULL |
| safety_privacy_note | TEXT NULL |
| active_status | BOOLEAN NULL |
| verification_status | ENUM (PENDING_REVIEW, VERIFIED, BROKEN, ACCESS_RESTRICTED, EMBED_BLOCKED, DEACTIVATED) NULL |
| last_verified_at | TIMESTAMP NULL |
| last_verified_by | UUID NULL |
| next_review_due_at | TIMESTAMP NULL |
| approved_by | UUID NULL |
| reviewed_at | TIMESTAMP NULL |
| display_order | INTEGER |
| is_required | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Topic may reference multiple Resources.
- A Project may reference multiple Resources.
- Resources are reusable across multiple curricula.
- Resources may originate from the Master Content Library.
- Resources remain stored even when hidden from reports.
- Visibility of Resources is controlled by Curriculum Visibility Settings.
- Resources support curriculum delivery but do not affect assessment scores.
- Embedded launch must be attempted only where target platforms allow embedded access.
- NEMP must not bypass third-party platform iframe or security restrictions.
- When embedding is blocked, launch should fall back to secure NEW_TAB mode.
- External links should be validated and approved before learner publication.
- Only approved active resources may be visible on learner dashboards.
- Broken or outdated links must remain reviewable and deactivatable.
- Resource links should use HTTPS unless an authorized exception is approved and audited.
- Third-party credentials or join codes must never be stored in plain text.
- Approved resources must be reverified at least once per academic term.
- If embedding fails but the resource is still safe and approved, launch mode may fall back to NEW_TAB.

---

# Table: curriculum_learning_outcomes

## Purpose

Stores the expected knowledge, skills, and competencies that students should achieve after completing a Topic or Project.

Learning Outcomes are used for:

- Curriculum planning
- Assessment mapping
- Student reports
- Competency tracking
- Portfolio evaluation
- Analytics

Learning Outcomes may be attached to either a Topic or a Project.

---

## Columns

| Column | Type |
|---------|------|
| learning_outcome_id | UUID |
| curriculum_topic_id | UUID (Nullable) |
| curriculum_project_id | UUID (Nullable) |
| master_learning_outcome_id | UUID (Nullable) |
| outcome | TEXT |
| cognitive_level | VARCHAR(50) |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Topic may have multiple Learning Outcomes.
- A Project may have multiple Learning Outcomes.
- Learning Outcomes may be imported from the Master Content Library.
- Schools may create custom Learning Outcomes.
- Learning Outcomes may be displayed or hidden on Student Reports and Curriculum PDFs.

---

# Table: curriculum_visibility_settings

## Purpose

Controls what information is displayed on Student Reports and Curriculum PDFs.

This allows schools to customize printed output without changing the underlying curriculum.

---

## Columns

| Column | Type |
|---------|------|
| visibility_setting_id | UUID |
| curriculum_id | UUID |
| show_programme_components | BOOLEAN |
| show_curriculum_units | BOOLEAN |
| show_topics | BOOLEAN |
| show_projects | BOOLEAN |
| show_project_implementations | BOOLEAN |
| show_learning_outcomes | BOOLEAN |
| show_software | BOOLEAN |
| show_websites | BOOLEAN |
| show_robotics_kits | BOOLEAN |
| show_electronics | BOOLEAN |
| show_ai_tools | BOOLEAN |
| show_resources | BOOLEAN |
| show_assignments | BOOLEAN |
| show_homework | BOOLEAN |
| show_teacher_notes | BOOLEAN |
| show_estimated_duration | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Visibility settings affect presentation only.
- Hidden information remains stored in the database.
- Reports and Curriculum PDFs must respect these settings.
- Schools may choose not to expose software, websites, AI tools, robotics kits, or implementation methods.

---

# Table: curriculum_versions

## Purpose

Maintains curriculum revision history.

Every significant curriculum update creates a new version while preserving previous versions.

---

## Columns

| Column | Type |
|---------|------|
| version_id | UUID |
| curriculum_id | UUID |
| version_number | VARCHAR(20) |
| description | TEXT |
| is_current | BOOLEAN |
| created_by | UUID |
| created_at | TIMESTAMP |

---

## Business Rules

- Published curriculum versions become read-only.
- Only one version may be marked as the current version.
- Previous versions remain available for historical reference.
- Schools may restore previous versions when required.

---

# Table: curriculum_pdf_templates

## Purpose

Stores configuration settings for Curriculum PDF generation.

Supports multiple printable formats without modifying the curriculum.

---

## Supported Outputs

- Teacher Curriculum
- Student Curriculum
- Parent Curriculum
- Scheme of Work
- Weekly Plan
- Lesson Plan
- Summer Camp Curriculum
- Bootcamp Curriculum

---

## Columns

| Column | Type |
|---------|------|
| template_id | UUID |
| curriculum_id | UUID |
| template_name | VARCHAR(150) |
| paper_size | VARCHAR(20) |
| orientation | VARCHAR(20) |
| compact_mode | BOOLEAN |
| include_cover_page | BOOLEAN |
| include_page_numbers | BOOLEAN |
| include_logo | BOOLEAN |
| include_footer | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- One curriculum may have multiple PDF templates.
- Compact and Detailed PDF formats shall be supported.
- PDF settings affect document generation only.
- Templates may be customized per school.

---

# Business Rules

- One curriculum belongs to one school.
- One curriculum belongs to one academic session.
- One curriculum belongs to one academic term.
- One curriculum belongs to one class.
- A curriculum may contain multiple Programme Components.
- A Programme Component may contain multiple Curriculum Units.
- A Curriculum Unit may contain multiple Topics.
- A Topic may contain multiple Projects.
- A Project may contain multiple Implementations.
- A Topic or Project may reference multiple Resources.
- Learning Outcomes may belong to either Topics or Projects.
- Reports shall respect Curriculum Visibility Settings.
- Curriculum versions shall remain immutable after publication.
- A curriculum may be generated as either a Compact PDF or a Detailed PDF without modifying the underlying curriculum data.

---

# Curriculum Workflow

```text
Create Curriculum

↓

Select Programme Components

↓

Add Curriculum Units

↓

Add Topics

↓

Add Projects

↓

Assign Resources

↓

Define Learning Outcomes

↓

Configure Visibility

↓

Save as Generated Draft

↓

Administrative Editing

↓

Convert to Draft

↓

Submit for Review

↓

Revision or Approval

↓

Approve

↓

Publish

↓

Assign to Classes

↓

Generate Curriculum PDF

↓

Deliver Curriculum

↓

Teaching & Learning

↓

Assessment

↓

Generate Student Reports
```

---

# Curriculum Lifecycle Transition Table

| Current Status | Permitted Action | Required Permission | Resulting Status | Audit Requirement |
|----------------|------------------|---------------------|------------------|-------------------|
| GENERATED_DRAFT | Edit generated content | curriculum.edit | GENERATED_DRAFT | Log field-level changes |
| GENERATED_DRAFT | Convert to draft | curriculum.edit | DRAFT | Log conversion event |
| DRAFT | Edit structure/content | curriculum.edit | DRAFT | Log field-level changes |
| DRAFT | Reorder units/topics/projects | curriculum.reorder | DRAFT | Log ordering changes |
| DRAFT | Regenerate selected section | curriculum.regenerate_section | DRAFT | Log regeneration scope and source |
| DRAFT | Submit for review | curriculum.submit_review | UNDER_REVIEW | Log submit action |
| UNDER_REVIEW | Request revision | curriculum.request_revision | REVISION_REQUIRED | Log reason for revision |
| UNDER_REVIEW | Approve | curriculum.approve | APPROVED | Log approver and timestamp |
| REVISION_REQUIRED | Edit and resubmit | curriculum.edit + curriculum.submit_review | UNDER_REVIEW | Log corrective edits and resubmission |
| APPROVED | Publish | curriculum.publish | PUBLISHED | Log publication actor and timestamp |
| PUBLISHED | Archive | curriculum.archive | ARCHIVED | Log archival reason |
| PUBLISHED | Create correction draft version | curriculum.restore_version | DRAFT (new version) | Log source version and change summary |
| ARCHIVED | Restore authorized version | curriculum.restore_version | DRAFT or APPROVED (policy-based) | Log restore decision and actor |

---

# Curriculum Versioning Rules

The curriculum_versions table is the authoritative version history for each curriculum.

Each version record should retain:

- curriculum identifier
- version number
- source version
- creation method
- generation source
- created by
- edited by
- review status
- approved by and date
- published by and date
- change summary
- snapshot or version data
- current-version indicator
- publication state

Semantic versioning should be used where practical:

- 1.0 for the first approved release
- 1.1 for minor approved revisions
- 2.0 for major curriculum restructuring

Published versions must never be overwritten.

---

# Phase 2E Dependency Note

Phase 2E foundation implementation is now complete for subject, integration-domain, and programme-component enablement schema.

Delivered prerequisite tables include:

- `subjects`, `school_subjects`, `integration_domains`, `subject_integration_domains`
- `programme_components`, `programme_component_subjects`, `programme_component_integration_domains`
- `school_programme_components`, `term_programme_components`, `class_programme_components`
- `programme_component_settings`, `programme_component_status_history`

Scope boundary reminder:

- The curriculum operational tables defined in this document remain the authoritative later-phase implementation target.
- Phase 2E did not introduce or publish operational curriculum content records.

---

# Phase 2F Boundary Note

Phase 2F implemented only the reusable master-content and curriculum-source foundation needed before operational curriculum authoring.

Implemented in Phase 2F:

- Raw curriculum source registry and structured source-content extraction storage.
- Master content hierarchy tables for units, topics, concepts, skills, learning outcomes, activities, projects, project implementations, resources, assessment templates, and rubrics.
- Source-lineage links from curriculum sources to master content items.

Not implemented in Phase 2F:

- Operational school curriculum records in `curricula`, `curriculum_components`, `curriculum_units`, `curriculum_topics`, `curriculum_projects`, `curriculum_project_implementations`, `curriculum_resources`, and `curriculum_learning_outcomes`.
- Curriculum publication, assignment, learner delivery, and generated curriculum workflows.

Operational curriculum implementation remains deferred to Phase 2G.

---

# Summary

The Curriculum Tables form the operational layer of the NEMP Curriculum Engine.

They enable schools to build flexible, configurable curricula while leveraging the Master Content Library, supporting multiple Programme Components, Curriculum Units, Topics, Projects, Resources, Learning Outcomes, and curriculum versions.

The design allows curriculum information to be presented as either Compact or Detailed PDF documents, supports optional disclosure of instructional tools and resources, and provides the foundation for assessment, CBT, student portfolios, analytics, and report generation without requiring structural database changes.

---

# End of Document

## Phase 2H Update: Operational Usage

- Phase 2H backend services now orchestrate existing operational curriculum tables for authoring workflows.
- Curriculum versions and snapshots are consumed by API endpoints for controlled review and publication.
- Assignment lifecycle actions are exposed as explicit API operations and recorded in audit trails.