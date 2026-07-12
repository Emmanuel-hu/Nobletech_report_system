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

Mobile Application
