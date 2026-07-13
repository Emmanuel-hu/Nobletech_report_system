## Phase 2J.1 Workflow Completion

- Topic workflow: create, update, reorder, and delete topic entries within editable lifecycle states; week-number overlap is allowed and no fixed week cap is enforced.
- Concept workflow: search approved master concepts, link to topics, create and maintain adapted operational concepts, manage mapping metadata, and reorder mappings.
- Project workflow: create, update, delete draft projects, link or unlink multiple topics, and preserve unit-level ownership with explicit mapping tables.
- Project implementation workflow: create, update, delete, and reorder implementation variants with instructional and safety metadata.
- Learning outcome workflow: create operational outcomes, optional master linkage, topic/project mapping management, and duplicate-mapping prevention.
- Resource workflow: create, update, delete, and maintain metadata links for internal references and external URLs without file upload or launch behavior.
- Visibility workflow: full toggle coverage with optimistic concurrency token validation.
- Conflict workflow: version conflicts display explicit user-facing conflict state and require reload before retry.

## Phase 2J Workflow Additions

- Editor lookup workflow: on entry, load curriculum-scoped sessions, terms, classes, components, teachers, published versions, and approved master-library references.
- Assignment workflow hardening: select published version -> select session -> filter term choices -> validate date range -> create assignment.
- Version maintenance workflow: review version history metadata -> open snapshot preview -> create next draft from approved or published baseline.
- Structure maintenance workflow now supports explicit edit or unlink actions for concept mappings and topic/project or outcome links.
- Project delivery workflow now supports implementation variant creation, update, and draft-safe removal.

## Phase 2I Workflow Additions

- Administrative navigation flow: `Admin Dashboard -> Curriculum List -> Detail/Edit/Review/Versions/Assignments/Archive`.
- Metadata authoring flow: create curriculum -> edit metadata -> save draft with unsaved-change protection.
- Structure flow: unit creation and unit reorder foundation with topic and project visibility context.
- Review flow: submit for review -> request revision or approve -> publish approved version.
- Version flow: list stored versions -> choose left and right snapshots -> compare payloads.
- Assignment flow: create assignment scoped by version, session, term, class, and programme component -> activate/suspend/complete/archive.
- Archive flow: permission-gated archive action requiring explicit rationale.
- Deferred boundary: no AI generation/regeneration workflow is present in this phase.

## Phase 2G Workflow Additions

- Lifecycle flow: `GENERATED_DRAFT`/`DRAFT` -> `UNDER_REVIEW` -> `APPROVED` -> `PUBLISHED` -> `ARCHIVED`.
- Review and status transitions are persisted in `curriculum_review_actions` and `curriculum_status_history`.
- Publication requires approved metadata and immutable version snapshot metadata.
- Assignment flow uses immutable version references: each assignment stores `curriculum_id` + `curriculum_version_id` and academic scope fields (`session`, `term`, `class`, `school_programme_component`).
# Nobletech Report System (NRS)

# Workflows

Version: 1.0

---

# Purpose

This document defines how users interact with the system from login until report generation.

It serves as the operational guide for developers, testers, UI designers and GitHub Copilot.

---

# Main Workflow

Login

↓

Dashboard

↓

Select School

↓

Select Session

↓

Select Term

↓

Select Class

↓

Student List

↓

Open Student Report

↓

Enter Assessment

↓

Save Draft

↓

Submit Report

↓

Supervisor Review

↓

Approve Report

↓

Generate PDF

↓

Download

↓

Print

---

# Login Workflow

User enters

Username or Login ID

Password

↓

Authenticate

↓

Success

↓

Dashboard

If authentication fails

↓

Display error message

↓

Allow retry

---

# Learner Account Recovery Workflow

Learner cannot access account

↓

School Administrator Verification

OR

Guardian Verification

OR

Recovery Code Verification

↓

Administrator Resets Password

↓

System Issues Temporary Password

↓

Learner Login

↓

Mandatory Password Change

---

# School Selection Workflow

User selects school

↓

System loads

Logo

Colours

Template

Grading System

Subjects

Assessment Template

Learning Targets

Instructor Information

---

# Student Assessment Workflow

Teacher opens student report

↓

Enter Practical Score

↓

Select Coding Skills Rating

↓

Select Robotics Skills Rating

↓

Select STEAM Skills Rating

↓

Complete Project Evaluation

↓

Enter General Comment

↓

Save Draft

---

# Save Draft Workflow

Teacher clicks Save Draft

↓

System validates data

↓

Save progress

↓

Allow future editing

---

# Report Submission Workflow

Teacher clicks Submit

↓

Validation

↓

Check Required Fields

↓

Lock Draft

↓

Send to Supervisor

↓

Status becomes

Pending Approval

---

# Approval Workflow

Supervisor opens report

↓

Review

↓

Approve

OR

Reject

↓

If Approved

↓

Report Locked

↓

Generate PDF

↓

Ready for Download

---

# PDF Workflow

Approved Report

↓

Load School Branding

↓

Load Student Information

↓

Load Assessment Data

↓

Load Instructor Signature

↓

Render Report

↓

Generate PDF

↓

Store Copy

↓

Download

↓

Print

---

# One-Page End-of-Term Report Workflow

Approved Report Data

↓

Apply One-Page Template (A4 Portrait Default)

↓

Summarize Long Sections Using Configurable Limits

↓

Preview One-Page Layout

↓

Overflow Risk Check

↓

If Overflow Risk

↓

Warn Administrator and Require Layout Decision

↓

Generate PDF

↓

Archive Immutable Version

---

# Student Search Workflow

Search by

Name

Admission Number

Class

Parent Name

↓

Display Student List

↓

Open Report

---

# Multi-School Workflow

Super Admin

↓

View All Schools

↓

Select School

↓

Manage School

School Administrator

↓

Can only view assigned school

---

# User Management Workflow

Create User

↓

Assign Role

↓

Assign School

↓

Activate Account

↓

User Login

---

# School Branding Workflow

Admin uploads

Logo

↓

Upload Signature

↓

Choose Primary Colour

↓

Choose Secondary Colour

↓

Choose Report Template

↓

Save

↓

Apply to all Reports

---

# Bulk Student Import Workflow

Download Excel Template

↓

Complete Student Information

↓

Upload Excel

↓

Validate Data

↓

Import Students

↓

Display Import Summary

---

# Audit Workflow

Every action records

User

Action

Date

Time

IP Address

Affected Record

---

# Error Handling Workflow

Validation Error

↓

Display Friendly Message

↓

Highlight Incorrect Field

↓

Prevent Submission

---

# Curriculum Authoring Workflow

Select School

↓

Select Session

↓

Select Term

↓

Select Class

↓

Select Programme Component

↓

Load Master Curriculum Units (Optional)

↓

Generate or Create Curriculum

↓

Status: GENERATED_DRAFT

↓

Edit Curriculum Units, Topics, Projects, Learning Outcomes

↓

Convert to DRAFT

↓

Submit for Review

↓

Status: UNDER_REVIEW

↓

Approve OR Request Revision

↓

Status: APPROVED or REVISION_REQUIRED

↓

Publish Approved Version

↓

Status: PUBLISHED

↓

Assign to Classes and Reports

---

# Curriculum Governance Workflow

Generated content cannot be published directly.

Approval and publication are separate workflow actions.

Published curricula are immutable.

Any correction after publication requires creating a new DRAFT version from the published baseline.

Every status transition must write an audit trail entry with actor, timestamp, tenant, and change summary.

---

# External Learning Resource Launch Workflow

Learner opens assigned lesson from dashboard

↓

System validates assignment, class, term, and publication status

↓

System validates resource approval and active status

↓

Determine launch mode

↓

Attempt EMBEDDED where allowed

↓

If embedding blocked by platform policy

↓

Open secure NEW_TAB fallback

↓

Log launch event

---

# Learner Dashboard Content Workflow

Learner Login

↓

Load assigned school, class, session, term, programme context

↓

Filter content by APPROVED and PUBLISHED status

↓

Hide GENERATED_DRAFT, DRAFT, UNDER_REVIEW, REVISION_REQUIRED, and unpublished items

↓

Render learner dashboard curriculum navigation

---

# Future Workflows

Parent Portal

Student Portal

CBT

Certificate Generation

Online Payment

AI Report Assistant

## Phase 2H Update: Curriculum Authoring Workflow

1. Author creates draft curriculum in school scope.
2. Author edits curriculum structure (units, topics, concepts, projects, outcomes, resources).
3. Author snapshots/version-controls draft for review readiness.
4. Reviewer executes explicit review actions (request revision or approve).
5. Publisher executes publish action after approval checks.
6. Assignment owner assigns published version and manages explicit assignment lifecycle actions.

Mobile Application
