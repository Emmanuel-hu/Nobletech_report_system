## Phase 2J.1 UI/UX Completion Update

- Added complete curriculum structure editing surfaces for topics, concepts, projects, implementations, learning outcomes, resources, and visibility settings in the existing admin architecture.
- Added explicit UI states for loading, empty, saving, saved, validation error, permission denied, read-only lifecycle, and concurrency conflict (with reload-latest action).
- Added keyboard-accessible reorder controls using explicit action buttons and meaningful labels.
- Added lineage labeling in mapping views to distinguish approved master references from adapted operational content.
- Accessibility posture retained: form labels, actionable button text, ARIA-compatible expandable sections, and status feedback not relying on color alone.

## Phase 2K.2 UI/UX Completion Update

- Added master-content administration routes and screens for dashboard, entity administration, and review queue.
- Added per-entity administrative surfaces with list/search/filter/pagination and create-draft workflows.
- Added explicit lifecycle action controls for submit-review, request-revision, approve, and archive, gated by permission checks.
- Added UI ownership visibility markers for global versus school-scoped records.
- Added UI data states for loading, empty, retryable error, and mutation feedback notifications.
- Added navigation integration inside the existing admin layout without changing established information architecture.
- Retained separation of frontend UX gating from backend authorization; backend remains the final authority.
- Deferred boundary retained: no AI extraction, OCR, source-file upload, or AI generation UI controls were introduced.

## Phase 2L UI/UX Foundation Update

- Added curriculum source file-management controls within the existing source administration surface for upload, replace, primary-file selection, reorder, archive, delete, download, and preview actions.
- Added file list visibility for lifecycle state, primary designation, and per-source file count.
- Preserved milestone boundary: metadata-edit, scan-review, unlink, and purge administrative surfaces remain backend-ready but not expanded into a separate dedicated frontend workflow in this pass.

## Phase 2J UI/UX Hardening Update

- Assignment forms now use API-provided lookup selections for sessions, terms, classes, programme components, and teachers.
- Term options are context-filtered by selected academic session to reduce scope mismatch errors.
- Assignment creation is explicitly gated to published curriculum versions, with empty-state guidance when none exist.
- Effective date-range controls enforce `effectiveTo >= effectiveFrom` in the UX layer before submission.
- Version comparison surfaces structured, sectioned differences (metadata, units, topics, concepts, projects, implementations, outcomes, resources, visibility).
- Version history includes snapshot-preview interaction and draft-version creation controls aligned to lifecycle constraints.

## Phase 2I UI Foundation Update

- Added administrative curriculum portal layout with responsive sidebar navigation and content workspace.
- Added explicit status badges that combine text and symbol markers so lifecycle states are not color-only.
- Added standardized loading, empty, and retryable error states for API-driven views.
- Added transient notification tray for action feedback on save, review, publish, assignment, and archive operations.
- Added unsaved-change guard for curriculum metadata authoring forms.
- Preserved manual authoring workflow focus; no AI generation controls are exposed in this phase.

# Nobletech Education Management Platform (NEMP)

# UI / UX Design Guide

Version: 1.0

Document Status: Approved

Last Updated: July 2026

---

# Purpose

This document defines the user interface (UI) and user experience (UX) standards for the Nobletech Education Management Platform (NEMP).

It ensures that every page, module, form, button, table, and workflow follows a consistent design throughout the system.

---

# Design Philosophy

The system should be:

- Simple
- Modern
- Professional
- Fast
- Responsive
- Easy to use
- Accessible
- Mobile Friendly
- Tablet Friendly

Teachers should be able to complete report entry quickly with minimal training.

---

# Design Principles

1. Keep the interface clean.

2. Reduce unnecessary clicks.

3. Make important actions obvious.

4. Group related information together.

5. Use colours consistently.

6. Provide immediate feedback.

7. Prevent user mistakes.

8. Design for speed.

---

# Colour System

The application should support two colour levels.

## Platform Colours

Primary Colour

Blue

Secondary Colour

White

Accent Colour

Light Grey

Success

Green

Warning

Orange

Danger

Red

Information

Sky Blue

---

## School Branding Colours

Each school should have its own:

Primary Colour

Secondary Colour

Accent Colour

These colours should automatically appear on:

Dashboard

Headers

Buttons

PDF Reports

Login Screen

Menus

Tables

Charts

---

# Typography

Primary Font

Inter

Alternative

Roboto

Font Sizes

Heading 1

32px

Heading 2

24px

Heading 3

20px

Body

16px

Small Text

14px

---

# Icons

Use modern icons.

Recommended

Heroicons

or

Lucide Icons

Icons should be consistent throughout the application.

---

# Layout

Top Navigation Bar

↓

Left Sidebar

↓

Main Content Area

↓

Footer

---

# Sidebar Menu

Dashboard

Schools

Users

Teachers

Students

Academic

Reports

Templates

Analytics

Settings

Logout

---

# Dashboard Design

Dashboard should display

School Statistics

Student Count

Teacher Count

Pending Reports

Approved Reports

Recent Activities

Quick Actions

Charts

Notifications

---

# Forms

Every form should include

Clear Labels

Placeholder Text

Validation

Required Field Indicator

Save Button

Cancel Button

Back Button

Success Message

Error Message

---

# Tables

Every table should support

Search

Sorting

Pagination

Filtering

Export

Print

Responsive Layout

---

# Buttons

Primary Button

Save

Secondary Button

Cancel

Danger Button

Delete

Success Button

Approve

Warning Button

Archive

Info Button

View

---

# Modal Windows

Use modal windows for

Delete Confirmation

Approval

Quick Edit

Notifications

Preview

---

# Notifications

Display

Success Messages

Warning Messages

Error Messages

Information Messages

Loading Indicators

---

# Search Experience

Support searching by

Student Name

Admission Number

Class

School

Teacher

Session

Term

---

# User Experience Standards

Maximum of three clicks to reach any major feature.

Never lose unsaved data.

Warn users before deleting.

Auto-save drafts where applicable.

Display loading indicators during long operations.

---

# Responsive Design

Desktop

Full Layout

Tablet

Responsive Layout

Mobile

Optimized Layout

---

# Accessibility

High colour contrast.

Keyboard navigation.

Screen reader support.

Readable font sizes.

Large clickable buttons.

---

# Report Entry Screen

The report entry screen should display:

Student Information

Assessment Form

Skills Assessment

Project Evaluation

Teacher Comment

Save Draft

Submit

Generate PDF

Next Student

Previous Student

---

# Dashboard Widgets

Recent Reports

Pending Approval

Student Statistics

Performance Charts

Quick Links

Notifications

Calendar

---

# Error Pages

403

Unauthorized

404

Page Not Found

500

Server Error

Maintenance Page

---

# Loading Experience

Skeleton loaders

Progress bars

Loading spinners

Success animations

---

# Future Enhancements

Dark Mode

Multiple Themes

High Contrast Mode

Voice Navigation

Offline Support

Mobile Application

Touch Screen Optimization

AI Assistant

---

# UI Consistency Rules

Every page must have:

Page Title

Breadcrumb Navigation

Action Buttons

Search (where applicable)

Filter (where applicable)

Responsive Design

Consistent Spacing

Consistent Colours

Consistent Fonts

Consistent Icons

---

# Acceptance Criteria

The UI is considered complete when:

- All pages follow the design system.
- Branding is applied automatically.
- The interface is responsive.
- Navigation is consistent.
- Forms are user-friendly.
- Tables are interactive.
- Accessibility standards are met.
- Users can complete tasks efficiently.

---

# Learner Dashboard UX Rules

The learner dashboard should present:

- Assigned Curriculum
- Current Week or Lesson
- Topic
- Concepts Being Learned
- Learning Objectives
- Teacher Instructions
- Internal Learning Material
- External Activity Action
- Assignment and Project
- Submission Status
- Assessment Status
- Feedback
- Progress Summary

Visibility must be policy-driven:

- Show only content assigned to the learner's school, class, term, session, and programme context.
- Show only approved and published curriculum content.
- Never show generated drafts, review-stage records, or unpublished resources.

---

# External Resource Launch UX Rules

The launch control should support:

- EMBEDDED
- NEW_TAB
- SAME_WINDOW
- INTERNAL_RESOURCE

UX behavior rules:

- Start all activity launches from the NEMP learner dashboard.
- Attempt embedded rendering only when target platform permits embedding.
- If embedding is blocked, provide secure NEW_TAB fallback with clear learner messaging.
- Display platform name, resource title, and safety note before launch when configured.

---

# One-Page Report UX Rules

End-of-term one-page report UI should support:

- A4 Portrait default template
- A4 Landscape only for approved school template variants
- Real-time preview before approval and PDF generation
- Overflow warning if content threatens one-page layout
- Configurable truncation and summarization rules for long comments and long topic lists
- Grouping of repeated topics where configured

The UI must not silently spill content beyond one page in the one-page report mode.