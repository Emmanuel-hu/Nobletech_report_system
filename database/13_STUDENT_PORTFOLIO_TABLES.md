# Nobletech Education Management Platform (NEMP)

# 13_STUDENT_PORTFOLIO_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Student Portfolio Tables |
| Document Code | NEMP-DB-SPF-013 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

The Student Portfolio Engine serves as the lifelong digital learning record for every student enrolled on the Nobletech Education Management Platform (NEMP).

Unlike a traditional report card that only presents examination results for a particular term, the Student Portfolio captures the complete learning journey of every learner from enrollment to graduation.

The Portfolio Engine automatically consolidates learning data from the Curriculum Engine, Assessment Engine, Report Engine, Certificate Engine, and Achievement System into a single evidence-based digital profile.

The Student Portfolio records:

- Academic Progress
- Programme Components Completed
- Skills Acquired
- Skill Growth Over Time
- Projects Completed
- Assessment Performance
- Learning Evidence
- Competitions
- Badges
- Certificates
- Teacher Feedback
- Portfolio Showcase
- Student Reflections
- Parent Feedback (Future)
- Mentor Feedback (Future)
- AI Learning Summary (Future)

The portfolio provides a permanent, verifiable, and shareable record of student learning throughout their educational journey.

---

# Objectives

The Student Portfolio Engine is designed to:

- Build a lifelong learning record for every student.
- Showcase practical skills and completed projects.
- Record verified learning evidence.
- Display achievements and certifications.
- Track programme completion.
- Display verified skill progression.
- Support university and scholarship applications.
- Support employment and internship applications.
- Support coding and robotics competitions.
- Enable secure portfolio sharing.
- Support future AI-generated learning summaries.
- Integrate seamlessly with the Assessment Engine.

---

# Portfolio Architecture

```text
Student

↓

Enrollment

↓

Curriculum

↓

Programme Components

↓

Projects

↓

Assessment Results

↓

Assessment Skill Progress

↓

Evidence

↓

Achievements

↓

Certificates

↓

Portfolio

↓

Showcase

↓

Sharing

↓

Public Portfolio
```

---

# Portfolio Tables

The Student Portfolio Engine consists of the following operational tables:

1. student_portfolios
2. portfolio_programmes
3. portfolio_projects
4. portfolio_skill_snapshots
5. portfolio_evidence
6. portfolio_achievements
7. portfolio_certificates
8. portfolio_showcase
9. portfolio_reflections
10. portfolio_feedback
11. portfolio_sharing
12. portfolio_activity_history

---

# Table: student_portfolios

## Purpose

Represents the primary digital portfolio belonging to a student.

Each student automatically receives one Portfolio upon enrollment.

The Portfolio grows continuously throughout the student's learning journey and remains available after graduation according to the school's data retention policy.

---

## Columns

| Column | Type |
|---------|------|
| student_portfolio_id | UUID |
| student_id | UUID |
| school_id | UUID |
| title | VARCHAR(250) |
| description | TEXT |
| portfolio_slug | VARCHAR(200) |
| cover_image | TEXT |
| theme | VARCHAR(100) |
| visibility | ENUM (Private, School, Public, Shared) |
| status | ENUM (Active, Archived) |
| last_activity | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every Student automatically receives one Portfolio.
- Portfolio Slugs must be unique.
- Portfolio URLs shall remain stable after creation.
- Schools determine Portfolio Visibility.
- Archived Portfolios remain available for historical purposes.
- Portfolio themes affect presentation only.

---

# Table: portfolio_programmes

## Purpose

Tracks every Programme Component undertaken by the student.

This table provides a consolidated view of the learner's progress across Coding, Robotics, STEAM, Artificial Intelligence, Python, Web Development, Arduino, IoT, Cybersecurity, Animation, Electronics, Fun Science, and future programmes.

---

## Examples

- Coding
- Robotics
- STEAM
- Artificial Intelligence
- Python
- Web Development
- Arduino
- Cybersecurity
- Internet of Things
- Animation
- Electronics
- Fun Science

---

## Columns

| Column | Type |
|---------|------|
| portfolio_programme_id | UUID |
| student_portfolio_id | UUID |
| programme_component_id | UUID |
| completion_status | ENUM (Not Started, In Progress, Completed) |
| completion_percentage | DECIMAL(5,2) |
| current_level | VARCHAR(100) |
| mastery_status | VARCHAR(100) |
| completed_at | TIMESTAMP |
| last_updated | TIMESTAMP |

---

## Business Rules

- A Portfolio may contain multiple Programme Components.
- Programme completion is updated automatically from Curriculum and Assessment data.
- Completion Percentage shall always reflect the latest learning progress.
- Mastery Status is calculated from Assessment Skill Progress.
- Programme data remains synchronized with the Curriculum Engine.

---

# Table: portfolio_projects

## Purpose

Stores every project completed by the student throughout their learning journey.

Projects are automatically synchronized from the Curriculum Engine and Assessment Engine after successful completion.

Projects form one of the strongest pieces of evidence within the student's portfolio and may be showcased publicly where permitted.

---

## Examples

- Calculator
- Snake Game
- Portfolio Website
- Weather App
- Smart Traffic Light
- Automatic Dustbin
- Robot Car
- Face Detection System
- AI Chatbot
- Smart Home
- IoT Weather Station

---

## Columns

| Column | Type |
|---------|------|
| portfolio_project_id | UUID |
| student_portfolio_id | UUID |
| curriculum_project_id | UUID |
| assessment_result_id | UUID |
| project_title | VARCHAR(250) |
| project_description | TEXT |
| completion_status | ENUM (Not Started, In Progress, Completed) |
| project_score | DECIMAL(6,2) |
| project_grade | VARCHAR(20) |
| project_evidence_count | INTEGER |
| featured_score | DECIMAL(6,2) |
| verification_status | ENUM (Pending, Verified, Rejected) |
| featured | BOOLEAN |
| completed_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Projects are automatically synchronized from the Assessment Engine.
- One Portfolio may contain multiple Projects.
- Verified Projects may appear in the Portfolio Showcase.
- Project Scores are read-only after Assessment publication.
- Project Evidence Count is automatically updated whenever new evidence is uploaded.

---

# Table: portfolio_skill_snapshots

## Purpose

Provides a portfolio-friendly snapshot of student skills.

Unlike the Assessment Engine, this table **does not calculate skill progression**.

Instead, it displays the latest verified snapshot generated from the **assessment_skill_progress** table.

The Assessment Engine remains the single source of truth for all skill calculations.

---

## Examples

Programming Logic

↓

Advanced

↓

Verified

↓

95%

Problem Solving

↓

Proficient

↓

Verified

↓

88%

Robot Programming

↓

Expert

↓

Verified

↓

98%

---

## Columns

| Column | Type |
|---------|------|
| portfolio_skill_snapshot_id | UUID |
| student_portfolio_id | UUID |
| assessment_skill_progress_id | UUID |
| skill_name | VARCHAR(200) |
| proficiency_level | VARCHAR(100) |
| mastery_status | VARCHAR(100) |
| progress_percentage | DECIMAL(5,2) |
| verified_by | UUID |
| verified_at | TIMESTAMP |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Skill Snapshots are automatically generated from Assessment Skill Progress.
- Skill calculations shall never be performed inside the Portfolio Engine.
- The Portfolio Engine only displays verified skills.
- Display Order determines presentation sequence.
- Skill Snapshots support dashboards, portfolios, and public sharing.

---

# Table: portfolio_evidence

## Purpose

Stores evidence associated with portfolio projects.

Evidence demonstrates practical learning and allows parents, teachers, universities, employers, and competition judges to verify student accomplishments.

Evidence is synchronized automatically from Assessment Evidence.

---

## Supported Evidence Types

- Scratch Projects
- Python Programs
- Arduino Sketches
- mBlock Projects
- MIT App Inventor Projects
- HTML/CSS/JavaScript Projects
- Images
- Videos
- PDF Documents
- Presentation Slides
- ZIP Files
- GitHub Repository
- Google Drive
- OneDrive
- YouTube Demonstrations
- External URLs

---

## Columns

| Column | Type |
|---------|------|
| portfolio_evidence_id | UUID |
| portfolio_project_id | UUID |
| assessment_evidence_id | UUID |
| evidence_type | VARCHAR(100) |
| title | VARCHAR(250) |
| file_url | TEXT |
| thumbnail_url | TEXT |
| mime_type | VARCHAR(150) |
| file_size | BIGINT |
| uploaded_by | UUID |
| uploaded_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Evidence is synchronized automatically from the Assessment Engine.
- A Portfolio Project may contain multiple Evidence records.
- Evidence remains permanently linked to the originating Project.
- Thumbnail generation should be supported for images and videos.
- Evidence supports secure sharing through the Portfolio Sharing module.
- Deleted Assessment Evidence shall not automatically remove Portfolio Evidence unless permitted by system policy.

---

# Table: portfolio_achievements

## Purpose

Stores all achievements earned by a student throughout their learning journey.

Achievements are synchronized automatically from the Assessment Engine and become part of the student's permanent digital portfolio.

Achievements recognize academic excellence, practical skills, innovation, leadership, participation, and outstanding performance.

---

## Examples

- Coding Explorer
- Robotics Builder
- STEAM Champion
- AI Innovator
- Python Programmer
- Arduino Engineer
- Cybersecurity Defender
- Innovation Award
- Problem Solver
- Creative Thinker
- Team Leader
- Perfect Attendance
- Competition Winner
- Outstanding Project

---

## Columns

| Column | Type |
|---------|------|
| portfolio_achievement_id | UUID |
| student_portfolio_id | UUID |
| student_achievement_id | UUID |
| achievement_badge_id | UUID |
| title | VARCHAR(200) |
| description | TEXT |
| badge_level | VARCHAR(50) |
| display_order | INTEGER |
| featured | BOOLEAN |
| awarded_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Achievements are synchronized automatically from the Assessment Engine.
- One Portfolio may contain multiple Achievements.
- Featured Achievements may appear on the Portfolio Home Page.
- Achievement history shall never be deleted.
- Display Order determines presentation order.

---

# Table: portfolio_certificates

## Purpose

Displays certificates earned by the student.

Certificates are synchronized from the Certificate Engine and provide verified proof of programme completion and accomplishments.

Certificates may be downloaded, verified online, or shared publicly according to portfolio sharing settings.

---

## Examples

- Coding Foundation Certificate
- Robotics Foundation Certificate
- Artificial Intelligence Essentials
- Python Programming Level 1
- Arduino Programming Certificate
- Summer Camp Certificate
- Bootcamp Certificate
- Competition Excellence Certificate

---

## Columns

| Column | Type |
|---------|------|
| portfolio_certificate_id | UUID |
| student_portfolio_id | UUID |
| student_certificate_id | UUID |
| certificate_name | VARCHAR(250) |
| certificate_number | VARCHAR(100) |
| verification_status | ENUM (Verified, Pending, Revoked) |
| display_order | INTEGER |
| featured | BOOLEAN |
| issued_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Certificates are synchronized automatically from the Certificate Engine.
- Certificates remain permanently available unless revoked.
- Verification Status reflects the current validity of the certificate.
- Featured Certificates may appear on the Portfolio Home Page.
- Certificate verification links shall remain active.

---

# Table: portfolio_showcase

## Purpose

Allows students and authorized staff to highlight outstanding projects, achievements, and learning experiences.

The Portfolio Showcase represents the student's best work and may be displayed publicly depending on sharing permissions.

It serves as a professional digital showcase for:

- Parents
- Schools
- Universities
- Scholarship Boards
- Competition Judges
- Internship Applications
- Employers

---

## Examples

- Best Scratch Project
- Best Robotics Project
- Best Website Design
- Best Artificial Intelligence Project
- Innovation Award Winner
- Outstanding Presentation
- Competition Winner
- Featured Student Project

---

## Columns

| Column | Type |
|---------|------|
| portfolio_showcase_id | UUID |
| student_portfolio_id | UUID |
| portfolio_project_id | UUID NULL |
| portfolio_achievement_id | UUID NULL |
| portfolio_certificate_id | UUID NULL |
| title | VARCHAR(250) |
| description | TEXT |
| showcase_order | INTEGER |
| featured_by | UUID |
| verification_status | ENUM (Pending, Verified, Rejected) |
| featured_on_homepage | BOOLEAN |
| featured_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Showcase Items may reference Projects, Achievements, or Certificates.
- Only verified Showcase Items may be publicly displayed.
- Showcase Order determines display sequence.
- Schools may feature outstanding student work.
- Featured items support future public portfolio pages.

---

# Table: portfolio_reflections

## Purpose

Stores personal reflections written by students throughout their learning journey.

Reflections encourage self-assessment, critical thinking, creativity, and continuous improvement by allowing students to document what they have learned, the challenges they encountered, and how they solved them.

Reflection entries may be linked to projects, assessments, or programme components.

---

## Examples

- Today I built my first Traffic Light using Arduino.
- I learnt how variables work in Scratch.
- Debugging was difficult, but I eventually solved the problem.
- I improved my teamwork during today's Robotics Challenge.

---

## Columns

| Column | Type |
|---------|------|
| portfolio_reflection_id | UUID |
| student_portfolio_id | UUID |
| portfolio_project_id | UUID NULL |
| programme_component_id | UUID NULL |
| title | VARCHAR(250) |
| reflection | TEXT |
| reflection_date | DATE |
| visibility | ENUM (Private, Teacher, Parent, Public) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Students may create multiple Reflections.
- Reflections may optionally be linked to Projects.
- Schools determine whether students can edit submitted Reflections.
- Reflection visibility is configurable.

---

# Table: portfolio_feedback

## Purpose

Stores feedback provided by teachers, mentors, parents, supervisors, competition judges, and other authorized reviewers.

Feedback helps students improve while creating a permanent record of professional evaluations.

---

## Feedback Sources

- Teacher
- Coding Instructor
- Robotics Instructor
- STEAM Instructor
- School Administrator
- Parent (Future)
- Mentor (Future)
- Competition Judge
- External Reviewer

---

## Columns

| Column | Type |
|---------|------|
| portfolio_feedback_id | UUID |
| student_portfolio_id | UUID |
| portfolio_project_id | UUID NULL |
| feedback_source | VARCHAR(100) |
| feedback_provider_id | UUID |
| rating | DECIMAL(3,2) NULL |
| feedback | TEXT |
| visibility | ENUM (Private, Student, School, Public) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Multiple Feedback records may exist for a Portfolio.
- Feedback visibility is configurable.
- Public Feedback requires appropriate permissions.
- Ratings are optional.
- Feedback becomes part of the student's permanent learning record.

---

# Table: portfolio_sharing

## Purpose

Controls how student portfolios are securely shared with parents, schools, universities, employers, scholarship boards, and competition organizers.

Sharing settings determine who can view portfolio content and what actions they are permitted to perform.

---

## Supported Sharing Options

- Parent Access
- School Access
- Public Portfolio
- Password Protected Link
- Competition Judges
- University Admissions
- Internship Applications
- Employer Review

---

## Columns

| Column | Type |
|---------|------|
| portfolio_sharing_id | UUID |
| student_portfolio_id | UUID |
| share_type | ENUM (Private, School, Public, Password Protected, Link Only) |
| share_url | TEXT |
| password_hash | TEXT NULL |
| allow_download | BOOLEAN |
| allow_comments | BOOLEAN |
| allow_copy_link | BOOLEAN |
| view_count | INTEGER |
| expires_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Portfolio Sharing is optional.
- Public sharing requires school approval where applicable.
- Password-protected links require encrypted passwords.
- View Count is automatically updated.
- Sharing links may have expiration dates.

---

# Table: portfolio_activity_history

## Purpose

Maintains a complete audit trail of all Portfolio activities.

This table provides accountability and historical tracking for every significant action performed within the Portfolio Engine.

Tracked Activities include:

- Project Added
- Evidence Uploaded
- Reflection Created
- Feedback Added
- Achievement Awarded
- Certificate Added
- Showcase Updated
- Portfolio Shared
- Visibility Changed
- Portfolio Updated

---

## Columns

| Column | Type |
|---------|------|
| portfolio_activity_history_id | UUID |
| student_portfolio_id | UUID |
| activity_type | VARCHAR(150) |
| description | TEXT |
| performed_by | UUID |
| ip_address | VARCHAR(100) |
| device_information | TEXT |
| performed_at | TIMESTAMP |

---

## Business Rules

- Every Portfolio activity shall be recorded.
- Activity History is immutable.
- Activity records support auditing and analytics.
- Activity records shall never be permanently deleted.

---

# Business Rules

- Every Student automatically receives one Portfolio upon enrollment.
- Portfolio data is generated automatically from the Curriculum Engine, Assessment Engine, Certificate Engine, and Achievement System.
- Assessment Skill Progress is the single source of truth for learner skill development.
- Portfolio Skill Snapshots display verified skill information only.
- Evidence uploaded during Assessments is synchronized automatically.
- Projects, Achievements, and Certificates remain permanently linked to the Portfolio.
- Skills may only be verified by authorized users.
- Public Portfolio Sharing is optional.
- Schools determine Portfolio visibility policies.
- Portfolio records are retained after graduation according to school retention policies.
- Portfolio data powers Student Portals, Parent Portals, Public Portfolio Pages, Analytics, Scholarship Applications, and Employment Portfolios.

---

# Relationship Overview

```text
Student

↓

Student Portfolio

↓

Programme Components

↓

Projects

↓

Evidence

↓

Skill Snapshots

↓

Achievements

↓

Certificates

↓

Reflections

↓

Feedback

↓

Showcase

↓

Sharing

↓

Activity History

↓

Public Portfolio
```

---

# Future Enhancements

The Portfolio Engine is designed for long-term extensibility.

Future capabilities include:

- AI-generated Learning Summaries
- AI Career Recommendations
- Competency Heat Maps
- Interactive Skill Graphs
- Digital Résumé Generation
- University Application Portfolio Export
- Employer-ready Skills Profile
- Integration with GitHub
- Integration with Behance
- Integration with LinkedIn
- Integration with External Coding Platforms
- Blockchain-backed Certificate Verification
- Portfolio Analytics Dashboard
- AI Portfolio Reviewer
- Digital Portfolio Marketplace for Competitions

---

# Summary

The Student Portfolio Engine is the lifelong digital learning record of every learner within the Nobletech Education Management Platform (NEMP).

It consolidates verified information from the Curriculum Engine, Assessment Engine, Certificate Engine, Achievement System, and Report Engine into a single evidence-based portfolio that showcases each student's academic progress, practical skills, completed projects, achievements, certifications, reflections, and professional growth.

By supporting secure portfolio sharing, verified project evidence, continuous skill tracking, personalized reflections, professional feedback, and future AI-powered learning insights, the Portfolio Engine transforms NEMP from a traditional education management system into a comprehensive digital learning ecosystem.

Its modular architecture ensures scalability, interoperability, and long-term maintainability while providing students with a modern portfolio that can support academic advancement, competitions, scholarships, internships, and future career opportunities.

---

# End of Document