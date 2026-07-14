# Nobletech Education Management Platform (NEMP)

# 09_MASTER_CONTENT_LIBRARY_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Master Content Library Tables |
| Document Code | NEMP-DB-MCL-009 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

The Master Content Library serves as the centralized repository of reusable educational content across the Nobletech Education Management Platform (NEMP).

Rather than requiring every school to recreate Programme Components, Curriculum Units, Topics, Projects, Learning Outcomes, Resources, Assessment Templates, and Rubrics, the platform maintains a single authoritative library managed by Nobletech Academy.

Schools may:

- Use Master Content directly.
- Copy Master Content into their own curriculum.
- Modify copied content without affecting the Master Library.
- Build entirely custom curriculum where required.
- Combine Master Content with School-specific content.

This architecture minimizes duplication, improves consistency, accelerates curriculum development, and ensures that future curriculum enhancements become immediately available for adoption by participating schools.

---

# Objectives

The Master Content Library is designed to:

- Standardize curriculum development.
- Reduce duplication across schools.
- Support rapid curriculum creation.
- Promote curriculum consistency.
- Improve curriculum quality.
- Enable reusable educational content.
- Support future technologies without database redesign.
- Serve as the foundation for Curriculum, Assessment, CBT, Reports, Portfolios, Analytics, and AI-assisted curriculum planning.

---

# Master Library Architecture

```text
Master Library

↓

Programme Components

↓

Curriculum Units

↓

Topics

↓

Projects

↓

Project Implementations

↓

Learning Outcomes

↓

Resources

↓

Assessment Templates

↓

Rubrics
```

---

# Master Tables

The Master Content Library consists of the following tables:

1. master_programme_components
2. master_curriculum_units
3. master_topics
4. master_projects
5. master_project_implementations
6. master_learning_outcomes
7. master_resource_categories
8. master_resources
9. master_assessment_templates
10. master_rubrics

---

# Table: master_programme_components

## Purpose

Stores the reusable Programme Components supplied and maintained by Nobletech Academy.

Examples include:

- Coding
- Robotics
- STEAM
- Artificial Intelligence
- Python
- Web Development
- Arduino
- Internet of Things (IoT)
- Cybersecurity
- Electronics
- Animation
- Fun Science
- Game Development

Schools may copy these Programme Components into their own curriculum while preserving the integrity of the Master Library.

---

## Columns

| Column | Type |
|---------|------|
| master_programme_component_id | UUID |
| component_code | VARCHAR(50) |
| component_name | VARCHAR(150) |
| description | TEXT |
| icon | TEXT |
| source_subject_family | VARCHAR(120) NULL |
| source_domain | VARCHAR(120) NULL |
| display_order | INTEGER |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Programme Component names shall be unique.
- Component Codes shall be unique.
- Master Programme Components are managed only by Platform Administrators.
- Schools may copy Programme Components into their operational curriculum.
- Updates to the Master Library shall not automatically overwrite school-customized Programme Components.
- Master Library records are source assets and must not be directly published to learners or parents.

Source subject and integration domains supported include:

- Basic Science
- Basic Technology
- Digital Technology
- Mathematics
- Further Mathematics
- Statistics
- Geography
- English Language
- Creative Arts
- Music
- Construction
- Programming
- Website Development
- Agricultural Science
- Environmental Science
- Design and Technology
- Technical Drawing
- Electronics
- Electrical Technology
- Mechanical Technology
- Building Technology
- Computer Studies
- Information and Communication Technology
- Artificial Intelligence
- Data Science
- Cybersecurity
- Mobile App Development
- Game Development
- Animation
- Graphic Design
- 3D Modelling and Printing
- Business Studies
- Entrepreneurship
- Financial Literacy
- Social Studies
- Civic Education
- History
- Home Economics
- Health Education
- Renewable Energy
- Climate and Sustainability Education
- Space Science and Astronomy
- Communication and Presentation Skills
- Research and Information Literacy

These domains are source and integration references, not automatic compulsory standalone subjects.

---

# Table: master_curriculum_units

## Purpose

Stores reusable Curriculum Units that belong to a Master Programme Component.

A Curriculum Unit represents a major instructional area that groups together related Topics.

Examples

Coding

- Programming Fundamentals
- Algorithms
- Problem Solving

Robotics

- Electronics
- Sensors
- Automation

Artificial Intelligence

- Machine Learning
- Computer Vision
- Prompt Engineering

Web Development

- HTML
- CSS
- JavaScript

---

## Columns

| Column | Type |
|---------|------|
| master_curriculum_unit_id | UUID |
| master_programme_component_id | UUID |
| curriculum_unit_name | VARCHAR(200) |
| description | TEXT |
| source_subject_family | VARCHAR(120) NULL |
| source_domain | VARCHAR(120) NULL |
| lineage_tag | VARCHAR(150) NULL |
| display_order | INTEGER |
| difficulty_level | VARCHAR(50) |
| estimated_duration | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Programme Component may contain multiple Curriculum Units.
- Curriculum Units are reusable across multiple schools.
- Schools may copy Curriculum Units into their own curriculum.
- Curriculum Units remain editable only within the Master Library by Platform Administrators.
- Every copied Curriculum Unit should retain source lineage metadata for audit, rollback, and re-synchronization analysis.

---

# Table: master_topics

## Purpose

Stores reusable Topics under each Master Curriculum Unit.

Topics represent the individual lessons or instructional units delivered during teaching.

A Master Curriculum Unit may contain an unlimited number of Topics.

Examples

Programming Fundamentals

↓

Variables

↓

Data Types

↓

Operators

↓

Conditional Statements

↓

Loops

↓

Functions

Another Example

Electronics

↓

LED

↓

Breadboard

↓

Resistors

↓

Switches

↓

Servo Motor

↓

Sensors

---

## Columns

| Column | Type |
|---------|------|
| master_topic_id | UUID |
| master_curriculum_unit_id | UUID |
| topic_name | VARCHAR(200) |
| description | TEXT |
| source_subject_family | VARCHAR(120) NULL |
| source_domain | VARCHAR(120) NULL |
| lineage_tag | VARCHAR(150) NULL |
| objectives | TEXT |
| estimated_duration | INTEGER |
| difficulty_level | VARCHAR(50) |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Curriculum Unit may contain multiple Topics.
- Topics may be reused across different curricula.
- Schools may copy Topics into their own curriculum.
- Topics remain editable only by Platform Administrators within the Master Library.
- Display Order determines the recommended teaching sequence.
- Any derivative topic should preserve master source identifiers in downstream operational records.

---

# Table: master_projects

## Purpose

Stores reusable Projects linked to Topics.

Projects provide practical learning experiences that reinforce classroom instruction.

A Topic may contain multiple Projects.

Examples

Variables

↓

Simple Calculator

↓

Student Score Calculator

↓

Guess the Number Game

Another Example

Electronics

↓

Traffic Light System

↓

Automatic Dustbin

↓

Obstacle Avoidance Robot

↓

Smart Street Light

↓

Digital Door Lock

---

## Columns

| Column | Type |
|---------|------|
| master_project_id | UUID |
| master_topic_id | UUID |
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
- Projects are reusable.
- Projects support Portfolio generation.
- Projects may be Practical, Mini Project, Assignment, Capstone Project, Group Project or Challenge.
- Schools may customize copied Projects without affecting the Master Library.

---

# Table: master_project_implementations

## Purpose

Defines the different methods, technologies, or platforms that may be used to implement the same Project.

A single Project can have multiple implementations.

This eliminates duplication while supporting different teaching approaches.

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

↓

Micro:bit

---

## Columns

| Column | Type |
|---------|------|
| master_implementation_id | UUID |
| master_project_id | UUID |
| implementation_name | VARCHAR(200) |
| implementation_description | TEXT |
| master_resource_id | UUID NULL |
| estimated_duration | INTEGER |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Project may have multiple implementations.
- Implementations may reference any Resource from the Master Resource Library.
- The same implementation may be reused by multiple schools.
- Schools may choose the implementation(s) appropriate for their curriculum.
- Implementation details remain editable only by Platform Administrators.

---

# Table: master_learning_outcomes

## Purpose

Stores reusable Learning Outcomes for Topics and Projects.

Learning Outcomes define the knowledge, skills, competencies, and practical abilities that learners are expected to achieve after completing a Topic or Project.

Learning Outcomes support:

- Curriculum Planning
- Student Assessment
- CBT
- Student Reports
- Portfolio Evaluation
- Competency Tracking
- Analytics

---

## Columns

| Column | Type |
|---------|------|
| master_learning_outcome_id | UUID |
| master_topic_id | UUID (Nullable) |
| master_project_id | UUID (Nullable) |
| learning_outcome | TEXT |
| cognitive_level | VARCHAR(50) |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Learning Outcomes may belong to either a Topic or a Project.
- A Topic may have multiple Learning Outcomes.
- A Project may have multiple Learning Outcomes.
- Learning Outcomes are reusable across multiple curricula.
- Schools may copy and customize Learning Outcomes independently.

---

# Table: master_resource_categories

## Purpose

Defines categories for educational resources stored in the Master Resource Library.

Examples

Software

Website

Robotics Kit

Electronics Component

AI Tool

Book

Video

PDF

Image

Presentation

Worksheet

External Link

---

## Columns

| Column | Type |
|---------|------|
| master_resource_category_id | UUID |
| category_name | VARCHAR(100) |
| description | TEXT |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Categories are reusable.
- Categories are managed only by Platform Administrators.
- Categories help organize and filter resources throughout the platform.

---

# Table: master_resources

## Purpose

Stores reusable educational resources used throughout the platform.

Resources may include software, websites, robotics kits, electronics components, AI tools, videos, books, documents, and other instructional materials.

---

## Examples

### Software

- Scratch
- mBlock
- PictoBlox
- Arduino IDE
- Visual Studio Code
- Python IDLE

### Websites

- Code.org
- Scratch
- MIT App Inventor
- Tinkercad
- Wokwi
- MakeCode

### Robotics Kits

- Arduino Uno
- ESP32
- BBC micro:bit
- Raspberry Pi
- LEGO Robotics

### Electronics

- LED
- Breadboard
- Servo Motor
- Ultrasonic Sensor
- Buzzer
- Push Button
- Resistor

### AI Tools

- ChatGPT
- Gemini
- Claude
- Microsoft Copilot
- Teachable Machine
- TensorFlow

---

## Columns

| Column | Type |
|---------|------|
| master_resource_id | UUID |
| master_resource_category_id | UUID |
| resource_name | VARCHAR(200) |
| resource_type | VARCHAR(100) |
| version | VARCHAR(50) |
| platform_name | VARCHAR(150) NULL |
| manufacturer | VARCHAR(150) |
| official_website | TEXT |
| activity_url | TEXT NULL |
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
| description | TEXT |
| icon | TEXT |
| is_free | BOOLEAN |
| is_open_source | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Resources are reusable across all schools.
- Resources may be linked to multiple Topics and Projects.
- Resources are maintained only by Platform Administrators.
- Schools may reference resources without modifying the Master Library.
- Master resource launch mode should define learner access behavior for downstream operational curricula.
- EMBEDDED launch is allowed only where external platform policy permits embedding.
- Resource entries should be reviewed periodically and deactivated when outdated, broken, or unsafe.
- Approved external resources must be verified at least once per academic term.
- If embedding fails but the resource remains approved and safe, launch mode may fall back to NEW_TAB.

---

# Table: master_assessment_templates

## Purpose

Stores reusable assessment templates that can be used across curriculum, CBT, and report generation.

---

## Examples

- Coding Assessment
- Robotics Assessment
- AI Assessment
- Python Assessment
- Practical Assessment
- Project Assessment
- Presentation Assessment

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_template_id | UUID |
| master_programme_component_id | UUID |
| template_name | VARCHAR(200) |
| assessment_type | VARCHAR(100) |
| description | TEXT |
| total_score | DECIMAL(5,2) |
| default_duration | INTEGER |
| rubric_required | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Assessment Templates are reusable.
- Schools may copy and customize templates.
- Changes to Master Templates do not affect school copies.
- Assessment templates may be linked to one or more reusable rubrics through explicit mapping records.

---

# Table: master_rubrics

## Purpose

Stores reusable grading rubrics used by Assessment Templates.

---

## Examples

Excellent

Very Good

Good

Fair

Needs Improvement

---

## Columns

| Column | Type |
|---------|------|
| master_rubric_id | UUID |
| master_assessment_template_id | UUID |
| criteria | TEXT |
| maximum_score | DECIMAL(5,2) |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Master Assessment Template may have multiple Rubrics.
- Rubrics are reusable.
- Schools may customize copied Rubrics independently.

---

# Table: master_assessment_template_rubrics

## Purpose

Stores explicit reusable mappings between master assessment templates and master rubrics.

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_template_rubric_id | UUID |
| master_assessment_template_id | UUID |
| master_rubric_id | UUID |
| sequence_order | INTEGER NULL |
| is_primary | BOOLEAN |
| purpose | VARCHAR(150) NULL |
| is_active | BOOLEAN |
| created_by_id | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A template-rubric pair is unique within the mapping table.
- Mappings are reusable and support ordering and primary designation metadata.
- Mapping changes are restricted to editable lifecycle states through service-layer controls.

---

# Business Rules

- Master Library records are managed only by Platform Administrators.
- School Administrators cannot modify Master Library records.
- Schools may copy Master Library content into their own curriculum.
- Copied content becomes independent of the Master Library.
- Updates to the Master Library shall not overwrite school-customized content.
- Projects may contain multiple implementations.
- Topics and Projects may reference multiple Resources.
- Learning Outcomes may belong to Topics or Projects.
- Every Master Library item shall support future versioning.
- Master Library content serves as the single source of reusable educational content across the platform.

---

# Phase 2E Alignment Note

Phase 2E delivered the prerequisite subject, integration-domain, and programme-component foundation schema required before master content and curriculum source implementation.

Foundation delivered in this phase:

- Canonical subject and integration-domain registries with school link capability.
- Programme-component canonical registry with subject and integration-domain mapping tables.
- School, term, and class programme-component enablement layers with tenant-safe constraints.

Boundary retained for this document:

- Master content library tables in this document remain deferred to the next milestone and were not created in the Phase 2E migration.

---

# Phase 2F Implementation Alignment Note

Phase 2F migration `20260713001000_master_content_source_foundation` now implements the approved Master Content Library and Curriculum Source foundation.

Implemented master tables include:

- `master_curriculum_units`
- `master_topics`
- `master_concepts`
- `master_skills`
- `master_learning_outcomes`
- `master_activities`
- `master_projects`
- `master_project_implementations`
- `master_resources`
- `master_assessment_templates`
- `master_rubrics`
- `master_rubric_criteria`
- `master_rubric_levels`

Implemented supporting lineage and classification tables include:

- `curriculum_sources`
- `curriculum_source_contents`
- `curriculum_source_master_content_links`
- `master_curriculum_unit_subjects`
- `master_curriculum_unit_integration_domains`
- `master_curriculum_unit_programme_components`
- `master_topic_subjects`
- `master_topic_integration_domains`
- `master_topic_concepts`
- `master_topic_skills`
- `master_topic_learning_outcomes`
- `master_topic_activities`
- `master_topic_projects`
- `master_activity_resources`
- `master_project_resources`
- `master_project_skills`
- `master_project_learning_outcomes`
- `master_assessment_template_learning_outcomes`
- `master_assessment_template_rubrics`

Phase 2F governance controls implemented:

- Draft or review or approval or archive lifecycle support via dedicated master and review status enums.
- Case-insensitive active code uniqueness for source and selected master entities.
- Single-target source-lineage integrity per lineage row.
- Approval-safe archive checks and conservative restrict or set-null deletion strategy.

Boundary retained:

- Master content remains reusable source intellectual property and is not automatically visible to learners.
- Operational curriculum derivation and publication workflows remain deferred to subsequent milestones.

---

# Phase 2K.2 Implementation Alignment Note

Phase 2K.2 completed manual master-content administration APIs and frontend interfaces using the Phase 2F table foundation and added focused closure support for the explicit assessment-template to rubric mapping table:

- `master_assessment_template_rubrics`

Phase 2K.2 boundary retained:

- AI extraction, OCR parsing, source-file upload ingestion, and AI-assisted generation workflows remain deferred.

---

# Summary

The Master Content Library provides the reusable educational foundation of the Nobletech Education Management Platform.

It centralizes Programme Components, Curriculum Units, Topics, Projects, Project Implementations, Learning Outcomes, Resources, Assessment Templates, and Rubrics into a single authoritative repository managed by Nobletech Academy.

This architecture minimizes duplication, promotes curriculum consistency, accelerates curriculum development, and enables each school to create independent operational curricula while preserving the integrity of the Master Library.

The design is scalable, extensible, and future-ready, allowing new technologies, educational resources, programme components, and assessment methods to be introduced without requiring structural changes to the database.

---

# End of Document