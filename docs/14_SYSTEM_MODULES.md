## Phase 2G Module Scope

- Added database module foundation for operational curriculum lifecycle, versioning, review trail, visibility, and assignment.
- Added verification script: `backend/src/scripts/phase2g-curriculum-constraints-check.ts`.
- Deferred boundary: AI-assisted curriculum generation and AI-authoring automation remain out of scope for Phase 2G.

## Phase 2I Module Scope Update

- Added frontend module foundation for Curriculum Authoring and Review Administrative Portal.
- Delivered route-level pages for curriculum dashboard, list, create, detail, edit, structure, review, versions, assignments, and archive flows.
- Added shared frontend module primitives: auth session context, permission gate, typed curriculum API client, notification tray, lifecycle status badge, and workflow data states.
- Added initial frontend test coverage for administrative route rendering and permission denial scenarios.
- Deferred boundary retained: AI-assisted authoring or regeneration interfaces are not included.

# Nobletech Education Management Platform (NEMP)

## System Modules

Version: 1.0

---

# Purpose

This document defines every module that makes up the Nobletech Education Management Platform.

Each module is designed as an independent component that can evolve without affecting the rest of the platform.

---

# Module 1

Dashboard

Purpose

Provides an overview of activities.

Features

• Statistics

• Recent Reports

• Pending Approvals

• Quick Actions

• Notifications

Users

Super Admin

School Administrator

Supervisor

Teacher

---

# Module 2

School Management

Purpose

Manage schools using the platform.

Features

Create School

Edit School

School Branding

School Settings

Academic Calendar

Status

Logo Upload

Primary Colour

Secondary Colour

Report Templates

---

# Module 3

User Management

Purpose

Manage system users.

Features

Create User

Edit User

Delete User

Reset Password

Assign Role

Assign School

Activate

Deactivate

---

# Module 4

Role & Permission Management

Purpose

Control access.

Roles

Super Admin

School Admin

Supervisor

Teacher

Data Entry Officer

Viewer

Future

Parent

Student

---

# Module 5

Teacher Management

Purpose

Manage instructors.

Features

Teacher Profile

Signature

Qualifications

Assigned Schools

Assigned Classes

Attendance

Performance

---

# Module 6

Student Management

Purpose

Manage students.

Features

Student Registration

Admission Number

Photo

Parent Information

Promotion History

Current Class

Current Session

Status

---

# Module 7

Academic Management

Purpose

Manage academic structure.

Features

Sessions

Terms

Classes

Subjects

Class Teachers

Promotion

---

# Module 8

Assessment Templates

Purpose

Create assessment structures.

Features

Coding

Robotics

STEAM

ICT

AI

Future Subjects

---

# Module 9

Skill Management

Purpose

Create skill assessment lists.

Features

Coding Skills

Robotics Skills

STEAM Skills

Soft Skills

Future Skills

---

# Module 10

Project Evaluation

Purpose

Evaluate practical projects.

Features

Project Library

Scoring

Comments

Evidence Upload

---

# Module 11

Report Cards

Purpose

Generate reports.

Features

Draft

Approval

Revision

Lock

PDF

Print

Download

History

---

# Module 12

PDF Engine

Purpose

Generate professional reports.

Requirements

Pixel Perfect

A4

Portrait

Landscape

School Branding

Multiple Templates

Unlimited Pages

QR Code

Watermark

---

# Module 13

School Branding

Purpose

Customize each school's identity.

Features

Logo

Colours

Header

Footer

Signature

Stamp

Fonts

Background

---

# Module 14

Analytics

Purpose

Provide reports and insights.

Features

Performance Charts

Teacher Statistics

Student Progress

School Summary

Term Summary

---

# Module 15

Notification Centre

Purpose

Notify users.

Methods

Email

SMS

WhatsApp

Push Notification

Future

Mobile Notification

---

# Module 16

System Settings

Purpose

Configure platform-wide settings.

Features

Academic Settings

Backup

Security

Email

SMS

Storage

Audit

System Logs

---

# Module 17

Curriculum Lifecycle and Publishing Governance

Purpose

Control curriculum drafting, review, approval, publication, versioning, and archival with complete traceability.

Features

Curriculum Unit hierarchy management

Master-to-school derivation tracking

Generated Draft workflow

Review and revision cycle

Approval workflow

Publication workflow

Version history

Archive and restore controls

Audit trail integration

---

# Module 18

Learner Identity and Access

Purpose

Manage permanent learner identity, tenant-safe username login, administrator-controlled credential recovery, and strict learner data isolation.

Features

Permanent student identity mapping

System-generated learner username policy

Optional learner email model

Administrator password reset for learners

Recovery code and guardian-assisted recovery support

Username change audit tracking

---

# Module 19

External Learning Resource Launch

Purpose

Provide safe and policy-compliant launch of approved third-party learning activities from NEMP.

Features

Resource approval and activation controls

Launch mode control (EMBEDDED, NEW_TAB, SAME_WINDOW, INTERNAL_RESOURCE)

Embedding policy detection and fallback behavior

Assignment-aware and class-aware access validation

External launch logging and monitoring

---

# Module 20

Student Curriculum Dashboard

Purpose

Render learner-facing curriculum navigation with strict publication-state and assignment filtering.

Features

Assigned curriculum view

Current week and lesson context

Topic and concept visibility

Learning objective and teacher instruction display

Assignment, project, and progress status widgets

Assessment and feedback visibility

Approved-and-published content gating

---

# Future Modules

Parent Portal

Student Portal

Teacher Portal

Attendance

Assignments

Learning Management System

CBT Examination

Certificate Generator

Billing

Subscription

AI Assistant

AI Comment Generator

AI Performance Analysis

AI Lesson Planner

Competition Management

Mobile Application

API Integration

## Phase 2H Update: Backend Module Coverage

- Added curriculum module foundation components:
- middleware: request context, authentication, RBAC, request validation.
- repository: curriculum data aggregation and scoped loading.
- service: transactional authoring, versioning, lifecycle transitions, assignment actions, audit writes.
- controller/routes: explicit curriculum APIs with per-endpoint permission and validation guards.
