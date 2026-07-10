# Nobletech Education Management Platform (NEMP)

# 15_CBT_ENGINE_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | CBT Engine Tables |
| Document Code | NEMP-DB-CBT-015 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

The Computer-Based Testing (CBT) Engine is the secure digital assessment delivery platform of the Nobletech Education Management Platform (NEMP).

It is responsible for creating, scheduling, delivering, monitoring, grading, validating, and synchronizing computer-based assessments across all educational programmes.

Unlike conventional CBT systems that only support multiple-choice examinations, the NEMP CBT Engine provides a unified assessment platform capable of delivering academic examinations, coding assessments, robotics practicals, simulations, project-based assessments, competency evaluations, and future AI-assisted assessments.

The CBT Engine integrates directly with:

- Curriculum Engine
- Assessment Engine
- Student Portfolio Engine
- Report Publishing Engine
- Analytics Engine

This ensures that every examination contributes to the learner's permanent academic record.

---

# Objectives

The CBT Engine is designed to:

- Deliver secure computer-based examinations.
- Support reusable question banks.
- Support curriculum-based assessment.
- Generate examinations from blueprints.
- Randomize questions and answer options.
- Support automatic and manual marking.
- Record examination attempts.
- Monitor examination security.
- Synchronize results with the Assessment Engine.
- Update Student Portfolios automatically.
- Supply assessment analytics.
- Support future AI-powered assessments.
- Scale to thousands of concurrent candidates.

---

# Supported Assessment Types

The CBT Engine supports:

- Multiple Choice Questions
- Multiple Response Questions
- True / False
- Fill in the Blank
- Short Answer
- Essay Questions
- Coding Questions
- Practical Assessments
- Image-based Questions
- Audio Questions
- Video Questions
- File Upload Questions
- Scenario-based Questions
- Case Study Questions
- Ordering Questions
- Matching Questions
- Hotspot Questions
- Blockly Assessments (Future)
- Scratch Project Assessment (Future)
- Robotics Simulation (Future)
- AI Prompt Assessment
- Python Programming Assessment
- SQL Assessment (Future)
- Mixed Question Papers

---

# CBT Workflow

```text
Question Bank

↓

Question Categories

↓

Questions

↓

Question Media

↓

Question Review

↓

Exam Blueprint

↓

Question Selection

↓

Randomization

↓

Candidate Authentication

↓

CBT Session

↓

Examination Attempt

↓

Auto Marking

↓

Manual Review

↓

Result Validation

↓

Assessment Engine

↓

Student Portfolio

↓

Report Engine

↓

Analytics
```

---

# Operational CBT Tables

The CBT Engine consists of the following operational tables:

1. question_banks
2. question_categories
3. questions
4. question_media
5. question_options
6. question_tags
7. question_history
8. question_reviews
9. exam_blueprints
10. examinations
11. examination_sections
12. examination_candidates
13. cbt_sessions
14. examination_attempts
15. examination_answers
16. examination_results
17. question_randomization_maps
18. cbt_result_sync_logs
19. cbt_notifications
20. cbt_security_logs

---

# Table: question_banks

## Purpose

Stores reusable collections of examination questions.

Question Banks serve as centralized repositories that can be reused across multiple examinations, academic sessions, schools, and programme components.

Question Banks support both Master Libraries and School-specific content.

---

## Examples

- Coding Question Bank
- Robotics Question Bank
- Artificial Intelligence Question Bank
- Python Programming Question Bank
- Web Development Question Bank
- Electronics Question Bank
- Fun Science Question Bank
- General ICT Question Bank

---

## Columns

| Column | Type |
|---------|------|
| question_bank_id | UUID |
| school_id | UUID NULL |
| programme_component_id | UUID |
| title | VARCHAR(200) |
| description | TEXT |
| visibility | ENUM (Master, School, Private) |
| version | VARCHAR(20) |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Question Banks may belong to the Master Library or an individual school.
- Question Banks support version control.
- Questions may belong to only one Question Bank.
- Schools may duplicate Master Question Banks.
- Question Banks may remain active across multiple academic sessions.

---

# Table: question_categories

## Purpose

Organizes questions into logical curriculum-based categories.

Categories improve question management and enable automatic examination generation based on curriculum topics and learning objectives.

---

## Examples

- Programming Fundamentals
- Variables
- Loops
- Functions
- Robotics
- Sensors
- HTML
- CSS
- Cybersecurity
- Networking
- Artificial Intelligence
- Electronics

---

## Columns

| Column | Type |
|---------|------|
| question_category_id | UUID |
| question_bank_id | UUID |
| curriculum_topic_id | UUID NULL |
| category_name | VARCHAR(150) |
| description | TEXT |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Categories belong to one Question Bank.
- Categories may optionally reference Curriculum Topics.
- Categories support automatic Blueprint generation.
- Display Order controls presentation sequence.

---

# Table: questions

## Purpose

Stores every examination question available within the CBT Engine.

Questions support objective, subjective, practical, multimedia, and competency-based assessment formats.

Each Question may reference media files, answer options, curriculum topics, learning outcomes, and assessment competencies.

---

## Columns

| Column | Type |
|---------|------|
| question_id | UUID |
| question_category_id | UUID |
| curriculum_topic_id | UUID NULL |
| learning_outcome_id | UUID NULL |
| question_type | ENUM (Multiple Choice, Multiple Response, True False, Fill Blank, Short Answer, Essay, Coding, Practical, Image, Audio, Video, File Upload, Scenario, Case Study, Matching, Ordering, Hotspot) |
| question_text | TEXT |
| marks | DECIMAL(6,2) |
| difficulty_level | ENUM (Beginner, Intermediate, Advanced, Expert) |
| explanation | TEXT |
| estimated_duration | INTEGER |
| status | ENUM (Draft, Review, Approved, Published, Archived) |
| is_active | BOOLEAN |
| created_by | UUID |
| approved_by | UUID NULL |
| approved_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Questions remain in Draft until approved.
- Only Approved Questions may appear in examinations.
- Questions may reference Curriculum Topics and Learning Outcomes.
- Questions support version control through Question History.
- Questions may contain multiple media resources.
- Questions may be reused across unlimited examinations.

---

# Table: question_media

## Purpose

Stores multimedia resources associated with examination questions.

Rather than storing media directly in the **questions** table, this table allows each question to reference multiple media files, supporting richer and more interactive assessments.

Supported Media Types include:

- Images
- Audio
- Video
- PDF Documents
- SVG Diagrams
- Animation Files
- External URLs
- Simulation Files (Future)
- 3D Models (Future)

---

## Columns

| Column | Type |
|---------|------|
| question_media_id | UUID |
| question_id | UUID |
| media_type | ENUM (Image, Audio, Video, PDF, SVG, Animation, External URL, Simulation, Other) |
| media_title | VARCHAR(200) |
| media_url | TEXT |
| thumbnail_url | TEXT NULL |
| file_size | BIGINT |
| mime_type | VARCHAR(100) |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- A Question may contain multiple Media resources.
- Media files are stored in the configured storage service.
- Display Order determines presentation sequence.
- Media files remain reusable across examinations.

---

# Table: question_options

## Purpose

Stores answer options for objective examination questions.

Supports:

- Multiple Choice
- Multiple Response
- True / False
- Matching
- Ordering

Each Question may contain one or more answer options.

---

## Columns

| Column | Type |
|---------|------|
| question_option_id | UUID |
| question_id | UUID |
| option_text | TEXT |
| option_image | TEXT NULL |
| option_value | VARCHAR(100) NULL |
| is_correct | BOOLEAN |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Objective Questions must contain answer options.
- Essay and Practical Questions do not require options.
- Multiple Response Questions may have multiple correct options.
- Display Order determines the presentation order.
- Options may be randomized during examination delivery.

---

# Table: question_tags

## Purpose

Stores searchable metadata for questions.

Tags improve question discovery, blueprint generation, analytics, and curriculum alignment.

Tags may represent:

- Bloom's Taxonomy
- Competencies
- Skills
- Learning Outcomes
- Curriculum Units
- Difficulty Indicators
- Keywords

---

## Examples

- Remember
- Understand
- Apply
- Analyse
- Evaluate
- Create
- Problem Solving
- Critical Thinking
- Programming Logic
- Robotics
- Artificial Intelligence

---

## Columns

| Column | Type |
|---------|------|
| question_tag_id | UUID |
| question_id | UUID |
| tag_name | VARCHAR(150) |
| tag_category | VARCHAR(100) |
| created_at | TIMESTAMP |

---

## Business Rules

- Questions may have multiple Tags.
- Tags improve automatic Blueprint generation.
- Tags support advanced filtering and reporting.
- Tags remain independent of Question Categories.

---

# Table: question_history

## Purpose

Maintains the complete version history of every Question.

Question History provides an immutable audit trail of all modifications, ensuring accountability and supporting future curriculum revisions.

Tracked Changes include:

- Question Text Updates
- Option Changes
- Media Updates
- Difficulty Changes
- Approval Changes
- Status Changes

---

## Columns

| Column | Type |
|---------|------|
| question_history_id | UUID |
| question_id | UUID |
| version_number | VARCHAR(20) |
| change_type | VARCHAR(100) |
| old_value | JSONB |
| new_value | JSONB |
| changed_by | UUID |
| changed_at | TIMESTAMP |

---

## Business Rules

- Every significant Question modification creates a History record.
- History records are immutable.
- Previous versions remain available for auditing.
- Question restoration may use historical versions.

---

# Table: question_reviews

## Purpose

Manages the academic review and approval workflow for examination questions.

Questions undergo quality assurance before becoming available for examinations.

---

## Review Workflow

Question Author

↓

Subject Reviewer

↓

Academic Supervisor

↓

Approved

↓

Published

---

## Columns

| Column | Type |
|---------|------|
| question_review_id | UUID |
| question_id | UUID |
| review_stage | VARCHAR(100) |
| reviewed_by | UUID |
| review_status | ENUM (Pending, Approved, Rejected, Revision Required) |
| review_comments | TEXT |
| reviewed_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every Question must complete the Review Workflow before publication.
- Rejected Questions return to Draft status.
- Approved Questions become eligible for examination use.
- Review History remains permanently available.

---

# Table: exam_blueprints

## Purpose

Defines the structure and composition of examinations.

Blueprints determine how questions are selected automatically from Question Banks while ensuring balanced coverage of curriculum topics, learning outcomes, competencies, and difficulty levels.

Blueprints support automatic examination generation without manual question selection.

---

## Example Blueprint

Coding Examination

↓

Variables — 10 Questions

↓

Loops — 10 Questions

↓

Functions — 10 Questions

↓

Debugging — 5 Questions

↓

Projects — 5 Questions

---

## Columns

| Column | Type |
|---------|------|
| exam_blueprint_id | UUID |
| title | VARCHAR(200) |
| programme_component_id | UUID |
| curriculum_id | UUID NULL |
| duration_minutes | INTEGER |
| total_questions | INTEGER |
| total_marks | DECIMAL(6,2) |
| passing_marks | DECIMAL(6,2) |
| randomize_questions | BOOLEAN |
| randomize_options | BOOLEAN |
| allow_question_reuse | BOOLEAN |
| version | VARCHAR(20) |
| status | ENUM (Draft, Approved, Published, Archived) |
| created_by | UUID |
| approved_by | UUID NULL |
| approved_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Blueprints may be reused across multiple examinations.
- Automatic Question Selection follows Blueprint rules.
- Question randomization is configurable.
- Blueprint versions are maintained independently.
- Only Approved Blueprints may be used for live examinations.

---

# Table: examinations

## Purpose

Represents a scheduled Computer-Based Test (CBT) examination.

An Examination is created from an approved Examination Blueprint and defines when, where, and how students will take the assessment.

Each Examination is linked to the Assessment Engine, ensuring that examination results become part of the student's official academic record.

---

## Columns

| Column | Type |
|---------|------|
| examination_id | UUID |
| exam_blueprint_id | UUID |
| school_id | UUID |
| session_id | UUID |
| term_id | UUID |
| class_id | UUID |
| assessment_id | UUID |
| exam_title | VARCHAR(250) |
| description | TEXT |
| availability_start | TIMESTAMP |
| availability_end | TIMESTAMP |
| duration_minutes | INTEGER |
| grace_period_minutes | INTEGER |
| allow_late_entry | BOOLEAN |
| allow_early_submission | BOOLEAN |
| timezone | VARCHAR(100) |
| maximum_attempts | INTEGER |
| status | ENUM (Draft, Scheduled, Live, Completed, Archived) |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every Examination must reference an approved Examination Blueprint.
- Examinations belong to one Academic Session and Term.
- Examinations may be linked directly to an Assessment.
- Examinations become read-only once published.
- Availability Window controls examination access.

---

# Table: examination_sections

## Purpose

Allows examinations to be divided into multiple independent sections.

Each section may have different durations, question types, marking rules, and navigation settings.

---

## Examples

Section A — Objective Questions

↓

Section B — Theory Questions

↓

Section C — Coding Practical

↓

Section D — Robotics Practical

---

## Columns

| Column | Type |
|---------|------|
| examination_section_id | UUID |
| examination_id | UUID |
| section_name | VARCHAR(150) |
| description | TEXT |
| duration_minutes | INTEGER |
| total_marks | DECIMAL(6,2) |
| navigation_mode | ENUM (Free, Sequential) |
| randomize_questions | BOOLEAN |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- An Examination may contain multiple Sections.
- Each Section may have independent timing.
- Sections may contain different question types.
- Display Order determines examination flow.

---

# Table: examination_candidates

## Purpose

Registers eligible students for a scheduled examination.

Candidate registration controls examination access and supports authentication before the examination begins.

---

## Columns

| Column | Type |
|---------|------|
| examination_candidate_id | UUID |
| examination_id | UUID |
| student_id | UUID |
| seat_number | VARCHAR(50) |
| candidate_number | VARCHAR(100) |
| login_token | TEXT |
| one_time_password | TEXT NULL |
| authentication_method | ENUM (Token, Password, OTP, School ID, Future Biometric) |
| status | ENUM (Registered, Authenticated, Started, Completed, Absent, Disqualified) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Only Registered Candidates may access an Examination.
- Login Tokens are generated automatically.
- OTP authentication may be enabled by the school.
- Authentication methods are configurable.
- Disqualified Candidates cannot resume examinations.

---

# Table: cbt_sessions

## Purpose

Tracks every authenticated CBT session established between a candidate and the examination platform.

The CBT Session manages authentication, reconnections, time synchronization, and secure communication throughout the examination.

---

## Columns

| Column | Type |
|---------|------|
| cbt_session_id | UUID |
| examination_candidate_id | UUID |
| session_token | TEXT |
| login_time | TIMESTAMP |
| last_activity | TIMESTAMP |
| reconnect_count | INTEGER |
| network_status | VARCHAR(50) |
| session_status | ENUM (Active, Paused, Expired, Completed, Terminated) |
| ip_address | VARCHAR(100) |
| browser_information | TEXT |
| device_information | TEXT |
| created_at | TIMESTAMP |

---

## Business Rules

- Every authenticated Candidate receives one CBT Session.
- Sessions may reconnect automatically after network interruptions.
- Session Tokens must remain unique.
- Session history supports examination auditing.
- Expired Sessions cannot be reused.

---

# Table: examination_attempts

## Purpose

Records each attempt made by a candidate during an examination.

Attempt records maintain detailed timing information and examination behaviour throughout the assessment.

---

## Columns

| Column | Type |
|---------|------|
| examination_attempt_id | UUID |
| examination_candidate_id | UUID |
| cbt_session_id | UUID |
| attempt_number | INTEGER |
| start_time | TIMESTAMP |
| end_time | TIMESTAMP |
| remaining_time | INTEGER |
| pause_count | INTEGER |
| resume_count | INTEGER |
| auto_submit | BOOLEAN |
| submission_reason | ENUM (Manual, Time Expired, Forced, Network Failure, Administrator) |
| browser_information | TEXT |
| ip_address | VARCHAR(100) |
| device_information | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Candidates may attempt examinations according to examination policy.
- Time Expiry automatically submits the examination.
- Attempt history is permanently retained.
- Pause and Resume behaviour is logged.
- Submission Reason supports auditing.

---

# Table: examination_answers

## Purpose

Stores every answer submitted during an examination.

The Answer Engine supports objective, subjective, coding, practical, and multimedia responses.

Answers may be automatically marked or manually reviewed depending on the Question Type.

---

## Columns

| Column | Type |
|---------|------|
| examination_answer_id | UUID |
| examination_attempt_id | UUID |
| question_id | UUID |
| selected_option_id | UUID NULL |
| answer_text | TEXT NULL |
| uploaded_file_url | TEXT NULL |
| awarded_marks | DECIMAL(6,2) |
| answer_duration | INTEGER |
| marked_by | UUID NULL |
| marked_at | TIMESTAMP NULL |
| ai_feedback | TEXT NULL |
| plagiarism_flag | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every submitted Answer belongs to one Examination Attempt.
- Objective Questions support automatic marking.
- Essay, Coding, and Practical Questions may require manual review.
- Uploaded Files are supported for practical assessments.
- Plagiarism detection supports future AI-based assessment.
- AI Feedback is optional and configurable.

---

# Table: examination_results

## Purpose

Stores the official results of completed CBT examinations before synchronization with the Assessment Engine.

The Examination Result represents the validated outcome of an examination attempt and serves as the official record for report generation, analytics, and student progress tracking.

Results may include automatic scores, manually reviewed scores, competency levels, rankings, and performance analytics.

---

## Columns

| Column | Type |
|---------|------|
| examination_result_id | UUID |
| examination_id | UUID |
| examination_attempt_id | UUID |
| student_id | UUID |
| assessment_id | UUID |
| total_questions | INTEGER |
| answered_questions | INTEGER |
| correct_answers | INTEGER |
| incorrect_answers | INTEGER |
| unanswered_questions | INTEGER |
| total_score | DECIMAL(6,2) |
| percentage | DECIMAL(5,2) |
| grade | VARCHAR(20) |
| competency_level | VARCHAR(100) |
| percentile | DECIMAL(5,2) |
| class_position | INTEGER NULL |
| result_status | ENUM (Draft, Validated, Published, Synced) |
| published_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every completed Examination Attempt produces one Examination Result.
- Results must be validated before publication.
- Published Results become read-only.
- Results synchronize automatically with the Assessment Engine.
- Results contribute to Student Portfolio and Report generation.

---

# Table: question_randomization_maps

## Purpose

Stores the randomized order of questions and answer options presented to each candidate.

This ensures every student receives a unique examination while allowing the exact examination sequence to be reconstructed for review, moderation, and auditing.

---

## Columns

| Column | Type |
|---------|------|
| question_randomization_map_id | UUID |
| examination_attempt_id | UUID |
| question_id | UUID |
| original_position | INTEGER |
| randomized_position | INTEGER |
| option_mapping | JSONB |
| created_at | TIMESTAMP |

---

## Business Rules

- Every randomized examination generates one Randomization Map.
- Randomization Maps are immutable.
- Maps support examination review and dispute resolution.
- Randomization never changes question content.

---

# Table: cbt_result_sync_logs

## Purpose

Tracks synchronization of CBT examination results into the Assessment Engine.

Synchronization ensures that examination scores become part of the student's official academic record.

---

## Columns

| Column | Type |
|---------|------|
| cbt_result_sync_log_id | UUID |
| examination_result_id | UUID |
| assessment_result_id | UUID NULL |
| sync_status | ENUM (Pending, Successful, Failed) |
| error_message | TEXT NULL |
| synchronized_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Every published Examination Result must be synchronized.
- Failed synchronizations may be retried.
- Synchronization history is permanently retained.
- Synchronization logs support operational monitoring.

---

# Table: cbt_notifications

## Purpose

Stores notifications delivered to candidates during an examination.

Notifications improve candidate awareness without disrupting the assessment process.

---

## Supported Notifications

- Examination Starting
- Examination Ending Soon
- 10 Minutes Remaining
- 5 Minutes Remaining
- Network Connection Lost
- Network Restored
- Fullscreen Exit Warning
- Time Extension Granted
- Examination Submitted
- Administrator Announcement

---

## Columns

| Column | Type |
|---------|------|
| cbt_notification_id | UUID |
| examination_attempt_id | UUID |
| notification_type | VARCHAR(100) |
| title | VARCHAR(200) |
| message | TEXT |
| delivered_at | TIMESTAMP |
| acknowledged_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Notifications are linked to one Examination Attempt.
- Delivery timestamps are recorded.
- Candidate acknowledgement is optional.
- Notification history supports auditing.

---

# Table: cbt_security_logs

## Purpose

Maintains a complete audit trail of security-related events occurring during an examination.

Security Logs help identify suspicious behaviour, protect examination integrity, and support investigations.

---

## Examples

- Browser Refresh
- Multiple Login Attempts
- Tab Switching
- Copy Attempt
- Paste Attempt
- Print Attempt
- Screenshot Attempt (Future)
- Fullscreen Exit
- Network Disconnection
- Developer Tools Detection
- Webcam Disabled (Future)
- Forced Submission
- Administrator Intervention

---

## Columns

| Column | Type |
|---------|------|
| cbt_security_log_id | UUID |
| examination_attempt_id | UUID |
| event_type | VARCHAR(100) |
| severity | ENUM (Information, Warning, Critical) |
| event_description | TEXT |
| browser_fingerprint | TEXT |
| screen_resolution | VARCHAR(50) |
| ip_address | VARCHAR(100) |
| recorded_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every security event is recorded.
- Critical events may automatically notify administrators.
- Security Logs remain immutable.
- Logs support disciplinary investigations and analytics.

---

# Business Rules

- Questions are organized into reusable Question Banks.
- Questions must complete the Review Workflow before publication.
- Examination Blueprints control automatic question selection.
- Question order and answer options may be randomized independently.
- Candidates must authenticate before accessing examinations.
- Every Examination Attempt is permanently recorded.
- Objective Questions support automatic marking.
- Subjective, Coding, and Practical Questions support manual review.
- Examination Results synchronize automatically with the Assessment Engine.
- Results update Student Portfolios automatically.
- Every security event is logged.
- Every synchronization event is logged.
- Every randomized examination generates a Randomization Map.
- Notification delivery is configurable.
- CBT data supports analytics, reports, dashboards, and competency tracking.

---

# Relationship Overview

```text
Question Bank

↓

Question Categories

↓

Questions

↓

Question Media

↓

Question Review

↓

Exam Blueprint

↓

Examination

↓

Candidate

↓

CBT Session

↓

Examination Attempt

↓

Answers

↓

Examination Result

↓

Assessment Engine

↓

Student Portfolio

↓

Report Publishing Engine

↓

Analytics
```

---

# Future Enhancements

The CBT Engine is designed for continuous expansion and future technologies.

Future capabilities include:

- AI-generated examination questions
- AI-assisted marking
- AI-powered essay evaluation
- Python Code Execution Sandbox
- SQL Query Assessment
- Blockly Assessment
- Scratch Project Assessment
- Robotics Simulation Assessment
- Arduino Simulation Assessment
- Offline CBT Synchronization
- Remote Online Proctoring
- Face Recognition Attendance
- AI Cheating Detection
- Eye Movement Monitoring
- Voice Authentication
- Secure Browser Integration
- Adaptive Testing
- Competency-based Adaptive Question Selection
- Gamified Assessments
- Multi-language Examinations
- Real-time Examination Analytics

---

# Summary

The Computer-Based Testing (CBT) Engine is the digital assessment delivery platform of the Nobletech Education Management Platform (NEMP).

It provides a secure, scalable, and curriculum-driven environment for delivering objective, subjective, practical, coding, robotics, AI, multimedia, and competency-based assessments.

By integrating reusable question banks, blueprint-driven examination generation, advanced candidate authentication, randomized question delivery, automated and manual marking, result synchronization, security monitoring, and analytics, the CBT Engine ensures reliable and auditable assessment delivery across all educational programmes.

Its modular architecture integrates seamlessly with the Curriculum Engine, Assessment Engine, Student Portfolio Engine, Report Publishing Engine, Analytics Engine, Parent Portal, and Student Portal while remaining flexible enough to support future assessment technologies without requiring structural database redesign.

---

# End of Document