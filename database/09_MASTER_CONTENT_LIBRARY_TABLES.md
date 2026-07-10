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

Rather than requiring every school to recreate Programme Components, Concepts, Topics, Projects, Learning Outcomes, Resources, Assessment Templates, and Rubrics, the platform maintains a single authoritative library managed by Nobletech Academy.

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

Concepts

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
2. master_concepts
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

---

# Table: master_concepts

## Purpose

Stores reusable Concepts that belong to a Master Programme Component.

A Concept represents a major instructional area that groups together related Topics.

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
| master_concept_id | UUID |
| master_programme_component_id | UUID |
| concept_name | VARCHAR(200) |
| description | TEXT |
| display_order | INTEGER |
| difficulty_level | VARCHAR(50) |
| estimated_duration | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Programme Component may contain multiple Concepts.
- Concepts are reusable across multiple schools.
- Schools may copy Concepts into their own curriculum.
- Concepts remain editable only within the Master Library by Platform Administrators.

---

# Table: master_topics

## Purpose

Stores reusable Topics under each Master Concept.

Topics represent the individual lessons or instructional units delivered during teaching.

A Master Concept may contain an unlimited number of Topics.

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
| master_concept_id | UUID |
| topic_name | VARCHAR(200) |
| description | TEXT |
| objectives | TEXT |
| estimated_duration | INTEGER |
| difficulty_level | VARCHAR(50) |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Concept may contain multiple Topics.
- Topics may be reused across different curricula.
- Schools may copy Topics into their own curriculum.
- Topics remain editable only by Platform Administrators within the Master Library.
- Display Order determines the recommended teaching sequence.

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
| manufacturer | VARCHAR(150) |
| official_website | TEXT |
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

# Summary

The Master Content Library provides the reusable educational foundation of the Nobletech Education Management Platform.

It centralizes Programme Components, Concepts, Topics, Projects, Project Implementations, Learning Outcomes, Resources, Assessment Templates, and Rubrics into a single authoritative repository managed by Nobletech Academy.

This architecture minimizes duplication, promotes curriculum consistency, accelerates curriculum development, and enables each school to create independent operational curricula while preserving the integrity of the Master Library.

The design is scalable, extensible, and future-ready, allowing new technologies, educational resources, programme components, and assessment methods to be introduced without requiring structural changes to the database.

---

# End of Document