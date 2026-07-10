# Nobletech Education Management Platform (NEMP)

# 26_CBT_SYSTEM_ARCHITECTURE

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | CBT System Architecture |
| Document Code | NEMP-CBT-ARC-026 |
| Version | 1.0 |
| Status | Approved |
| Assessment Platform | Integrated CBT Engine |
| Deployment | Web-Based |
| Database | PostgreSQL |
| Authentication | JWT + RBAC |

---

# Purpose

This document defines the enterprise Computer-Based Testing (CBT) System Architecture for the Nobletech Education Management Platform (NEMP).

The CBT System provides a secure, scalable, configurable, and standards-based assessment platform that supports both traditional academic examinations and modern competency-based assessments.

Unlike conventional CBT systems that focus solely on objective examinations, the NEMP CBT System supports academic testing, coding assessments, robotics practicals, project-based evaluations, multimedia questions, continuous assessments, and future AI-powered examinations through a unified architecture.

The system integrates seamlessly with the Curriculum Engine, Assessment Engine, Student Portfolio, Analytics Dashboard, Notification Engine, Report Engine, and Security Framework.

---

# Objectives

The CBT System Architecture has the following objectives:

- Deliver secure online examinations.
- Support multiple assessment formats.
- Provide automatic and manual grading.
- Integrate with curriculum learning outcomes.
- Reduce examination malpractice.
- Support enterprise-scale deployments.
- Enable competency-based assessments.
- Synchronize results with the Assessment Engine.
- Automatically update Student Portfolios.
- Provide comprehensive examination analytics.
- Support future AI-assisted examinations.

---

# CBT Philosophy

NEMP follows the principle:

> **"Assessment should measure knowledge, practical competence, creativity, and problem-solving—not merely the ability to memorize information."**

The CBT system is therefore designed to support both knowledge-based and skills-based assessment.

Assessment delivery remains independent from curriculum management and report generation while integrating seamlessly with both.

---

# CBT Architecture Overview

```text
Question Bank

↓

Blueprint Engine

↓

Exam Builder

↓

Scheduling Engine

↓

Candidate Registration

↓

Authentication

↓

Secure Examination Session

↓

Question Delivery

↓

Answer Collection

↓

Auto Marking

↓

Manual Review

↓

Result Processing

↓

Assessment Engine

↓

Student Portfolio

↓

Report Engine

↓

Analytics Dashboard
```

Every examination follows this standardized workflow.

---

# Core CBT Components

The CBT subsystem consists of the following major components:

1. Question Bank Engine
2. Blueprint Engine
3. Examination Builder
4. Scheduling Engine
5. Candidate Management
6. Authentication Service
7. Examination Delivery Engine
8. Auto Marking Engine
9. Manual Marking Engine
10. Result Processing Engine
11. Security & Proctoring Engine
12. Analytics Engine

Each component performs a dedicated responsibility.

---

# Responsibilities of Each Component

| Component | Responsibility |
|-----------|----------------|
| Question Bank Engine | Manage reusable question repositories |
| Blueprint Engine | Define examination structure |
| Examination Builder | Assemble examination papers |
| Scheduling Engine | Manage examination availability |
| Candidate Management | Register eligible students |
| Authentication Service | Verify candidate identity |
| Examination Delivery Engine | Present examination questions |
| Auto Marking Engine | Automatically score objective questions |
| Manual Marking Engine | Evaluate subjective and practical responses |
| Result Processing Engine | Calculate and publish examination results |
| Security & Proctoring Engine | Monitor examination integrity |
| Analytics Engine | Produce examination insights and statistics |

---

# Supported Assessment Types

The NEMP CBT System supports a wide variety of assessment methods.

## Objective Assessments

- Multiple Choice Questions (MCQ)
- Multiple Response Questions
- True / False
- Yes / No
- Matching Questions (Future)

---

## Theory Assessments

- Short Answer
- Long Answer
- Essay Questions
- Structured Questions

Theory questions are submitted digitally and evaluated by authorized markers.

---

## Coding Assessments

Supported languages include:

- Scratch
- Blockly (Future)
- Python
- HTML
- CSS
- JavaScript
- SQL
- MIT App Inventor (Project Submission)
- Arduino Code Upload

Future versions may support live code execution and automated code evaluation.

---

## Robotics Practical Assessments

Students may be assessed through:

- Circuit Design
- Arduino Projects
- Micro:bit Projects
- Robot Programming
- Sensor Integration
- Practical Demonstrations
- Project Uploads

Assessment evidence may include photographs, videos, and project source files.

---

## Multimedia Assessments

Supported media types include:

- Images
- Audio Clips
- Video Clips
- Diagrams
- Interactive Graphics (Future)

Multimedia questions improve assessment quality across multiple subjects.

---

## Project-Based Assessments

Students may submit:

- Scratch Projects
- Websites
- Mobile Applications
- Python Applications
- Electronics Projects
- AI Projects
- Robotics Projects

Projects become part of the Student Portfolio after evaluation.

---

# Examination Lifecycle

Every examination progresses through a standard lifecycle.

```text
Draft

↓

Review

↓

Approved

↓

Scheduled

↓

Published

↓

Live

↓

Completed

↓

Marked

↓

Published

↓

Archived
```

Each stage is recorded for auditing purposes.

---

# Examination Modes

The CBT System supports multiple examination modes.

## Practice Mode

Used for:

- Revision
- Homework
- Mock Tests

Scores may optionally be excluded from official academic records.

---

## Continuous Assessment Mode

Used for:

- Class Tests
- Assignments
- Quizzes

Results synchronize with the Assessment Engine.

---

## Examination Mode

Used for official school examinations.

Examples:

- Mid-Term Examination
- End-of-Term Examination
- Promotion Examination

---

## Competition Mode

Used for:

- Coding Competitions
- Robotics Challenges
- STEM Competitions
- Olympiads

Competition results may generate badges and certificates.

---

# Examination Workflow

```text
Question Bank

↓

Blueprint

↓

Generate Examination

↓

Schedule

↓

Register Candidates

↓

Authentication

↓

Launch Examination

↓

Submit Answers

↓

Mark Examination

↓

Publish Results

↓

Portfolio Update

↓

Report Generation
```

---

# Candidate Eligibility

Students may sit for an examination only when they satisfy defined eligibility criteria.

Examples include:

- Active Enrollment
- Registered Class
- Assigned Programme
- Examination Registration
- Fee Clearance (Optional)
- Administrator Approval (Optional)

Eligibility rules remain configurable by each school.

---

# Business Rules

- Every examination must originate from an approved blueprint.
- Every candidate must be authenticated before access is granted.
- Objective questions support automatic grading.
- Theory and practical questions may require manual grading.
- Examination results synchronize automatically with the Assessment Engine.
- Approved examination results update the Student Portfolio.
- Every examination session is audited.
- Schools may configure examination rules without modifying application code.
- The architecture supports future assessment technologies without redesign.

---

# Relationship Overview

```text
Question Bank

↓

Blueprint

↓

Examination

↓

Candidate

↓

Secure Session

↓

Answer Collection

↓

Auto / Manual Marking

↓

Assessment Engine

↓

Student Portfolio

↓

Report Engine

↓

Analytics Dashboard
```

---

# End of Part 1

# Question Bank Architecture

The Question Bank Architecture serves as the knowledge repository of the NEMP CBT System.

Rather than creating examination questions repeatedly, all questions are stored in centralized, reusable, categorized question banks.

Question banks support multiple schools, programmes, curriculum versions, academic sessions, and assessment types while maintaining consistency and reducing administrative workload.

---

# Question Bank Architecture

```text
School

↓

Programme

↓

Curriculum

↓

Subject / Component

↓

Topic

↓

Question Category

↓

Question Bank

↓

Questions

↓

Question Options

↓

Difficulty Level

↓

Learning Outcome
```

Every question belongs to a structured hierarchy.

---

# Question Bank Components

The Question Bank consists of:

1. Question Banks
2. Question Categories
3. Questions
4. Question Options
5. Difficulty Levels
6. Learning Outcomes
7. Curriculum Topics
8. Question Metadata
9. Question Version History

---

# Question Classification

Every question is classified using multiple dimensions.

Standard classifications include:

- School
- Academic Level
- Programme
- Subject
- Curriculum Component
- Topic
- Learning Outcome
- Difficulty
- Question Type
- Assessment Type
- Language
- Version

This allows intelligent examination generation.

---

# Supported Question Types

The CBT Engine supports multiple question formats.

## Objective Questions

- Multiple Choice
- Multiple Response
- True / False
- Yes / No
- Fill in the Blank

---

## Theory Questions

- Short Answer
- Essay
- Structured Response

---

## Practical Questions

- Coding Exercise
- Robotics Practical
- Electronics Practical
- Circuit Design
- Project Submission

---

## Multimedia Questions

Questions may include:

- Images
- Audio
- Video
- Diagrams
- Tables
- Mathematical Expressions

Future versions may support:

- Interactive Simulations
- 3D Models
- Virtual Laboratories

---

# Difficulty Levels

Every question should have a difficulty rating.

Supported levels:

- Beginner
- Intermediate
- Advanced
- Expert

Difficulty assists the Blueprint Engine in generating balanced examinations.

---

# Bloom's Taxonomy Support

Questions may also be classified according to Bloom's Taxonomy.

Supported levels:

- Remember
- Understand
- Apply
- Analyze
- Evaluate
- Create

This enables examinations that assess higher-order thinking skills.

---

# Question Metadata

Every question stores metadata including:

- Author
- Reviewer
- Approval Status
- Creation Date
- Last Modified
- Curriculum Version
- Estimated Time
- Difficulty
- Marks
- Learning Outcome

Metadata supports quality assurance and reporting.

---

# Question Approval Workflow

Questions follow a structured approval process.

```text
Draft

↓

Review

↓

Approved

↓

Published

↓

Archived
```

Only approved questions may appear in official examinations.

---

# Blueprint Engine

The Blueprint Engine defines the structure of every examination.

Rather than selecting individual questions manually, administrators specify the examination requirements and the Blueprint Engine assembles the paper automatically.

---

# Blueprint Structure

A blueprint defines:

- Examination Duration
- Total Marks
- Passing Score
- Number of Questions
- Sections
- Topics
- Difficulty Distribution
- Learning Outcome Coverage
- Randomization Rules

---

# Example Blueprint

```text
Coding Examination

Section A

Variables

10 Questions

↓

Loops

10 Questions

↓

Functions

5 Questions

↓

Debugging

5 Questions

↓

Project Evaluation

1 Practical Task
```

Blueprints are reusable across multiple academic sessions.

---

# Blueprint Components

Each blueprint specifies:

- Programme
- Class
- Subject
- Assessment Type
- Question Distribution
- Marks Distribution
- Time Allocation
- Section Configuration

---

# Difficulty Distribution

Blueprints may specify the percentage of questions by difficulty.

Example:

| Difficulty | Percentage |
|------------|-----------:|
| Beginner | 40% |
| Intermediate | 35% |
| Advanced | 20% |
| Expert | 5% |

This ensures balanced examinations.

---

# Learning Outcome Coverage

Blueprints may require questions from specific learning outcomes.

Example:

```text
Outcome 1

↓

20%

Outcome 2

↓

30%

Outcome 3

↓

25%

Outcome 4

↓

25%
```

This ensures curriculum alignment.

---

# Examination Builder

The Examination Builder creates examination papers automatically.

Responsibilities include:

- Select Blueprint
- Retrieve Eligible Questions
- Apply Filters
- Apply Randomization
- Validate Distribution
- Assemble Examination
- Save Examination

The Examination Builder does not modify questions.

---

# Examination Assembly Workflow

```text
Blueprint

↓

Question Pool

↓

Apply Filters

↓

Difficulty Validation

↓

Learning Outcome Validation

↓

Random Selection

↓

Section Assembly

↓

Generate Examination
```

---

# Question Selection Rules

Questions are selected according to:

- Programme
- Class
- Subject
- Topic
- Difficulty
- Learning Outcome
- Approval Status
- Availability

Questions marked as inactive are excluded automatically.

---

# Randomization Engine

The Randomization Engine minimizes examination malpractice.

Supported randomization includes:

- Question Order
- Answer Option Order
- Section Order (Optional)
- Candidate Question Sets (Future)

Randomization does not alter marks or correct answers.

---

# Randomization Workflow

```text
Approved Questions

↓

Shuffle Questions

↓

Shuffle Options

↓

Maintain Answer Mapping

↓

Generate Candidate Paper
```

Every candidate may receive a unique question order while maintaining assessment fairness.

---

# Examination Scheduling Engine

The Scheduling Engine controls when examinations become available.

Administrators define:

- Start Date
- Start Time
- End Date
- End Time
- Duration
- Late Entry Policy
- Time Zone

---

# Scheduling Workflow

```text
Create Examination

↓

Configure Schedule

↓

Assign Candidates

↓

Publish

↓

Automatic Activation

↓

Automatic Closure
```

The system automatically transitions examination status based on the configured schedule.

---

# Candidate Registration

Candidates are linked to examinations through the Candidate Management Service.

Candidate information includes:

- Student ID
- Class
- School
- Programme
- Examination
- Seat Number (Optional)
- Login Token
- Eligibility Status

---

# Candidate Eligibility Validation

Before admission to an examination, the system validates:

- Active Enrollment
- Examination Registration
- School Association
- Class Membership
- Programme Assignment
- Account Status

Optional validations include:

- Fee Clearance
- Administrative Approval

---

# Examination Delivery Engine

The Examination Delivery Engine presents examination content to authenticated candidates.

Responsibilities include:

- Authenticate Candidate
- Validate Session
- Load Examination
- Apply Randomization
- Display Questions
- Save Progress
- Collect Answers
- Manage Timer
- Submit Responses

---

# Question Navigation

Schools may configure navigation behaviour.

Supported modes:

### Free Navigation

Students may move between questions freely.

---

### Sequential Navigation

Students answer questions in order.

Returning to previous questions may be restricted.

---

### Section-Based Navigation

Candidates complete one section before accessing the next.

Suitable for mixed examinations containing objective, theory, and practical sections.

---

# Auto-Save Mechanism

The Examination Delivery Engine automatically saves candidate responses.

Auto-save triggers include:

- Question Change
- Option Selection
- Text Entry
- Fixed Time Interval
- Network Reconnection

This minimizes data loss.

---

# Timer Management

Every examination includes an integrated timer.

The timer controls:

- Remaining Time
- Section Time (Optional)
- Automatic Submission
- Warning Notifications

Time calculations are performed on the server to prevent client-side manipulation.

---

# Business Rules

- Every question belongs to an approved question bank.
- Only approved questions may appear in examinations.
- Blueprints determine examination composition.
- Question selection is rule-based.
- Randomization preserves answer integrity.
- Scheduling controls examination availability automatically.
- Candidate eligibility is validated before access.
- Auto-save operates throughout the examination.
- Examination timers are server-controlled.
- Examination content is delivered only after successful authentication.

---

# End of Part 2

# Examination Session Management

The Examination Session Management subsystem controls the entire lifecycle of a student's interaction with an examination.

Its responsibilities include:

- Candidate Authentication
- Session Initialization
- Session Monitoring
- Auto-Save
- Question Navigation
- Answer Collection
- Submission
- Session Recovery
- Session Termination

Every examination session is uniquely identified and fully auditable.

---

# Examination Session Lifecycle

Every examination session follows a standardized workflow.

```text
Candidate Login

↓

Identity Verification

↓

Eligibility Validation

↓

Session Creation

↓

Question Delivery

↓

Answer Submission

↓

Auto Save

↓

Timer Monitoring

↓

Final Submission

↓

Result Processing

↓

Assessment Engine

↓

Student Portfolio

↓

Report Engine
```

Every stage is recorded in the audit logs.

---

# Candidate Authentication

Before entering an examination, every candidate must be authenticated.

Validation includes:

- Login ID
- Password
- Active User Account
- Active Student Enrollment
- Registered Examination
- School Validation
- Session Validation

Future versions may additionally support:

- QR Code Check-In
- Biometric Authentication
- Facial Recognition
- Smart ID Cards

---

# Examination Entry Validation

Before access is granted, the system validates:

- Examination Exists
- Examination is Published
- Examination is Live
- Candidate is Registered
- Candidate Belongs to School
- Candidate Belongs to Class
- Examination Window is Open

Optional validations include:

- Fee Clearance
- Administrative Approval

---

# Session Initialization

After successful validation:

The system creates an examination session containing:

- Session ID
- Candidate ID
- Examination ID
- Login Time
- Start Time
- IP Address
- Device Information
- Browser Information
- Operating System
- Session Status

The session remains active until submission or termination.

---

# Examination Dashboard

Before the examination starts, candidates are presented with an examination dashboard displaying:

- Student Name
- Examination Title
- Duration
- Total Questions
- Total Marks
- Instructions
- Examination Rules
- Remaining Attempts (where applicable)

The examination begins only after the student clicks **Start Examination**.

---

# Examination Interface

The examination interface should provide:

- Question Display
- Question Navigator
- Progress Indicator
- Remaining Time
- Auto Save Indicator
- Submit Button
- Examination Instructions

Future versions may support:

- Split Screen Mode
- Dark Mode
- Accessibility Mode

---

# Question Navigation

Supported navigation modes include:

## Free Navigation

Students may answer questions in any order.

---

## Sequential Navigation

Questions must be answered in order.

Previous questions may optionally be locked.

---

## Section-Based Navigation

Students complete one section before moving to the next.

Useful for:

- Theory
- Practical
- Coding
- Mixed Assessments

---

# Progress Tracking

The system continuously tracks candidate progress.

Examples:

- Questions Answered
- Questions Unanswered
- Questions Flagged for Review
- Remaining Questions
- Time Remaining

Progress updates automatically.

---

# Flag for Review

Candidates may mark questions for later review.

Workflow:

```text
Question

↓

Flag

↓

Continue Examination

↓

Review Before Submission
```

Flagging does not affect scoring.

---

# Auto Save Engine

The CBT system continuously saves candidate responses.

Auto-save events include:

- Question Change
- Option Selection
- Text Entry
- Every Configurable Time Interval
- Network Recovery

Students should never lose work due to accidental interruption.

---

# Network Recovery

If connectivity is interrupted:

```text
Network Lost

↓

Continue Local Session

↓

Reconnect

↓

Synchronize Answers

↓

Continue Examination
```

Future offline synchronization may further improve resilience.

---

# Examination Timer

Every examination includes a server-controlled timer.

Timer displays:

- Remaining Time
- Elapsed Time
- Section Time (Optional)

Warning messages may appear at configurable intervals.

Example:

- 30 Minutes Remaining
- 10 Minutes Remaining
- 5 Minutes Remaining
- 1 Minute Remaining

---

# Automatic Submission

When examination time expires:

```text
Timer Ends

↓

Auto Submit

↓

Save Final Answers

↓

Close Session

↓

Begin Marking
```

Students cannot continue answering after submission.

---

# Manual Submission

Candidates may submit before time expires.

Workflow:

```text
Submit Button

↓

Confirmation

↓

Final Save

↓

Close Examination

↓

Result Processing
```

Confirmation helps prevent accidental submission.

---

# Auto Marking Engine

The Auto Marking Engine evaluates objective questions immediately.

Supported question types include:

- Multiple Choice
- Multiple Response
- True / False
- Yes / No
- Fill in the Blank (Rule-Based)

Auto marking occurs immediately after submission.

---

# Manual Marking Engine

Certain assessments require human evaluation.

Examples:

- Essay Questions
- Theory Questions
- Coding Projects
- Robotics Practicals
- Project Uploads
- Circuit Design

Authorized teachers or supervisors complete manual grading.

---

# Coding Assessment Evaluation

Coding assessments may support:

- Source Code Upload
- Project Upload
- Git Repository (Future)
- Live Coding (Future)
- Automated Code Execution (Future)

Evaluation criteria include:

- Correctness
- Logic
- Readability
- Documentation
- Creativity
- Problem Solving

---

# Robotics Practical Assessment

Robotics assessments may include:

- Project Photographs
- Demonstration Videos
- Arduino Sketches
- Micro:bit Projects
- Wiring Diagrams
- Circuit Simulations
- Teacher Observation Scores

These assessments become part of the Student Portfolio.

---

# Practical File Uploads

Candidates may upload:

- PDF
- ZIP
- DOCX
- PPTX
- Images
- Videos
- Arduino Files
- Scratch Files
- HTML Projects

File size and format limits remain configurable.

---

# Result Processing Engine

After marking:

The Result Processing Engine:

- Calculates Total Score
- Calculates Percentage
- Determines Grade
- Determines Competency Level
- Stores Official Result
- Sends Results to Assessment Engine

Results are never calculated inside the rendering engine.

---

# Result Synchronization

Official examination results automatically synchronize with:

- Assessment Engine
- Student Portfolio
- Analytics Dashboard
- Report Engine
- Achievement Engine
- Badge Engine

Synchronization occurs only after result approval where applicable.

---

# Examination Recovery

Unexpected interruptions may occur.

Supported recovery events:

- Browser Crash
- Device Restart
- Temporary Network Failure
- Power Interruption

If permitted by school policy:

```text
Recover Session

↓

Restore Answers

↓

Continue Examination
```

Recovery rules remain configurable.

---

# Examination Completion

After submission:

```text
Submit

↓

Validate Answers

↓

Close Session

↓

Begin Marking

↓

Publish Result

↓

Archive Session
```

Completed sessions become read-only.

---

# Examination Analytics

The system automatically generates analytics including:

- Average Score
- Highest Score
- Lowest Score
- Pass Rate
- Fail Rate
- Question Difficulty
- Time Analysis
- Item Analysis
- Learning Outcome Performance

Analytics support academic decision-making.

---

# Business Rules

- Every examination session belongs to exactly one candidate.
- Every session belongs to one examination.
- Sessions expire automatically after submission.
- Auto-save remains enabled throughout the examination.
- Timers are controlled by the server.
- Objective questions are marked automatically.
- Practical and theory assessments support manual grading.
- Coding and robotics submissions become portfolio evidence where applicable.
- Examination sessions are immutable after completion.
- Every session is fully audited.

---

# End of Part 3

# Enterprise CBT Standards

This section establishes the enterprise standards governing the Computer-Based Testing (CBT) System across the Nobletech Education Management Platform (NEMP).

These standards ensure that every examination conducted through NEMP is secure, reliable, scalable, fair, auditable, and aligned with modern educational assessment practices.

The standards apply to all academic examinations, coding assessments, robotics practicals, AI assessments, competitions, quizzes, continuous assessments, and future examination formats.

---

# Examination Security Standards

The integrity of examinations is a fundamental requirement of the CBT System.

Every examination must be protected against:

- Unauthorized Access
- Question Leakage
- Identity Fraud
- Multiple Logins
- Browser Manipulation
- Session Hijacking
- Data Tampering
- Unauthorized Result Modification

Security controls must be enforced before, during, and after every examination.

---

# Secure Examination Environment

The Examination Delivery Engine should provide a controlled assessment environment.

Supported controls include:

- Authentication Validation
- Session Validation
- Examination Window Validation
- Candidate Eligibility Validation
- Automatic Session Monitoring
- Server-Controlled Timing
- Automatic Submission

Future enhancements may include:

- Secure Browser Mode
- Kiosk Mode
- Remote Proctoring
- AI-Based Candidate Monitoring

---

# Anti-Cheating Standards

The CBT System should actively detect and discourage examination malpractice.

Monitored events include:

- Browser Refresh
- Browser Back Button
- Multiple Login Attempts
- Opening New Tabs
- Copy Attempt
- Paste Attempt
- Print Attempt
- Screenshot Attempt (Where Supported)
- Fullscreen Exit
- Network Interruption
- Device Switching

Each event is recorded in the CBT Security Log.

---

# Examination Rules Engine

Schools should be able to configure examination policies without modifying application code.

Supported policies include:

- Examination Duration
- Passing Score
- Randomize Questions
- Randomize Options
- Navigation Rules
- Late Entry
- Early Submission
- Auto Submission
- Maximum Attempts
- Practical Upload Limits
- File Type Restrictions

Every examination may define its own rule set.

---

# Question Integrity Standards

Questions must remain secure throughout the examination lifecycle.

Requirements include:

- Questions remain encrypted during storage where appropriate.
- Questions are delivered only during active sessions.
- Correct answers are never exposed to candidates.
- Question banks are access-controlled.
- Archived questions remain read-only.

Only approved questions may appear in live examinations.

---

# Marking Standards

The marking process must be transparent and consistent.

Supported marking methods:

### Automatic Marking

Applicable to:

- Multiple Choice
- Multiple Response
- True / False
- Fill in the Blank (Rule-Based)

---

### Manual Marking

Applicable to:

- Essay Questions
- Practical Questions
- Coding Projects
- Robotics Projects
- Design Tasks

Only authorized staff may perform manual grading.

---

### Hybrid Marking

Some examinations may combine automatic and manual grading.

Example:

```text
Objective Questions

↓

Automatic Marking

+

Essay Questions

↓

Manual Marking

↓

Combined Result
```

---

# Competency-Based Assessment

The CBT System supports competency-based education.

Assessments may evaluate:

- Programming Skills
- Computational Thinking
- Critical Thinking
- Problem Solving
- Creativity
- Innovation
- Team Collaboration
- Communication
- Engineering Design
- Digital Literacy

Competency levels should synchronize with the Assessment Engine and Student Portfolio.

---

# Coding Assessment Standards

Coding assessments should evaluate practical programming ability.

Supported programming environments include:

- Scratch
- Python
- HTML
- CSS
- JavaScript
- SQL
- MIT App Inventor
- Arduino Programming

Future support includes:

- Blockly
- React
- Node.js
- C++
- Java
- AI Programming

Code execution environments should operate inside secure sandboxes.

---

# Robotics Assessment Standards

Robotics assessments should support:

- Circuit Design
- Arduino Programming
- Micro:bit Programming
- Sensor Integration
- Robot Construction
- Automation Projects
- IoT Projects
- Embedded Systems

Evidence may include:

- Images
- Videos
- Source Code
- CAD Files
- Circuit Simulations
- Observation Scores

---

# Examination Accessibility Standards

The CBT System should be accessible to all learners.

Supported accessibility features include:

- Adjustable Font Size
- High Contrast Mode
- Keyboard Navigation
- Screen Reader Compatibility
- Extended Examination Time
- Alternative Colour Schemes

Future enhancements should align with WCAG accessibility guidelines.

---

# Performance Standards

Recommended performance targets:

| Operation | Target |
|------------|--------|
| Candidate Login | < 2 Seconds |
| Examination Loading | < 3 Seconds |
| Question Navigation | < 1 Second |
| Auto Save | < 1 Second |
| Submission Processing | < 5 Seconds |
| Result Publication | Configurable |
| Dashboard Analytics | < 5 Seconds |

Performance should be monitored continuously.

---

# Scalability Standards

The CBT platform should support:

- Multiple Schools
- Thousands of Concurrent Candidates
- Multiple Simultaneous Examinations
- Large Question Banks
- High Availability
- Horizontal Scaling

The architecture should accommodate future growth without structural redesign.

---

# Audit Standards

Every examination event must be logged.

Examples include:

- Examination Creation
- Examination Approval
- Candidate Login
- Examination Start
- Question Navigation
- Auto Save
- Submission
- Auto Submission
- Manual Grading
- Result Publication
- Examination Closure

Audit records are immutable.

---

# Analytics Standards

The CBT Analytics Engine should provide:

## Candidate Analytics

- Scores
- Grades
- Time Spent
- Completion Rate
- Competency Levels

---

## Question Analytics

- Difficulty Index
- Discrimination Index
- Correct Response Rate
- Average Time per Question

---

## Examination Analytics

- Pass Rate
- Fail Rate
- Average Score
- Highest Score
- Lowest Score
- Grade Distribution

---

## School Analytics

- Subject Performance
- Class Performance
- Teacher Performance
- Programme Performance
- Longitudinal Trends

Analytics should integrate with the NEMP Analytics Dashboard.

---

# Integration Standards

The CBT System integrates with:

- Curriculum Engine
- Assessment Engine
- Student Management
- Attendance
- Portfolio Engine
- Certificate Engine
- Badge Engine
- Notification Engine
- Report Engine
- Analytics Dashboard
- Security & Audit Module

Integration must occur through approved APIs and service layers.

---

# Security Standards

The CBT System must comply with the NEMP Security Architecture.

Requirements include:

- JWT Authentication
- Role-Based Access Control (RBAC)
- Permission Validation
- Tenant Isolation
- HTTPS Communication
- Secure File Uploads
- Audit Logging
- Session Monitoring
- Automatic Session Expiration

Candidate data must remain confidential at all times.

---

# AI-Assisted Development Standards

When implementing the CBT System using GitHub Copilot or other AI coding assistants:

- Follow the approved architecture.
- Separate business logic from presentation.
- Use reusable services.
- Maintain secure examination workflows.
- Integrate with centralized authentication.
- Use standardized APIs.
- Preserve audit logging.
- Support future extensibility.
- Maintain strict tenant isolation.

All AI-generated code must undergo manual review before deployment.

---

# Future Enhancements

The architecture supports future enterprise capabilities including:

- AI Question Generation
- AI Difficulty Analysis
- AI-Assisted Marking
- Adaptive Testing
- Computer Adaptive Testing (CAT)
- Live Coding Sandboxes
- Blockly Assessments
- Scratch Project Evaluation
- Virtual Robotics Simulations
- Remote AI Proctoring
- Facial Recognition Attendance
- Voice-Based Assessment
- Offline Examination Synchronization
- Progressive Web App (PWA) Support
- Mobile Examination Application

These enhancements can be introduced without redesigning the CBT architecture.

---

# Relationship Overview

```text
Question Bank

↓

Blueprint Engine

↓

Examination Builder

↓

Scheduling Engine

↓

Candidate Registration

↓

Authentication

↓

Secure Examination Session

↓

Question Delivery

↓

Answer Collection

↓

Auto / Manual Marking

↓

Result Processing

↓

Assessment Engine

↓

Student Portfolio

↓

Report Engine

↓

Notification Engine

↓

Analytics Dashboard

↓

Audit Logs
```

---

# Summary

The Computer-Based Testing (CBT) System Architecture provides the complete assessment delivery framework for the Nobletech Education Management Platform (NEMP). It supports secure, scalable, and configurable online examinations while accommodating both traditional academic testing and modern competency-based assessments.

Through centralized question management, intelligent blueprint generation, secure examination delivery, automatic and manual grading, comprehensive analytics, and seamless integration with the Curriculum, Assessment, Portfolio, Report, Notification, and Security modules, the CBT System ensures accurate, fair, and auditable assessment outcomes.

Designed with enterprise scalability in mind, the architecture also provides a strong foundation for future innovations such as AI-generated questions, adaptive testing, remote proctoring, live coding environments, robotics simulations, and advanced learning analytics without requiring significant architectural changes.

This document serves as the definitive standard for the design, implementation, operation, and future evolution of the NEMP Computer-Based Testing platform.

---

# End of Document