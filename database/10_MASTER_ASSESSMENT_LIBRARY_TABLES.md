# Nobletech Education Management Platform (NEMP)

# 10_MASTER_ASSESSMENT_LIBRARY_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Master Assessment Library Tables |
| Document Code | NEMP-DB-MAL-010 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

The Master Assessment Library serves as the centralized repository for reusable assessment structures used throughout the Nobletech Education Management Platform (NEMP).

Instead of every school creating assessment templates from scratch each academic term, NEMP provides a standardized assessment framework that schools can adopt, customize, and extend independently.

Schools may:

- Use Nobletech Academy's standard assessment templates.
- Copy assessment templates into their own environment.
- Customize copied templates without affecting the Master Library.
- Create completely new assessment templates where required.
- Combine Master Templates with school-specific assessment structures.

This architecture promotes consistency, minimizes duplication, improves assessment quality, and supports future expansion without database redesign.

---

# Objectives

The Master Assessment Library is designed to:

- Standardize assessment practices.
- Support practical and theory-based assessments.
- Enable competency-based evaluation.
- Support Coding, Robotics, STEAM, AI, Python, Web Development, Arduino, IoT, Cybersecurity, Animation and future programmes.
- Provide reusable grading structures.
- Supply templates for CBT and Manual Assessments.
- Improve report consistency.
- Provide the foundation for Analytics, Student Portfolios, and AI-assisted assessment.

---

# Assessment Architecture

```text
Master Assessment Library

↓

Assessment Types

↓

Assessment Templates

↓

Assessment Sections

↓

Assessment Criteria

↓

Rubrics

↓

Competency Levels

↓

Scoring Rules

↓

Assessment Workflow

↓

Visibility Rules

↓

Assessment Comments

↓

Operational Assessment Engine
```

---

# Master Assessment Tables

The Master Assessment Library consists of the following tables:

1. master_assessment_types
2. master_assessment_templates
3. master_assessment_sections
4. master_assessment_criteria
5. master_rubrics
6. master_competency_levels
7. master_scoring_rules
8. master_assessment_workflows
9. master_assessment_visibility
10. master_assessment_comments

---

# Table: master_assessment_types

## Purpose

Defines all supported assessment methods available across the platform.

Assessment Types determine how an assessment is delivered and processed.

Examples include:

- Assignment
- Classwork
- Homework
- Quiz
- Mid-Term Test
- Practical
- Coding Challenge
- Robotics Practical
- AI Prompt Exercise
- Python Programming Task
- Arduino Practical
- Web Development Project
- Portfolio Assessment
- Observation
- Viva
- Presentation
- Hackathon
- Competition
- CBT Examination
- Final Examination

New assessment types may be introduced without modifying the application.

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_type_id | UUID |
| assessment_type_name | VARCHAR(150) |
| description | TEXT |
| practical_based | BOOLEAN |
| score_based | BOOLEAN |
| competency_based | BOOLEAN |
| is_cbt_supported | BOOLEAN |
| is_project_supported | BOOLEAN |
| is_reportable | BOOLEAN |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Assessment Types are reusable.
- Assessment Types are managed only by Platform Administrators.
- Schools may reference Assessment Types without modifying the Master Library.
- New Assessment Types may be added without requiring software updates.

---

# Table: master_assessment_templates

## Purpose

Stores reusable assessment templates maintained by Nobletech Academy.

Templates define the complete structure of an assessment and may be reused across multiple schools and curricula.

Examples include:

- Coding Practical
- Robotics Practical
- AI Project
- Python Assignment
- Arduino Project
- Web Development Project
- STEAM Practical
- Summer Camp Assessment
- Bootcamp Assessment
- Nursery Skills Assessment

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_template_id | UUID |
| master_programme_component_id | UUID |
| master_assessment_type_id | UUID |
| template_name | VARCHAR(200) |
| description | TEXT |
| assessment_category | VARCHAR(100) |
| total_score | DECIMAL(6,2) |
| passing_score | DECIMAL(6,2) |
| version | VARCHAR(20) |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Templates are reusable.
- Templates may be copied into school-specific assessment libraries.
- Schools may customize copied templates independently.
- Updates to the Master Library shall not overwrite school-customized templates.
- Templates support version control.

# Table: master_assessment_sections

## Purpose

Defines the major sections within an Assessment Template.

Assessment Sections divide an assessment into logical parts, making assessment design more organized, flexible, and reusable.

Examples

Coding Practical

↓

Planning

↓

Programming

↓

Testing

↓

Debugging

↓

Documentation

↓

Presentation

Another Example

Robotics Practical

↓

Circuit Design

↓

Component Wiring

↓

Programming

↓

Testing

↓

Troubleshooting

↓

Presentation

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_section_id | UUID |
| master_assessment_template_id | UUID |
| section_name | VARCHAR(150) |
| description | TEXT |
| display_order | INTEGER |
| maximum_score | DECIMAL(6,2) |
| estimated_duration | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- An Assessment Template may contain multiple Sections.
- Display Order determines the sequence of assessment.
- Estimated Duration assists with CBT scheduling and practical session planning.
- Sections may be copied into school-specific assessment templates.

---

# Table: master_assessment_criteria

## Purpose

Defines the assessment criteria used to evaluate learner performance within an Assessment Section.

Criteria provide measurable indicators for evaluating knowledge, practical skills, creativity, and competency.

Examples

- Problem Solving
- Logical Thinking
- Creativity
- Programming Logic
- Debugging Skills
- Algorithm Design
- User Interface Design
- Innovation
- Documentation
- Teamwork
- Communication
- Presentation Skills
- Safety Procedures

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_criteria_id | UUID |
| master_assessment_section_id | UUID |
| criteria_name | VARCHAR(200) |
| description | TEXT |
| maximum_score | DECIMAL(6,2) |
| weight_percentage | DECIMAL(5,2) |
| competency_required | BOOLEAN |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Section may contain multiple Assessment Criteria.
- Weight Percentage contributes to overall score calculation.
- Competency Required determines whether competency evaluation should be applied.
- Schools may customize copied criteria independently.

---

# Table: master_rubrics

## Purpose

Stores reusable grading rubrics for Assessment Criteria.

Rubrics provide standardized descriptions for different levels of learner performance.

Examples

Excellent

Very Good

Good

Fair

Needs Improvement

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_rubric_id | UUID |
| master_assessment_criteria_id | UUID |
| performance_level | VARCHAR(100) |
| score_from | DECIMAL(6,2) |
| score_to | DECIMAL(6,2) |
| description | TEXT |
| colour | VARCHAR(20) |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Each Assessment Criterion may contain multiple Rubric Levels.
- Score ranges must not overlap.
- Rubrics support both manual assessment and CBT.
- Schools may customize copied rubrics independently.

---

# Table: master_competency_levels

## Purpose

Defines reusable competency levels used throughout the platform.

Competency Levels provide an alternative evaluation method beyond numerical scores.

Examples

- Beginning
- Emerging
- Developing
- Proficient
- Advanced
- Expert

These levels are particularly useful for:

- Nursery Assessment
- Primary Assessment
- Coding
- Robotics
- STEAM
- Practical Projects
- Portfolio Evaluation

---

## Columns

| Column | Type |
|---------|------|
| master_competency_level_id | UUID |
| level_name | VARCHAR(100) |
| description | TEXT |
| minimum_score | DECIMAL(6,2) |
| maximum_score | DECIMAL(6,2) |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Competency Levels are reusable.
- Score ranges must not overlap.
- Competency Levels support automatic score-to-competency conversion.
- Schools may customize copied competency levels independently.

---

# Table: master_scoring_rules

## Purpose

Defines the methods used to calculate assessment scores.

Scoring Rules ensure that assessment results are calculated consistently across all schools while allowing different assessment strategies to be used.

Examples

- Total Score
- Percentage
- Average
- Weighted Average
- Best Score
- Competency Based
- Pass / Fail

---

## Columns

| Column | Type |
|---------|------|
| master_scoring_rule_id | UUID |
| master_assessment_template_id | UUID |
| rule_name | VARCHAR(100) |
| calculation_method | VARCHAR(100) |
| rounding_method | VARCHAR(50) |
| description | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Scoring Rules are reusable.
- Different Assessment Templates may use different Scoring Rules.
- The selected Scoring Rule determines how final scores are calculated.
- Rounding methods shall be applied consistently during score computation.

---

# Table: master_assessment_workflows

## Purpose

Defines reusable approval workflows for assessments.

Assessment Workflows ensure that assessment records follow the correct review and approval process before becoming available on student reports.

Example

Teacher Assessment

↓

Supervisor Review

↓

School Administrator Approval

↓

Published

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_workflow_id | UUID |
| workflow_name | VARCHAR(150) |
| description | TEXT |
| requires_teacher | BOOLEAN |
| requires_supervisor | BOOLEAN |
| requires_admin | BOOLEAN |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Workflows are reusable.
- Schools may copy and customize workflows.
- Assessment records must follow the assigned workflow before publication.

---

# Table: master_assessment_visibility

## Purpose

Controls which assessment information appears on Student Reports.

Visibility settings allow schools to customize report presentation without changing assessment data.

Examples

Show

- Raw Score
- Grade
- Percentage
- Competency Level
- Rubrics
- Teacher Observation
- Project Evidence
- Learning Outcomes
- Attendance
- Behaviour Rating

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_visibility_id | UUID |
| master_assessment_template_id | UUID |
| show_scores | BOOLEAN |
| show_grade | BOOLEAN |
| show_percentage | BOOLEAN |
| show_competency | BOOLEAN |
| show_teacher_comment | BOOLEAN |
| show_learning_outcomes | BOOLEAN |
| show_project_evidence | BOOLEAN |
| show_rubrics | BOOLEAN |
| show_attendance | BOOLEAN |
| show_behaviour | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Visibility settings affect presentation only.
- Hidden assessment data remains stored in the database.
- Schools may customize copied visibility settings independently.

---

# Table: master_assessment_comments

## Purpose

Stores reusable assessment comments.

Comments may be automatically selected based on score range, competency level, or teacher selection.

Examples

- Excellent performance.
- Demonstrates strong logical reasoning.
- Shows outstanding creativity.
- Good understanding of programming concepts.
- Needs additional practice.
- Requires closer supervision.

---

## Columns

| Column | Type |
|---------|------|
| master_assessment_comment_id | UUID |
| master_assessment_template_id | UUID |
| minimum_score | DECIMAL(6,2) |
| maximum_score | DECIMAL(6,2) |
| gender_specific | BOOLEAN |
| comment_text | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Comments are reusable.
- Comments may be selected automatically based on score range.
- Gender-specific comments shall be supported where required.
- Schools may customize copied comments independently.

---

# Business Rules

- Master Assessment Templates are managed only by Platform Administrators.
- School Administrators cannot modify the Master Assessment Library directly.
- Schools may copy Master Assessment Templates into their own assessment libraries.
- Copied templates become independent of the Master Library.
- Updates to the Master Library shall not overwrite school-customized templates.
- Assessment Templates support version control.
- Assessment Templates may be used by both CBT and Manual Assessment modules.
- Historical templates remain available for previously generated reports.
- A Template may contain multiple Sections.
- A Section may contain multiple Assessment Criteria.
- An Assessment Criterion may contain multiple Rubric Levels.
- Competency Levels support automatic score mapping.
- Scoring Rules are reusable across multiple templates.
- Visibility settings control report presentation only.
- Assessment Types are configurable and extensible.

---

# Relationship Overview

```text
Master Assessment Types

↓

Master Assessment Templates

↓

Assessment Sections

↓

Assessment Criteria

↓

Rubrics

↓

Competency Levels

↓

Scoring Rules

↓

Assessment Workflow

↓

Visibility Rules

↓

Assessment Comments

↓

Operational Assessment Engine
```

---

# Summary

The Master Assessment Library provides the reusable assessment framework for the Nobletech Education Management Platform.

It centralizes Assessment Types, Assessment Templates, Assessment Sections, Assessment Criteria, Rubrics, Competency Levels, Scoring Rules, Approval Workflows, Visibility Settings, and Assessment Comments into a single authoritative repository managed by Nobletech Academy.

This architecture enables schools to create consistent, flexible, and customizable assessment systems while preserving the integrity of the Master Library. It supports manual assessments, competency-based evaluation, practical projects, CBT examinations, Coding, Robotics, STEAM, Artificial Intelligence, Python, Web Development, Arduino, IoT, Cybersecurity, Animation, and future educational programmes without requiring structural database changes.

---

# End of Document