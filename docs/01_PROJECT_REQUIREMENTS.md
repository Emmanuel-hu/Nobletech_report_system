## Phase 2J Delivery Update

- Milestone completed: Curriculum Portal UX Hardening and Backend Data Integration Completion.
- Scope delivered: editor lookup integration, richer version comparison rendering, version snapshot preview, and draft-version creation controls.
- Assignment hardening delivered: published-version-only source selection, dependent session-term lookup flow, and effective date-range validation.
- Backend integration delivered: editor lookup endpoint and explicit structure-link or implementation maintenance endpoints for topic concepts, project-topic links, and outcome mappings.
- Data integrity posture: optimistic concurrency tokens remain mandatory for update actions on mutable entities.
- Deferred boundary remains active: AI-assisted curriculum generation/regeneration is not implemented in this milestone.

## Phase 2I Delivery Update

- Milestone completed: Curriculum Authoring and Review Administrative Portal Foundation.
- Scope delivered: manual curriculum authoring, review, approval, publication, version comparison, assignment, and archive portal flows.
- Security posture: frontend foundation aligns with backend tenant context headers and permission-gated route actions.
- Audit posture: lifecycle and assignment actions surface status and history context from backend auditable endpoints.
- Deferred boundary remains active: AI-assisted curriculum generation and regeneration are intentionally not implemented in Phase 2I.

## Phase 2G Delivery Update

- Milestone completed: operational curriculum lifecycle foundation.
- Migration: `20260713055000_operational_curriculum_lifecycle_foundation`.
- Curriculum ownership model: school-owned reusable curriculum root; final academic scope resolved at assignment level.
- Assignment rule: every assignment references both `curriculum_id` and immutable `curriculum_version_id` with composite FK validation.
- Snapshot strategy: immutable `snapshot_data` JSONB on `curriculum_versions` for published history preservation.
- AI boundary: AI-assisted generation remains deferred; Phase 2G contains lifecycle and persistence foundations only.
# Nobletech Education Management Platform (NEMP)

# Software Requirements Specification (SRS)

---

## Document Information

| Item | Details |
|------|---------|
| Project Name | Nobletech Education Management Platform (NEMP) |
| Document Title | Software Requirements Specification (SRS) |
| Document Code | NEMP-SRS-001 |
| Version | 1.0 |
| Status | Approved |
| Prepared By | Nobletech Academy |
| Classification | Internal Use Only |
| Last Updated | July 2026 |

---

# Table of Contents

1. Introduction
2. Project Vision
3. Mission Statement
4. Project Objectives
5. Business Problems
6. Proposed Solution
7. Project Scope
8. Design Principles
9. Core Features
10. Target Users
11. User Roles
12. High-Level Functional Requirements
13. High-Level Non-Functional Requirements

(The remaining sections continue in Part 2.)

---

# 1. Introduction

## 1.1 Purpose

The Nobletech Education Management Platform (NEMP) is a cloud-based enterprise software solution designed specifically for Nobletech Academy to manage all programme planning, curriculum management, assessments, report generation, and Computer-Based Testing (CBT) across multiple schools from a centralized platform.

The platform replaces the existing manual report preparation process with an intelligent, configurable, secure, and scalable system capable of supporting unlimited schools, students, classes, programme components, curriculum structures, and assessment models.

The platform will significantly reduce administrative workload while maintaining the exact report format currently used by Nobletech Academy.

---

## 1.2 Background

Nobletech Academy currently provides Coding, Robotics, STEAM, Artificial Intelligence, Python, Web Development, Arduino, IoT, Electronics, Animation, Cybersecurity, Fun Science, and related technology education programmes to multiple partner schools.

Reports are presently prepared manually, requiring staff to enter information into report templates individually.

This manual process is:

- Time-consuming
- Error-prone
- Difficult to monitor
- Difficult to standardize
- Challenging for remote collaboration
- Difficult to scale as the number of schools increases

The platform will completely automate these processes.

---

## 1.3 Purpose of the Platform

The platform is designed to become the official operational system for Nobletech Academy.

It will manage:

- Schools
- Academic Sessions
- Terms
- Classes
- Students
- Programme Components
- Curriculum
- Assessments
- Projects
- Skills Evaluation
- Reports
- CBT Examinations

The platform is not intended to replace a school's complete academic management system.

Its primary purpose is to manage Nobletech Academy's educational programmes delivered within partner schools.

---

# 2. Project Vision

To become Africa's leading technology education management platform by providing an intelligent, scalable, secure, and fully configurable solution for managing Coding, Robotics, STEAM, AI, and emerging technology education programmes.

---

# 3. Mission Statement

To empower Nobletech Academy with a world-class digital platform that simplifies curriculum management, assessment, report generation, and programme administration while maintaining the highest standards of quality, accuracy, flexibility, and innovation.

---

# 4. Project Objectives

The platform shall achieve the following objectives:

- Eliminate manual report preparation.
- Reduce report preparation time by more than 90%.
- Enable staff to work securely from any location.
- Support unlimited schools.
- Support unlimited students.
- Support unlimited academic sessions.
- Support unlimited terms.
- Support unlimited classes.
- Support unlimited programme components.
- Support unlimited curriculum structures.
- Support unlimited assessment structures.
- Generate pixel-perfect report cards.
- Maintain complete audit trails.
- Improve operational efficiency.
- Ensure data consistency.
- Simplify curriculum planning.
- Automate report generation.
- Support future expansion without major redesign.
- Provide an integrated Computer-Based Testing (CBT) system with support for theory, practical, coding, and project-based assessments.

---

# 5. Business Problems

The current manual process presents several operational challenges.

These include:

## 5.1 Manual Report Preparation

Staff currently prepare reports manually using report templates.

This requires repetitive data entry and consumes significant time.

---

## 5.2 Limited Scalability

As more schools join Nobletech Academy, the manual process becomes increasingly difficult to manage.

---

## 5.3 Inconsistent Data Entry

Manual processes increase the likelihood of:

- Typographical errors
- Missing records
- Duplicate entries
- Inconsistent grading

---

## 5.4 Remote Collaboration Challenges

Staff working remotely cannot easily collaborate using the existing process.

---

## 5.5 Curriculum Management

There is currently no centralized curriculum management system capable of:

- Managing curriculum
- Reusing curriculum
- Publishing curriculum
- Versioning curriculum
- Printing curriculum

---

## 5.6 Report Generation

Generating reports individually requires considerable manual effort.

---

## 5.7 Programme Expansion

As Nobletech Academy introduces new technology programmes, modifying manual report templates becomes increasingly difficult.

---

# 6. Proposed Solution

The proposed solution is a cloud-based, multi-school education management platform that centralizes all programme management activities.

The platform will provide:

- Multi-school management
- Curriculum management
- Programme management
- Assessment management
- Dynamic report generation
- PDF generation
- CBT examinations
- School branding
- Report configuration
- Analytics
- Audit logging
- User management

The platform will be accessible through any modern web browser without requiring software installation.

---

# 7. Project Scope

Version 1.0 focuses exclusively on Nobletech Academy programmes.

The platform shall support:

- Coding
- Robotics
- STEAM
- Artificial Intelligence (AI)
- Python
- Web Development
- Cybersecurity
- Arduino
- Internet of Things (IoT)
- Electronics
- Animation
- Game Development
- Fun Science
- Digital Literacy
- Emerging Technologies (future)

The platform shall support an unlimited number of additional programme components created by administrators.

Nothing related to curriculum shall be hardcoded into the system.

# Project Scope clarification

NEMP is designed specifically to manage Nobletech Academy's technology education programmes delivered within partner schools. It is not intended to replace a school's complete School Management System (SMS). The platform focuses on curriculum delivery, practical skills assessment, portfolio management, CBT, and report generation for Nobletech Academy's programmes.

---

# 8. Design Principles

The platform shall follow the following design principles.

## 8.1 Configuration Over Hardcoding

Administrators must be able to configure the platform without requiring software developers.

---

## 8.2 Multi-Tenant Architecture

Every school shall operate independently while sharing the same platform.

Each school's data shall remain isolated.

---

## 8.3 Modular Design

Every major feature shall exist as an independent module.

---

## 8.4 Scalability

The platform shall support future expansion without requiring architectural redesign.

---

## 8.5 Security by Design

Security shall be implemented throughout every layer of the application.

---

## 8.6 Automation First

Routine tasks shall be automated wherever possible.

Examples include:

- Calculations
- Report Generation
- Curriculum Publishing
- PDF Generation
- Bulk Operations

---

## 8.7 Pixel-Perfect Reporting

Every generated PDF must match the approved report template exactly.

Layout differences shall not be permitted.

---

# 9. Core Features

The platform shall include the following core modules:

- Multi-School Management
- School Branding
- User Management
- Student Management
- Academic Session Management
- Class Management
- Programme Component Management
- Curriculum Management
- Assessment Management
- Skills Evaluation
- Report Generation
- PDF Engine
- Curriculum Publishing
- CBT Module
- Search
- Notifications
- Audit Logs
- Import & Export
- Dashboard
- Backup & Restore

---

# 10. Target Users

The platform is intended for:

- Nobletech Academy Administrators
- School Administrators
- Supervisors
- Teachers
- Data Entry Staff

Future versions will include:

- Parents
- Students

---

# 11. User Roles

The platform shall support Role-Based Access Control (RBAC).

Primary user roles include:

- Super Administrator
- School Administrator
- Supervisor
- Teacher
- Data Entry Staff

Each role shall have configurable permissions.

---

# 12. High-Level Functional Requirements

The platform shall provide functionality for:

- School Management
- User Management
- Student Management
- Programme Management
- Curriculum Management
- Assessment Management
- Skills Evaluation
- Report Management
- PDF Generation
- Curriculum Publishing
- CBT Examinations
- Search
- Notifications
- Audit Logging
- Import & Export
- Dashboard Reporting

---

# 13. High-Level Non-Functional Requirements

The platform shall be:

- Secure
- Responsive
- Cloud-Based
- Multi-Tenant
- Modular
- Scalable
- Highly Available
- High Performance
- Maintainable
- Extensible
- User Friendly
- Mobile Responsive
- Print Optimized

---

**End of Part 1**

The next section (Part 2) begins with:

**14. Multi-School Architecture**

---

# 14. Multi-School Architecture

## 14.1 Overview

The Nobletech Education Management Platform (NEMP) shall operate as a cloud-based Multi-Tenant Software as a Service (SaaS) platform.

A single installation of the platform shall securely serve multiple schools while ensuring complete separation of each school's data, branding, curriculum, reports, and users.

Every school shall function independently as though it has its own dedicated system.

---

## 14.2 School Isolation

Each school shall maintain completely independent:

- School Profile
- Logo
- Colour Theme
- Academic Sessions
- Terms
- Classes
- Students
- Teachers
- Supervisors
- Programme Components
- Curriculum
- Assessment Structures
- Skills Assessment
- Report Templates
- Report Settings
- Generated Reports
- User Accounts
- School Preferences

No school shall have access to another school's information unless explicitly authorized by the Super Administrator.

---

## 14.3 School Configuration

Each school shall be able to configure:

- School Name
- School Code
- School Logo
- School Motto
- Address
- Contact Information
- Website
- Principal's Name
- Principal's Signature
- School Stamp
- School Colours
- Report Title
- Academic Calendar
- Report Layout
- Default PDF Settings

---

# 15. School Branding

Every school shall have its own branding identity.

The branding engine shall control:

- Logo
- Report Colours
- Header Design
- Footer Design
- Report Title
- Signature
- Stamp
- Fonts (where permitted)
- Watermark
- QR Code
- Barcode
- Background Images

Branding shall automatically be applied to every report generated for the school.

---

# 16. Academic Structure

The academic structure shall be configurable.

Hierarchy:

School

↓

Academic Session

↓

Term

↓

Class

↓

Students

Each level shall be independently manageable.

---

## 16.1 Academic Sessions

The system shall support unlimited academic sessions.

Examples:

- 2025/2026
- 2026/2027
- 2027/2028

Only one academic session shall be active at a time for each school.

Historical sessions shall remain available for reporting purposes.

---

## 16.2 Terms

Each academic session shall support configurable terms.

Example:

- First Term
- Second Term
- Third Term

Schools using different academic calendars shall be able to customize term names.

---

## 16.3 Classes

The platform shall support unlimited classes.

Examples:

- Nursery 1
- Nursery 2
- Kindergarten
- Primary 1
- Primary 2
- Primary 3
- Primary 4
- Primary 5
- Primary 6
- JSS 1
- JSS 2
- JSS 3
- SS 1
- SS 2
- SS 3

Each class belongs to one school.

---

## 16.4 Class Arms

Where applicable, classes may contain multiple arms.

Examples:

- Gold
- Silver
- Emerald
- Diamond

Support for class arms shall be optional.

---

# 17. Student Management

The platform shall support unlimited students.

Each student shall belong to:

- School
- Academic Session
- Class
- (Optional) Class Arm

Each student shall have a unique admission number within the school.

---

## 17.1 Student Profile

Each student profile may contain:

- Admission Number
- First Name
- Middle Name
- Last Name
- Gender
- Date of Birth
- Passport Photograph
- Parent/Guardian Name
- Parent Phone Number
- Parent Email
- Residential Address
- Current Class
- Admission Date
- Status

The platform shall allow administrators to extend student information in future versions.

Maintain a lifelong digital portfolio of student projects, achievements, assessments, certificates, and learning progress.

---

# 18. Programme Component Management

Programme Components represent the various technology programmes delivered by Nobletech Academy.

The system shall not hardcode Programme Components.

Administrators shall be able to create, edit, archive, activate, or deactivate Programme Components at any time.

---

## 18.1 Examples of Programme Components

Examples include:

- Coding
- Robotics
- STEAM
- Artificial Intelligence (AI)
- Python
- Web Development
- Cybersecurity
- Arduino
- Internet of Things (IoT)
- Electronics
- Animation
- Game Development
- Fun Science

The system shall support unlimited additional Programme Components.

---

## 18.2 Programme Component Activation

Programme Components shall be configurable per:

- School
- Academic Session
- Term
- Class

This allows different classes to study different Programme Components during the same term.

---

## 18.3 Dynamic Report Generation

Only Programme Components activated for a particular class and term shall appear on the student's report.

Inactive Programme Components shall not appear.

The platform shall generate a single configurable report card where programme components may be enabled or disabled independently for each academic term based on the curriculum delivered.

No empty spaces shall remain on the report.

---

# 19. Curriculum Management

The Curriculum Management Engine shall control every aspect of curriculum planning and delivery.

The curriculum shall be fully configurable.

The curriculum management system shall support configurable programme components, multiple topics, projects, practical activities, learning outcomes, optional software/tools disclosure, and printable curriculum documents.

Nothing shall be hardcoded.

---

## 19.1 Curriculum Assignment

Curriculum shall be assigned based on:

- School
- Academic Session
- Term
- Class
- Programme Component

Different classes may study different curricula during the same academic term.

---

## 19.2 Curriculum Hierarchy

Every curriculum shall follow the structure below:

Programme Component

↓

Curriculum Unit

↓

Topics

↓

Projects

↓

Learning Outcomes

↓

Assessment Mapping

↓

Student Report

This hierarchy shall remain consistent throughout the platform.

---

# 20. Curriculum Units

A Curriculum Unit represents a major area of study within a Programme Component.

Examples:

Coding

↓

Programming Fundamentals

Robotics

↓

Sensors & Electronics

Artificial Intelligence

↓

Machine Learning Basics

Each Programme Component may contain unlimited Curriculum Units.

---

# 21. Topics

Each Curriculum Unit shall contain one or more Topics.

Examples:

Programming Fundamentals

↓

Variables

↓

Data Types

↓

Input & Output

↓

Operators

↓

Conditional Statements

↓

Loops

↓

Functions

The platform shall support unlimited Topics.

Topics may be reordered by administrators.

---

# 22. Projects

Each Topic may contain one or more practical Projects.

Examples:

Topic:

Variables

Projects:

- Build a Simple Calculator
- Guess the Number Game
- Student Score Analyzer

Teachers may select which Projects were completed during the term.

Projects completed shall be available for inclusion in student reports.

---

# 23. Learning Outcomes

Each Topic may define one or more Learning Outcomes.

Examples:

Students should be able to:

- Identify programming variables.
- Write simple conditional statements.
- Develop basic Scratch animations.
- Build simple robotic circuits.
- Create interactive games.

Learning Outcomes may optionally appear on printed reports.

---

# 24. Resources

Each Topic may include optional learning resources.

Examples:

- Notes
- Assignments
- Homework
- Worksheets
- Reference Materials
- Videos
- External Links
- PDF Documents

Resource visibility shall be configurable.

---

# 25. Tools, Software, Websites and Robotics Kits

Each Topic may optionally reference:

Software

Examples:

- Scratch
- mBlock
- PixToCode
- MIT App Inventor

Websites

Examples:

- Tinkercad
- Wokwi
- Code.org

Robotics Kits

Examples:

- Arduino Uno
- Raspberry Pi
- BBC micro:bit
- ESP32
- LEGO Robotics

These references are optional.

Administrators may choose whether these appear on reports or remain hidden.

---

**End of Part 2**

The next section (Part 3) begins with:

**26. Assessment Management**

---

# 26. Assessment Management

## 26.1 Overview

The Assessment Management Engine shall provide a flexible and fully configurable system for evaluating student performance across all Programme Components.

The assessment engine shall support different assessment structures for different schools, classes, programme components, academic sessions, and terms.

No assessment type shall be hardcoded.

---

## 26.2 Assessment Configuration

The School Administrator shall be able to create, edit, activate, deactivate, and archive assessment types.

Examples include:

- Class Assignment
- Practical
- Quiz
- Project
- Continuous Assessment (CA1)
- Continuous Assessment (CA2)
- Mid-Term Test
- Coding Assessment
- Robotics Assessment
- AI Assessment
- STEAM Assessment
- Examination
- Attendance
- Participation
- Presentation
- Oral Test

Schools may create additional assessment types.

---

## 26.3 Assessment Assignment

Assessment structures may differ by:

- School
- Academic Session
- Term
- Class
- Programme Component

Example:

Primary 2 Coding

- Assignment
- Practical
- Robotics 
- Project
- Examination

Primary 5 Robotics

- Practical
- Project
- Robotics Challenge
- Examination

---

## 26.4 Assessment Weighting

Each assessment type shall have configurable marks.

Example

| Assessment | Score |
|------------|------:|
| Assignment | 10 |
| Practical | 20 |
| Project | 20 |
| Examination | 50 |

Total = 100

The system shall automatically validate total scores.

---

## 26.5 Automatic Calculations

The platform shall automatically calculate:

- Total Score
- Percentage
- Grade
- Position (Optional)
- Average
- Pass/Fail Status

Manual calculation shall not be required.

---

# 27. Attendance Management

Attendance shall be configurable.

The system shall record:

- Days School Opened
- Days Present
- Days Absent
- Days Late

The platform shall automatically calculate:

- Attendance Percentage
- Attendance Rating

Attendance may appear on reports depending on school settings.

---

# 28. Skills Evaluation

The platform shall support configurable skill assessments.

Skill indicators shall not be hardcoded.

Each school may define its own evaluation criteria.

Examples include:

- Creativity
- Critical Thinking
- Problem Solving
- Communication
- Collaboration
- Leadership
- Time Management
- Computational Thinking
- Algorithmic Thinking
- Robotics Handling
- Electronics Assembly
- Innovation
- Presentation Skills

Schools may create unlimited additional indicators.

---

## 28.1 Skill Rating Scale

Each school shall configure its own rating scale.

Examples:

Excellent

Very Good

Good

Fair

Poor

or

A

B

C

D

E

or

1

2

3

4

5

---

# 29. Teacher Remarks

Teachers shall be able to write personalized remarks for every student.

Remarks may be:

- Typed manually
- Selected from predefined comments
- Automatically generated (Future)

Teacher remarks shall appear on the report based on configuration settings.

---

# 30. Supervisor Remarks

Supervisors shall be able to:

- Review reports
- Add remarks
- Request corrections
- Approve reports

Supervisor remarks shall be optional.

---

# 31. Principal Remarks

The platform shall support Principal or Head of School remarks.

Remarks may be:

- Manual
- Selected from templates
- Automatically suggested (Future)

---

# 32. Report Generation

## 32.1 Overview

The Report Engine is the core feature of the platform.

The system shall generate one dynamic report card capable of representing any combination of Programme Components.

Separate report templates for Coding, Robotics, AI, or STEAM shall not be required.

---

## 32.2 Dynamic Sections

The report shall automatically display only enabled Programme Components.

Example:

If Coding and Robotics are enabled,

Display:

Coding

Robotics

Hide:

AI

Python

Web Development

Cybersecurity

Arduino

IoT

Animation

Electronics

Fun Science

No empty spaces shall remain.

---

## 32.3 Report Content

Each Programme Component may include:

- Programme Title
- Curriculum Unit
- Topics
- Projects
- Assessment Scores
- Skill Evaluation
- Teacher Remarks
- Supervisor Remarks

All sections shall be configurable.

---

## 32.4 Visibility Controls

Administrators shall decide whether reports display:

- Curriculum Unit
- Topics
- Projects
- Learning Outcomes
- Software Used
- Websites Used
- Robotics Kits Used
- Resources
- Assessment Breakdown
- Teacher Comments
- Supervisor Comments

Hidden items shall remain stored in the database.

---

## 32.5 Report Workflow

Report Status:

Draft

↓

Teacher Completed

↓

Submitted

↓

Supervisor Review

↓

Approved

↓

PDF Generated

↓

Archived

Reports marked as Archived shall become read-only.

---

# 33. PDF Generation

The platform shall generate professional print-ready PDF reports.

Requirements include:

- Pixel-perfect rendering
- A4 paper
- Letter paper
- Portrait mode
- Landscape mode
- Multi-page support
- School logo
- Principal signature
- School stamp
- Dynamic colours
- QR Code
- Barcode
- Automatic page numbering
- Automatic page breaks
- High-resolution printing

Generated PDFs shall match the approved report template.

---

# 34. Curriculum Publishing

The platform shall generate curriculum documents.

Supported formats:

- PDF
- Microsoft Word

Future:

- Excel
- HTML

---

## 34.1 Curriculum Printing

Printing options shall include:

Standard

Compact

Outline

Compact Mode shall reduce paper usage while maintaining readability.

---

## 34.2 Curriculum Visibility

Administrators may choose to include or hide:

- Topics
- Projects
- Learning Outcomes
- Software
- Websites
- Robotics Kits
- Teaching Notes
- Assignments

This allows internal curriculum documents and simplified parent versions.

---

## 34.3 Curriculum Versioning

Every curriculum shall maintain version history.

Example:

Coding Curriculum 2026

Coding Curriculum 2027

Coding Curriculum 2028

Reports shall always reference the curriculum version assigned to that session and term.

---

## 34.4 Curriculum Lifecycle Governance

The Curriculum Lifecycle shall use the following status values only:

- GENERATED_DRAFT
- DRAFT
- UNDER_REVIEW
- REVISION_REQUIRED
- APPROVED
- PUBLISHED
- ARCHIVED

Lifecycle governance rules:

- Curriculum generated by automation or AI must start as GENERATED_DRAFT.
- GENERATED_DRAFT and DRAFT remain editable by authorized users.
- Submission for review changes status to UNDER_REVIEW.
- Review may move content to REVISION_REQUIRED or APPROVED.
- APPROVED confirms academic/quality sign-off only and does not publish.
- Publication is a separate action that moves APPROVED to PUBLISHED.
- PUBLISHED versions are immutable and require a new version for corrections.
- ARCHIVED curricula remain available for historical report traceability.

---

## 34.5 Master Library and Derivative Outputs

The Master Content Library is a source library and must not be used for direct publication.

Derivative output rules:

- Schools derive operational curriculum records from master records.
- Derived curricula may be customized at school level before review.
- Reports and curriculum PDFs must reference operational curriculum versions, not master records.
- Every derivative operation must preserve source lineage for audit and rollback.

---

# 35. Computer-Based Testing (CBT)

Version 1.0 includes a fully integrated CBT module.

The CBT module shall share the same:

- Schools
- Classes
- Students
- Users
- Academic Sessions
- Terms

No duplicate student records shall exist.

---

## 35.1 Question Bank

The Question Bank shall support:

- Multiple Choice Questions
- True/False
- Fill in the Blank
- Matching
- Short Answer (Future)

Questions shall be organized by:

- Programme Component
- Curriculum Unit
- Topic
- Difficulty Level

---

## 35.2 Examination Engine

The CBT Engine shall support:

- Random Questions
- Random Options
- Time Limits
- Auto Save
- Automatic Submission
- Instant Scoring
- Scheduled Exams

---

## 35.3 Results

The CBT module shall generate:

- Student Score
- Percentage
- Grade
- Pass/Fail
- Performance Analysis

Results may optionally contribute to report card assessments.

---

**End of Part 3**

The next section (Part 4) begins with:

**36. Dashboard & Analytics**

---

# 36. Dashboard & Analytics

## 36.1 Overview

The Dashboard shall provide users with a real-time overview of platform activities based on their assigned roles and permissions.

Each user shall only view information relevant to their responsibilities.

---

## 36.2 Super Administrator Dashboard

The Super Administrator dashboard shall display:

- Total Schools
- Active Schools
- Total Students
- Total Teachers
- Total Users
- Total Reports Generated
- Total Programme Components
- Total CBT Examinations
- Pending Report Approvals
- Recent Activities
- Storage Usage
- System Health
- Subscription Status (Future)

---

## 36.3 School Administrator Dashboard

The School Administrator dashboard shall display:

- Total Students
- Total Classes
- Total Teachers
- Active Programme Components
- Reports Pending Approval
- Reports Completed
- Attendance Summary
- Assessment Progress
- CBT Summary
- Curriculum Status

---

## 36.4 Teacher Dashboard

The Teacher dashboard shall display:

- Assigned Classes
- Assigned Programme Components
- Assessment Progress
- Reports Pending Completion
- Curriculum Coverage
- Student Performance
- Upcoming Tasks

---

## 36.5 Supervisor Dashboard

The Supervisor dashboard shall display:

- Pending Reports
- Reports Approved
- Reports Returned
- Teacher Performance
- School Progress
- Curriculum Coverage

---

# 37. Search Engine

The platform shall include a Global Search Engine.

Users shall be able to search by:

- Student Name
- Admission Number
- Parent Name
- School
- Teacher
- Class
- Programme Component
- Curriculum Unit
- Topic
- Project
- Assessment
- Report Number

Search results shall respect user permissions.

---

# 38. Import & Export

## Import

The platform shall support importing:

- Schools
- Students
- Teachers
- Classes
- Programme Components
- Curriculum
- Assessment Scores
- Attendance
- CBT Questions

Supported formats:

- Excel (.xlsx)
- CSV (.csv)

---

## Export

The platform shall support exporting:

- PDF
- Excel
- CSV

Future support:

- Word
- JSON

---

# 39. Notification Engine

The Notification Engine shall support:

- In-App Notifications
- Email Notifications

Future versions shall support:

- SMS
- WhatsApp
- Push Notifications

Notifications may include:

- Report Approval
- Report Rejection
- Curriculum Updates
- CBT Schedule
- User Invitations
- Password Reset
- System Alerts

---

# 40. User Management

The User Management module shall support:

- User Registration
- User Invitation
- Password Reset
- Role Assignment
- Permission Assignment
- User Activation
- User Deactivation
- Account Locking
- Login History

Each user shall belong to one or more schools depending on assigned permissions.

---

# 41. Security Requirements

The platform shall implement enterprise-grade security.

Features include:

- JWT Authentication
- Role-Based Access Control (RBAC)
- Password Hashing
- Session Timeout
- CSRF Protection
- XSS Protection
- SQL Injection Prevention
- Secure File Upload
- Rate Limiting
- HTTPS Enforcement
- Secure API Access

Future:

- Two-Factor Authentication (2FA)
- Single Sign-On (SSO)

---

# 42. Audit Trail

Every critical action shall be recorded.

Examples include:

- Login
- Logout
- Password Change
- Student Creation
- Report Approval
- Report Modification
- Curriculum Update
- User Creation
- Role Changes
- Data Import
- Data Export

Each audit record shall include:

- User
- Action
- Date
- Time
- Device
- Browser
- IP Address

Audit logs shall not be editable.

---

# 43. Backup & Recovery

The platform shall support:

- Automatic Daily Backup
- Manual Backup
- Scheduled Backup
- Database Restore
- File Restore

Backups shall be encrypted.

---

# 44. API Requirements

The platform shall expose secure REST APIs.

The APIs shall support:

- Authentication
- Schools
- Students
- Classes
- Curriculum
- Programme Components
- Assessments
- Reports
- CBT
- Dashboard
- Notifications

All APIs shall require authentication unless explicitly marked as public.

---

# 45. Performance Requirements

The platform shall meet the following minimum performance standards:

- Dashboard loading within 3 seconds under normal conditions.
- Report preview generation within 5 seconds for typical reports.
- PDF generation optimized for large reports.
- Support concurrent users without noticeable performance degradation.
- Efficient pagination for large datasets.

Performance targets may be refined after load testing.

---

# 46. Scalability Requirements

The platform architecture shall support:

- Unlimited Schools
- Unlimited Students
- Unlimited Classes
- Unlimited Academic Sessions
- Unlimited Terms
- Unlimited Programme Components
- Unlimited Curriculum Units
- Unlimited Topics
- Unlimited Projects
- Unlimited Assessments
- Unlimited Reports
- Unlimited CBT Questions

The platform shall support horizontal scaling as usage grows.

---

# 47. Future Enhancements

The architecture shall support future modules without major redesign.

Planned future modules include:

- Parent Portal
- Student Portal
- Mobile Applications
- Learning Management System (LMS)
- AI Teaching Assistant
- Online Assignments
- School Fees
- Payroll
- Inventory Management
- Human Resources
- Timetable
- WhatsApp Integration
- SMS Integration
- Payment Gateway
- Digital Certificates
- Badge System

---

# 48. Success Criteria

The project shall be considered successful when it:

- Eliminates manual report preparation.
- Supports multiple schools from a single platform.
- Generates pixel-perfect reports.
- Produces configurable curriculum documents.
- Supports configurable programme components.
- Enables secure remote collaboration.
- Reduces report preparation time by at least 90%.
- Provides comprehensive audit logging.
- Supports CBT examinations.
- Operates reliably in production.

---

# 49. Assumptions

The following assumptions apply to Version 1.0:

- Users have internet access.
- Modern web browsers are available.
- Schools provide accurate student information.
- Administrators configure curriculum before assessment begins.
- Reports follow the approved Nobletech report format.

---

# 50. Constraints

Version 1.0 is limited to:

- Web Application
- English Language
- REST API
- Cloud Deployment

Native mobile applications are outside the scope of Version 1.0.

---

# 50.1 Phase 1.1 Identity Alignment

The platform shall support pupil and student accounts without mandatory personal email addresses.

Identity rules:

- A permanent internal student_id shall remain immutable across class, term, session, branch, and programme changes.
- student_number shall be treated as an academic or school reference and may vary by policy.
- username shall be treated as a login identifier.
- email shall be optional for pupil and student accounts.
- A system-generated username may serve as the learner's permanent login identifier.
- Username updates shall be restricted to authorized administrators, fully logged, and auditable.
- Usernames must not be silently reused for another learner.
- Learners may add an email address later without changing permanent identity.
- Parent or guardian contact details remain separate from learner login credentials.
- Initial passwords may be system-generated and must be changed at first login.
- Password reset and recovery shall not depend only on pupil email.
- Account recovery may use school administrator verification, guardian verification, recovery code, or another approved method.
- Learners shall only access data assigned to their own account and enrollment context.

Recommended permanent username format:

- SCHCODE-YEAR-SEQUENCE

Example:

- IDEA-2026-000123

This format is preferred for privacy, predictable uniqueness, readability, and long-term operational stability.

---

# 50.2 Phase 1.1 Curriculum Concept Alignment

The approved hierarchy remains:

Programme Component -> Curriculum -> Curriculum Unit -> Topic -> Project -> Learning Outcome

Educational term definitions:

- Curriculum: full instructional plan for an assigned academic context.
- Curriculum Unit: major structured body of learning under a programme component.
- Topic: lesson-level area delivered in a teaching period.
- Concept: reusable instructional idea taught within one or more topics.
- Subtopic: optional decomposition of a topic for pacing and lesson sequencing.
- Skill: demonstrable ability developed through instruction and practice.
- Learning Outcome: expected measurable result after instruction.
- Project: practical artifact-based application activity.
- Activity: bounded classroom, lab, or homework task.

Concept modelling recommendation for future implementation:

- Concept should be represented as a reusable educational entity linked many-to-many with Topics.
- Topic remains the delivery anchor and may teach multiple concepts.
- Skills and Learning Outcomes continue as distinct measurable constructs rather than replacements for concepts.

---

# 50.3 Phase 1.1 External Learning Resource Alignment

The platform shall support approved external learning platforms including Code.org, Tinkercad, Scratch, MIT App Inventor, MakeCode, VEXcode VR, Canva, Blockly Games, Wokwi, and future approved platforms.

Supported launch modes:

- EMBEDDED
- NEW_TAB
- SAME_WINDOW
- INTERNAL_RESOURCE

Policy rules:

- Activities must start from the learner dashboard within NEMP.
- Embedded mode is attempted only when external platform policies permit it.
- NEMP must not bypass external security restrictions.
- If embedding is blocked, launch must fall back to secure NEW_TAB behavior.
- External links must use HTTPS unless an authorized exception is explicitly approved and logged.
- Only approved and active external resources may be visible to learners.
- Broken, outdated, or unsafe links must be reviewable and deactivatable.
- Third-party credentials, class codes, or join codes must be protected and never stored in plain text.

Clarification:

"Without leaving the Nobletech website" means learners initiate access from NEMP and may continue in an embedded view where allowed; it does not guarantee embedding for platforms that prohibit iframe usage.

---

# 50.4 Phase 1.1 One-Page End-of-Term Result Alignment

The platform shall provide a concise one-page end-of-term report for STEAM, Coding, and Robotics contexts.

Layout rules:

- Default format: A4 Portrait.
- A4 Landscape is permitted only for approved school-specific templates.
- Report content must remain one page under normal conditions.
- Long text must be summarized using configurable maximum lengths.
- Repeated topics should be grouped where possible.
- Untaught programme components may be hidden.
- Learning outcomes, projects, scores, and comments must receive highest priority.
- Preview must be available before approval and PDF generation.
- The system must warn administrators when content risks exceeding one page.
- Published reports remain immutable; corrections create a revised report version.

Report workflow remains:

Student Assessment -> Teacher Entry -> Review -> Approval -> PDF Generation -> Archive

Curriculum publication status must remain separate from student report approval status.

---

# 50.5 Phase 1.1 Student Dashboard Curriculum Visibility Alignment

The learner dashboard should show assigned curriculum, current lesson context, topic, concepts being learned, learning objectives, teacher instructions, internal material, external activity action, assignment, project, submission status, assessment status, feedback, and progress.

Visibility control rules:

- Learners may only view content assigned to their school, class, term, session, and programme scope.
- GENERATED_DRAFT, DRAFT, UNDER_REVIEW, REVISION_REQUIRED, and unpublished resources must never be shown to learners.
- Only approved and published curriculum content and approved resources are visible on learner views.

---

# 50.6 Phase 1.1 Curriculum Source Subject Expansion

Curriculum source and integration domains now include:

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

These are integration/source domains and must not be interpreted as compulsory standalone NEMP subjects by default.

---

# 51. Glossary

| Term | Description |
|------|-------------|
| Programme Component | A configurable area of study such as Coding, Robotics, AI, or Python. |
| Curriculum Unit | A major instructional unit within a Programme Component. |
| Topic | A lesson or subject taught within a Curriculum Unit. |
| Project | A practical activity completed by students. |
| Learning Outcome | The expected knowledge or skill gained after instruction. |
| Report Engine | The module responsible for generating dynamic report cards. |
| CBT | Computer-Based Testing. |
| RBAC | Role-Based Access Control. |
| Multi-Tenant | A single platform serving multiple independent schools securely. |

---

# 52. Acceptance Criteria

The platform shall be accepted when:

- All functional requirements have been implemented.
- All critical defects have been resolved.
- User Acceptance Testing (UAT) has been completed successfully.
- PDF reports match the approved Nobletech templates.
- Curriculum management functions correctly.
- Dynamic Programme Components function as designed.
- Security testing has passed.
- Performance requirements have been achieved.
- Documentation has been completed and approved.

---

# Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Owner | Nobletech Academy | | |
| System Architect | | | |
| Lead Developer | | | |
| Quality Assurance | | | |

---

## Phase 2H Update: Curriculum Backend Foundation

- Added backend-only curriculum authoring foundation endpoints for manual workflow actions.
- Enforced explicit lifecycle action endpoints for submit, review, approve, publish, and archive.
- Preserved multi-tenant school isolation and permission-gated access controls for protected operations.
- Added audit trail capture for curriculum lifecycle and structure mutations.
- Deferred AI-assisted curriculum generation and regeneration features to later milestones.

**End of Document**