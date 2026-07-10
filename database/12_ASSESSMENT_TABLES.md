# Nobletech Education Management Platform (NEMP)

# 12_ASSESSMENT_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Assessment Tables |
| Document Code | NEMP-DB-ASM-012 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

This document defines the Operational Assessment Engine of the Nobletech Education Management Platform (NEMP).

The Assessment Engine records, evaluates, tracks, and manages all student assessments throughout an academic session.

Unlike traditional school management systems that only record examination scores, the NEMP Assessment Engine supports practical learning, competency-based assessment, project evaluation, continuous assessment, digital portfolios, and student achievements.

The Assessment Engine supports assessment across all Nobletech Academy programmes, including:

- Coding
- Robotics
- STEAM
- Artificial Intelligence
- Python
- Web Development
- Arduino
- Internet of Things (IoT)
- Electronics
- Cybersecurity
- Animation
- Fun Science
- CBT Examinations
- Practical Work
- Assignments
- Homework
- Projects
- Competitions
- Summer Camp
- Bootcamp
- Future Programmes

The Assessment Engine also supports:

- Multiple assessment attempts
- Rubric-based scoring
- Competency assessment
- Criterion-based marking
- Teacher observations
- Digital evidence uploads
- Achievement badges
- Student certificates
- Skill progression tracking
- Student portfolios
- Analytics
- Report generation

---

# Objectives

The Assessment Engine is designed to:

- Record all student assessments.
- Support practical and theory assessments.
- Support CBT and manual assessments.
- Track competency development.
- Record project evidence.
- Support approval workflows.
- Generate report-ready assessment data.
- Track student achievements.
- Build student portfolios.
- Monitor skill progression over time.
- Supply assessment analytics.
- Support future educational programmes without database redesign.

---

# Assessment Workflow

```text
Student

↓

Curriculum

↓

Assessment Template

↓

Assessment

↓

Assessment Attempt

↓

Assessment Scores

↓

Evidence Upload

↓

Teacher Observation

↓

Approval Workflow

↓

Published Result

↓

Achievements

↓

Certificates

↓

Skill Progress

↓

Student Portfolio

↓

Student Report
```

---

# Operational Assessment Tables

The Operational Assessment Engine consists of the following tables:

1. assessments
2. assessment_attempts
3. assessment_scores
4. assessment_evidence
5. assessment_observations
6. assessment_comments
7. assessment_approvals
8. assessment_results
9. achievement_badges
10. student_achievements
11. student_certificates
12. assessment_history
13. assessment_skill_progress

---

# Table: assessments

## Purpose

Represents an assessment created for a specific school, academic session, term, class, curriculum, and programme component.

Examples

- Coding Practical
- Robotics Project
- Python Assignment
- AI Prompt Challenge
- Arduino Practical
- CBT Examination
- Summer Camp Assessment

---

## Columns

| Column | Type |
|---------|------|
| assessment_id | UUID |
| school_id | UUID |
| session_id | UUID |
| term_id | UUID |
| class_id | UUID |
| curriculum_id | UUID |
| programme_component_id | UUID |
| assessment_template_id | UUID |
| assessment_type_id | UUID |
| title | VARCHAR(250) |
| description | TEXT |
| total_score | DECIMAL(6,2) |
| assessment_date | DATE |
| due_date | DATE |
| status | ENUM (Draft, Published, Closed, Archived) |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every Assessment belongs to one School.
- Every Assessment belongs to one Academic Session.
- Every Assessment belongs to one Academic Term.
- Every Assessment belongs to one Class.
- Every Assessment belongs to one Programme Component.
- Every Assessment references one Assessment Template.
- Assessments may be Practical, Theory, CBT, Project-based, or Competency-based.
- Published Assessments become available to learners.

---

# Table: assessment_attempts

## Purpose

Stores every assessment attempt made by a student.

Multiple attempts are supported to accommodate assignments, CBT retakes, project resubmissions, and competency improvement activities.

The official attempt is determined by the configured Scoring Rule.

---

## Columns

| Column | Type |
|---------|------|
| assessment_attempt_id | UUID |
| assessment_id | UUID |
| student_id | UUID |
| attempt_number | INTEGER |
| submission_source | ENUM (Manual, CBT, Upload, Competition, Observation, Portfolio) |
| submission_status | VARCHAR(50) |
| late_submission | BOOLEAN |
| submission_duration | INTEGER |
| device_used | VARCHAR(150) |
| submitted_at | TIMESTAMP |
| total_score | DECIMAL(6,2) |
| percentage | DECIMAL(5,2) |
| competency_level_id | UUID |
| grading_letter | VARCHAR(10) |
| status | ENUM (Pending, Reviewed, Approved, Rejected) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Student may have multiple Attempts.
- Attempt numbers must be sequential.
- CBT and Manual Assessments both create Attempts.
- The configured Scoring Rule determines the official Attempt.
- Submission Duration supports CBT timing analytics.
- Device information supports examination auditing.
- Late submissions may be handled according to school policy.

---

# Table: assessment_scores

## Purpose

Stores criterion-by-criterion scores awarded during an Assessment Attempt.

Each score represents the learner's performance against a specific Assessment Criterion defined in the Assessment Template.

This enables detailed performance analysis beyond the final score.

---

## Examples

Programming Logic

↓

9 / 10

Problem Solving

↓

10 / 10

Debugging

↓

8 / 10

Documentation

↓

9 / 10

Presentation

↓

10 / 10

---

## Columns

| Column | Type |
|---------|------|
| assessment_score_id | UUID |
| assessment_attempt_id | UUID |
| assessment_criteria_id | UUID |
| assessment_rubric_id | UUID NULL |
| score | DECIMAL(6,2) |
| maximum_score | DECIMAL(6,2) |
| percentage | DECIMAL(5,2) |
| competency_level_id | UUID NULL |
| remarks | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every Score belongs to one Assessment Attempt.
- Every Score references one Assessment Criterion.
- Rubrics are optional depending on the Assessment Template.
- Competency Levels may be assigned automatically.
- Criterion Scores contribute to the Final Assessment Result.
- Scores remain editable until the Assessment is approved.

---

# Table: assessment_evidence

## Purpose

Stores supporting evidence submitted during an Assessment Attempt.

Evidence may be uploaded by students or teachers and forms part of the student's digital portfolio.

Evidence supports project-based learning, competency assessment, moderation, and verification.

---

## Supported Evidence Types

- Scratch Project
- Python Source Code
- Arduino Sketch
- MIT App Inventor Project
- mBlock Project
- HTML/CSS/JavaScript Project
- Images
- Videos
- PDF Documents
- ZIP Files
- GitHub Repository
- Google Drive
- OneDrive
- YouTube
- External URL

---

## Columns

| Column | Type |
|---------|------|
| assessment_evidence_id | UUID |
| assessment_attempt_id | UUID |
| evidence_type | VARCHAR(100) |
| file_name | VARCHAR(255) |
| file_url | TEXT |
| file_size | BIGINT |
| mime_type | VARCHAR(150) |
| verification_status | VARCHAR(50) |
| uploaded_by | UUID |
| uploaded_at | TIMESTAMP |

---

## Business Rules

- An Assessment Attempt may contain multiple Evidence records.
- Evidence remains permanently linked to the Assessment Attempt.
- Uploaded files shall support future cloud storage providers.
- Evidence supports Student Portfolio generation.
- Verification Status may be used during moderation.

---

# Table: assessment_observations

## Purpose

Stores teacher observations recorded during or after an Assessment Attempt.

Observations capture learner behaviour, practical performance, collaboration, creativity, and other qualitative information.

---

## Examples

- Demonstrates excellent logical thinking.
- Shows creativity during project implementation.
- Requires additional debugging practice.
- Excellent teamwork and communication.
- Demonstrates strong leadership skills.

---

## Columns

| Column | Type |
|---------|------|
| assessment_observation_id | UUID |
| assessment_attempt_id | UUID |
| observer_id | UUID |
| observation | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- An Assessment Attempt may contain multiple Observations.
- Observations support competency-based assessment.
- Observations may appear on Student Reports based on Report Visibility Settings.
- Observations become read-only after approval.

---

# Table: assessment_comments

## Purpose

Stores comments attached to an Assessment Attempt.

Comments may be entered manually or generated automatically using predefined comment libraries.

Comments may be generated from:

- Assessment Score
- Grade
- Competency Level
- Rubric Performance
- Learning Outcomes
- Attendance
- Achievement
- Teacher Recommendation

---

## Columns

| Column | Type |
|---------|------|
| assessment_comment_id | UUID |
| assessment_attempt_id | UUID |
| comment_type | VARCHAR(100) |
| comment_source | VARCHAR(100) |
| comment_text | TEXT |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Multiple Comments may exist for a single Assessment Attempt.
- Comments may be manually entered or automatically generated.
- Gender-aware comments shall be supported.
- Comments remain editable until the Assessment is approved.

---

# Table: assessment_approvals

## Purpose

Tracks the approval workflow for Assessment Attempts.

Approval ensures that only validated assessment results become available for report generation and publication.

---

## Approval Workflow

Teacher

↓

Supervisor

↓

School Administrator

↓

Published

---

## Columns

| Column | Type |
|---------|------|
| assessment_approval_id | UUID |
| assessment_attempt_id | UUID |
| approved_by | UUID |
| approval_level | VARCHAR(100) |
| approval_status | VARCHAR(50) |
| remarks | TEXT |
| approved_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every Approval belongs to one Assessment Attempt.
- Multiple Approval Levels may exist.
- Approval follows the configured Assessment Workflow.
- Only Approved Assessments may generate official Assessment Results.
- Approval history shall never be deleted.

---

# Table: assessment_results

## Purpose

Stores the final published result for each student after all assessment attempts, approvals, scoring rules, and moderation have been completed.

This table serves as the official assessment record used for:

- Student Reports
- Report Cards
- Student Portfolio
- Analytics
- Certificates
- Parent Portal
- Student Portal

Only one published result exists for each student per assessment.

---

## Columns

| Column | Type |
|---------|------|
| assessment_result_id | UUID |
| assessment_id | UUID |
| student_id | UUID |
| final_assessment_attempt_id | UUID |
| total_score | DECIMAL(6,2) |
| percentage | DECIMAL(5,2) |
| grade | VARCHAR(10) |
| competency_level_id | UUID NULL |
| result_status | VARCHAR(50) |
| published_by | UUID |
| published_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- One published Result exists for each Student Assessment.
- The Final Attempt is determined by the configured Scoring Rule.
- Results become read-only after publication.
- Only Published Results are available for Report Generation.
- Published Results remain available for historical reporting.

---

# Table: achievement_badges

## Purpose

Defines the badges that students may earn based on assessment performance, competency development, participation, attendance, projects, competitions, or other achievements.

Badges encourage motivation and recognize learner accomplishments.

---

## Examples

- Coding Explorer
- Robotics Builder
- Python Programmer
- AI Innovator
- Arduino Engineer
- IoT Creator
- Electronics Designer
- Animation Artist
- Cybersecurity Defender
- STEAM Champion
- Problem Solver
- Creative Thinker
- Team Leader
- Innovation Award
- Perfect Attendance

---

## Columns

| Column | Type |
|---------|------|
| achievement_badge_id | UUID |
| badge_name | VARCHAR(200) |
| description | TEXT |
| badge_image | TEXT |
| category | VARCHAR(100) |
| criteria | TEXT |
| badge_level | ENUM (Bronze, Silver, Gold, Platinum, Diamond) |
| display_order | INTEGER |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Badges are reusable across all schools.
- Badges may be awarded automatically or manually.
- Badge Levels support progressive achievement.
- Badges remain available for historical records even when deactivated.

---

# Table: student_achievements

## Purpose

Records every badge, recognition, or achievement earned by a student.

Achievements become part of the student's permanent learning portfolio.

Achievements may originate from:

- Assessments
- Competitions
- Projects
- Attendance
- Behaviour
- Coding Challenges
- Robotics Challenges
- Teacher Recognition
- School Awards

---

## Columns

| Column | Type |
|---------|------|
| student_achievement_id | UUID |
| student_id | UUID |
| achievement_badge_id | UUID |
| assessment_id | UUID NULL |
| awarded_by | UUID |
| award_reason | TEXT |
| award_method | VARCHAR(100) |
| awarded_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Students may earn multiple Achievements.
- Achievements remain permanently linked to the Student Portfolio.
- Automatic Achievement Rules shall be configurable.
- Manual awards require appropriate user permissions.

---

# Table: student_certificates

## Purpose

Stores certificates issued to students after successful completion of programmes, competitions, bootcamps, camps, certifications, or assessment milestones.

Certificates support online verification and long-term record keeping.

---

## Examples

- Coding Foundation Certificate
- Robotics Foundation Certificate
- Python Level 1 Certificate
- Artificial Intelligence Essentials
- Arduino Programming Certificate
- Summer Camp Certificate
- Bootcamp Certificate
- Competition Winner Certificate

---

## Columns

| Column | Type |
|---------|------|
| student_certificate_id | UUID |
| student_id | UUID |
| certificate_template_id | UUID |
| certificate_name | VARCHAR(250) |
| certificate_number | VARCHAR(100) |
| issue_date | DATE |
| expiry_date | DATE NULL |
| verification_hash | VARCHAR(255) |
| verification_url | TEXT |
| pdf_url | TEXT |
| qr_code | TEXT |
| issued_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Certificate Numbers must be unique.
- Certificates may optionally expire.
- Certificates support QR Code verification.
- Certificates support online verification.
- Certificates remain permanently available within the Student Portfolio.
- Certificates may be regenerated without changing their verification identity.

---
# Table: assessment_history

## Purpose

Maintains a complete audit trail of all activities performed within the Assessment Engine.

The Assessment History ensures accountability, transparency, compliance, and traceability by recording every significant action performed on an assessment throughout its lifecycle.

Tracked Activities include:

- Assessment Creation
- Assessment Updates
- Score Changes
- Rubric Changes
- Teacher Comments
- Evidence Uploads
- Approval Actions
- Result Publication
- Badge Awards
- Certificate Generation
- Skill Progress Updates

---

## Columns

| Column | Type |
|---------|------|
| assessment_history_id | UUID |
| assessment_id | UUID |
| student_id | UUID |
| action | VARCHAR(150) |
| performed_by | UUID |
| old_value | JSONB |
| new_value | JSONB |
| ip_address | VARCHAR(100) |
| device_information | TEXT |
| performed_at | TIMESTAMP |

---

## Business Rules

- Every significant assessment activity shall be recorded.
- History records are immutable.
- History supports auditing and compliance.
- Assessment History powers operational analytics.
- History records shall never be permanently deleted.

---

# Table: assessment_skill_progress

## Purpose

Tracks the continuous development of student competencies and practical skills across multiple assessments.

Unlike assessment scores, which represent performance at a single point in time, Skill Progress measures long-term growth and mastery.

This enables teachers, parents, and administrators to monitor student improvement throughout the academic year.

Skill Progress may be calculated from:

- Coding Assessments
- Robotics Projects
- Practical Activities
- Competency Assessments
- Teacher Observations
- Project Performance
- Portfolio Reviews
- Competitions

---

## Example

Programming Logic

↓

20%

↓

45%

↓

68%

↓

82%

↓

95%

↓

Mastered

Another Example

Problem Solving

↓

Beginning

↓

Developing

↓

Proficient

↓

Advanced

---

## Columns

| Column | Type |
|---------|------|
| assessment_skill_progress_id | UUID |
| student_id | UUID |
| programme_component_id | UUID |
| skill_name | VARCHAR(200) |
| competency_level_id | UUID NULL |
| progress_percentage | DECIMAL(5,2) |
| mastery_status | VARCHAR(50) |
| last_assessment_result_id | UUID |
| calculated_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Students may have multiple Skill Progress records.
- Skill Progress is calculated from historical Assessment Results.
- Progress is continuously updated throughout the academic session.
- Skill Progress powers dashboards, analytics, and student portfolios.
- Mastery Status may be calculated automatically.

---

# Business Rules

- Every Assessment belongs to one School.
- Every Assessment belongs to one Academic Session.
- Every Assessment belongs to one Academic Term.
- Every Assessment belongs to one Class.
- Every Assessment belongs to one Programme Component.
- Students may have multiple Assessment Attempts.
- Assessment Attempts support both Manual and CBT submissions.
- Scoring Rules determine the official Assessment Attempt.
- Criterion Scores contribute to the Final Result.
- Competency Levels may replace numeric scores where applicable.
- Evidence remains permanently linked to Assessment Attempts.
- Teacher Observations support competency-based evaluation.
- Assessment Comments may be generated automatically or entered manually.
- Assessment Approval follows the configured workflow.
- Only Published Results are used for Student Reports.
- Achievement Badges may be awarded automatically or manually.
- Certificates may be generated from completed programmes, achievements, or assessment outcomes.
- Every Assessment activity shall be recorded in Assessment History.
- Skill Progress shall be continuously updated using Assessment Results.
- Assessment data powers Reports, Analytics, Dashboards, Certificates, Portfolios, Parent Portal, and Student Portal.

---

# Relationship Overview

```text
Student

↓

Assessment

↓

Assessment Attempt

↓

Assessment Scores

↓

Evidence

↓

Teacher Observation

↓

Assessment Comments

↓

Approval Workflow

↓

Published Result

↓

Achievements

↓

Certificates

↓

Skill Progress

↓

Student Portfolio

↓

Student Report

↓

Analytics Dashboard
```

---

# Summary

The Operational Assessment Engine is the core performance management system of the Nobletech Education Management Platform (NEMP).

It manages the complete assessment lifecycle—from assessment creation and student submissions to scoring, approvals, result publication, achievements, certificates, and long-term skill development.

By supporting practical assessments, competency-based evaluation, digital evidence, multiple assessment attempts, automated achievements, certificate verification, and continuous skill progression, the Assessment Engine provides a comprehensive and future-ready framework for monitoring learner growth across Coding, Robotics, STEAM, Artificial Intelligence, Python, Web Development, Arduino, IoT, Cybersecurity, Animation, Fun Science, and future educational programmes.

Its modular architecture integrates seamlessly with the Curriculum Engine, Master Assessment Library, Report Engine, Student Portfolio, Analytics Engine, Parent Portal, and Student Portal, ensuring scalability, flexibility, and long-term maintainability without requiring structural database redesign.

---

# End of Document