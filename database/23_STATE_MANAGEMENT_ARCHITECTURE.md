# Nobletech Education Management Platform (NEMP)

# 23_STATE_MANAGEMENT_ARCHITECTURE

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | State Management Architecture |
| Document Code | NEMP-DEV-SMA-023 |
| Version | 1.0 |
| Status | Approved |
| Frontend Framework | React.js |
| Language | TypeScript |
| Client State | Zustand |
| Server State | TanStack Query |

---

# Purpose

This document defines the enterprise State Management Architecture for the Nobletech Education Management Platform (NEMP).

State Management is responsible for controlling how data is stored, retrieved, synchronized, cached, updated, and shared throughout the application.

A properly designed state management architecture ensures that every module behaves consistently, minimizes unnecessary API requests, improves performance, simplifies debugging, and provides a predictable user experience.

This document establishes the official standards for managing both client-side and server-side state across all frontend applications.

---

# Objectives

The State Management Architecture has the following objectives:

- Centralize application state management.
- Clearly separate client state from server state.
- Improve application performance.
- Eliminate duplicated state.
- Reduce unnecessary API requests.
- Support background synchronization.
- Simplify debugging and maintenance.
- Provide predictable state updates.
- Support optimistic UI updates.
- Improve offline readiness.
- Standardize state management across all modules.
- Support future mobile applications.

---

# State Management Philosophy

NEMP follows the principle:

> **"Store data only where it naturally belongs."**

Different categories of data require different storage mechanisms.

For example:

- User authentication belongs in global state.
- Student records belong in server state.
- Form inputs belong in local component state.
- UI preferences belong in client state.
- Cached reports belong in server cache.

Following this philosophy prevents duplicated data, synchronization problems, and unnecessary complexity.

---

# State Management Architecture Overview

The application uses a layered state architecture.

```text
User Interaction

↓

Component State

↓

Client State (Zustand)

↓

Server State (TanStack Query)

↓

REST API

↓

Backend

↓

Database
```

Each layer has clearly defined responsibilities.

---

# State Categories

NEMP recognizes four primary categories of application state.

---

## 1. Local Component State

Managed directly within React components.

Examples

- Form Inputs
- Dialog Visibility
- Selected Tab
- Current Step
- Expanded Accordion
- Search Input
- Temporary Validation Errors

Local state should never be shared between unrelated components.

---

## 2. Global Client State

Managed using Zustand.

Examples

- Logged-in User
- School Context
- Theme
- Sidebar State
- Selected Academic Session
- Selected Academic Term
- User Preferences
- Notification Count

Global client state is shared across the application.

---

## 3. Server State

Managed using TanStack Query.

Examples

- Students
- Teachers
- Curriculum
- Assessments
- Reports
- Certificates
- Analytics
- Notifications

Server state is owned by the backend and synchronized with the frontend.

---

## 4. Persistent State

Certain client-side data may be persisted between sessions.

Examples

- Selected Theme
- Sidebar Collapse State
- Language Preference
- Last Selected School
- Dashboard Preferences

Persistent state should never contain sensitive information.

---

# State Management Principles

The following principles govern all state management within NEMP.

---

## Single Source of Truth

Every piece of information should exist in only one authoritative location.

Examples

User Authentication

↓

Authentication Store

Student Records

↓

Server Cache

Theme

↓

Theme Store

This eliminates conflicting data.

---

## Minimal State

Only store what is necessary.

Avoid storing values that can be derived from existing state.

Example

Store:

Student List

Do NOT Store:

Total Students

Instead compute:

```text
students.length
```

---

## Predictable Updates

Every state change should follow a consistent update pattern.

State should never change unexpectedly.

---

## Immutable Updates

State must never be mutated directly.

Every update creates a new immutable state.

This improves debugging and enables React optimizations.

---

## Separation of Concerns

Different categories of state should never be mixed.

Examples

Authentication

↓

Authentication Store

Reports

↓

TanStack Query

Theme

↓

Theme Store

---

## Performance First

State should minimize unnecessary rendering.

Strategies include:

- Memoization
- Selective subscriptions
- Query caching
- Lazy loading
- Optimistic updates

---

## Scalability

State architecture must support:

- Additional modules
- New user roles
- Mobile applications
- Offline support
- Multi-school environments

---

# Technology Stack

| Responsibility | Technology |
|---------------|------------|
| Local Component State | React Hooks |
| Global Client State | Zustand |
| Server State | TanStack Query |
| Form State | React Hook Form |
| Validation | Zod |
| API Communication | Axios |
| Persistent Storage | Local Storage (Non-sensitive Preferences Only) |

---

# Data Flow Architecture

The following diagram illustrates how data flows through the application.

```text
User Action

↓

React Component

↓

Custom Hook

↓

State Store / Query

↓

API Service

↓

REST API

↓

Backend

↓

Database

↓

API Response

↓

Query Cache

↓

State Update

↓

UI Re-render
```

Every request follows this standardized lifecycle.

---

# Frontend State Folder Structure

```text
src/

├── store/
│   ├── auth.store.ts
│   ├── user.store.ts
│   ├── school.store.ts
│   ├── theme.store.ts
│   ├── sidebar.store.ts
│   ├── session.store.ts
│   ├── notification.store.ts
│   ├── settings.store.ts
│   └── index.ts
│
├── hooks/
│
├── services/
│
├── queries/
│
├── mutations/
│
├── providers/
│
└── contexts/
```

Each folder serves a distinct purpose.

---

# Responsibilities of Each Layer

| Layer | Responsibility |
|---------|----------------|
| React Component | Display UI |
| Local State | Temporary UI State |
| Zustand Store | Global Client State |
| TanStack Query | Server State |
| API Service | Backend Communication |
| Backend | Business Logic |
| Database | Persistent Storage |

Each layer should remain focused on its assigned responsibility.

---

# State Ownership

Every state object has a defined owner.

| State | Owner |
|---------|-------|
| Authentication | Authentication Store |
| User Profile | User Store |
| Theme | Theme Store |
| Sidebar | Sidebar Store |
| Students | TanStack Query |
| Teachers | TanStack Query |
| Reports | TanStack Query |
| Assessments | TanStack Query |
| Curriculum | TanStack Query |
| Dashboard Statistics | TanStack Query |

Ownership should never be duplicated.

---

# State Lifecycle

Application state follows a predictable lifecycle.

```text
Create

↓

Read

↓

Update

↓

Synchronize

↓

Persist (Where Applicable)

↓

Destroy
```

State transitions should remain consistent across all modules.

---

# Design Goals

The NEMP State Management Architecture has been designed to provide:

- High Performance
- Predictable Behaviour
- Modular Development
- Easy Testing
- Reduced API Traffic
- Better User Experience
- Improved Scalability
- AI-Friendly Development
- Long-Term Maintainability

---

# End of Part 1

# Client State Management

The NEMP frontend uses **Zustand** for global client-side state management.

Client state refers to information that belongs to the browser application rather than the backend server.

This includes interface settings, selected context, session information, user preferences, and temporary application-wide behaviour.

---

# Zustand Store Architecture

Each store must manage one clearly defined area of client state.

Stores should remain small, focused, and easy to test.

---

# Standard Store Structure

Each Zustand store should follow this pattern:

```text
store/

├── auth.store.ts
├── user.store.ts
├── school.store.ts
├── theme.store.ts
├── sidebar.store.ts
├── session.store.ts
├── notification.store.ts
├── settings.store.ts
└── index.ts
```

---

# Authentication Store

## Purpose

Stores authentication-related client state.

---

## Responsibilities

- Store authentication status
- Store access token metadata
- Track login state
- Track session expiration
- Trigger logout
- Clear sensitive state on logout

---

## State Examples

```text
isAuthenticated

accessToken

refreshToken

expiresAt

sessionExpired

```

---

## Business Rules

- Authentication state must be cleared on logout.
- Expired sessions must redirect users to the login page.
- Sensitive information must not be stored unnecessarily.
- Token handling must follow security standards.

---

# User Store

## Purpose

Stores authenticated user information required by the frontend.

---

## Responsibilities

- Store user profile
- Store user roles
- Store user permissions
- Store user preference summary
- Support role-based UI rendering

---

## State Examples

```text
user

roles

permissions

profile

```

---

## Business Rules

- User data must be refreshed after login.
- Permission changes should trigger UI refresh.
- User profile data should not duplicate server state unnecessarily.

---

# School Store

## Purpose

Stores current school context.

This is essential because NEMP is a multi-tenant platform.

---

## Responsibilities

- Store current school
- Store school branding
- Store active school settings
- Store school subscription status
- Support tenant-aware UI rendering

---

## State Examples

```text
currentSchool

schoolBranding

schoolSettings

subscriptionStatus

```

---

## Business Rules

- School context must be loaded after authentication.
- School branding must apply immediately after loading.
- Users must never switch into unauthorized school contexts.
- Super Administrators may select from multiple schools where permitted.

---

# Academic Session Store

## Purpose

Stores currently selected academic session and term.

---

## Responsibilities

- Store active academic session
- Store active term
- Support switching between sessions
- Provide session context to modules

---

## State Examples

```text
activeSession

activeTerm

availableSessions

availableTerms

```

---

## Business Rules

- Session context must be available before loading academic data.
- Changing session or term should invalidate related queries.
- Reports, assessments, attendance, and curriculum must respect active session and term.

---

# Theme Store

## Purpose

Stores the active user interface theme.

---

## Responsibilities

- Store selected theme
- Apply theme to the application
- Support school branding colours
- Persist non-sensitive theme settings

---

## Supported Themes

```text
Light

Dark

System

```

Future:

```text
High Contrast

School Theme

Accessibility Theme

```

---

## Business Rules

- Theme changes must apply immediately.
- Theme preference may be persisted locally.
- School branding may override default colour values.
- Theme state must not contain sensitive data.

---

# Sidebar Store

## Purpose

Stores sidebar and navigation state.

---

## Responsibilities

- Track sidebar open/closed state
- Track collapsed state
- Track active navigation item
- Support mobile sidebar behaviour

---

## State Examples

```text
isSidebarOpen

isSidebarCollapsed

activeMenuItem

```

---

## Business Rules

- Sidebar preference may be persisted.
- Sidebar behaviour must respond to screen size.
- Navigation items must respect user permissions.

---

# Notification Store

## Purpose

Stores frontend notification state.

---

## Responsibilities

- Store unread notification count
- Store recent notifications
- Control notification drawer visibility
- Update notification badges

---

## State Examples

```text
unreadCount

recentNotifications

isNotificationDrawerOpen

```

---

## Business Rules

- Notification count must synchronize with backend notifications.
- Read notifications should update UI immediately.
- Critical notifications should remain visible until acknowledged.

---

# Settings Store

## Purpose

Stores user interface preferences and application settings.

---

## Responsibilities

- Store dashboard preferences
- Store table preferences
- Store language preference
- Store display preferences
- Store accessibility preferences

---

## State Examples

```text
language

dashboardLayout

tableDensity

accessibilitySettings

```

---

## Business Rules

- Non-sensitive preferences may be persisted.
- Settings should synchronize with user preferences where available.
- Accessibility preferences must apply globally.

---

# Modal and UI State

Temporary modal, drawer, and popover state should generally remain local to components.

Global UI state should only be used when:

- Multiple components need access.
- The state affects the whole application.
- The state must persist across routes.

Examples of acceptable global UI state:

```text
globalCommandPaletteOpen

notificationDrawerOpen

sessionTimeoutWarningVisible

```

---

# Persistence Strategy

Only non-sensitive client state may be persisted.

Persistable State

- Theme
- Sidebar Preference
- Language
- Dashboard Layout
- Table Density

Non-Persistable State

- Passwords
- Raw Tokens where avoidable
- Sensitive Student Data
- Assessment Answers
- Report Data
- Personal Confidential Records

---

# Store Naming Standards

All store files should follow this pattern:

```text
auth.store.ts

school.store.ts

theme.store.ts

sidebar.store.ts

notification.store.ts

```

Store hooks should follow this pattern:

```text
useAuthStore

useSchoolStore

useThemeStore

useSidebarStore

useNotificationStore

```

---

# Store Design Standards

Every Zustand store should contain:

- State
- Actions
- Reset Method
- Optional Selectors
- TypeScript Interfaces

Example structure:

```text
State

Actions

Selectors

Reset

```

---

# Store Reset Strategy

All stores must provide a reset function.

This is required for:

- Logout
- School switching
- Session expiration
- Permission changes
- Account lockout

When a user logs out, all sensitive stores must reset immediately.

---

# Cross-Store Communication

Stores should avoid directly depending on one another.

Where coordination is required, use:

- Services
- Hooks
- Event-based triggers
- Controlled reset functions

This prevents circular dependencies and improves maintainability.

---

# Client State Business Rules

- Use Zustand only for global client state.
- Do not store backend-owned data in Zustand.
- Do not duplicate TanStack Query data in Zustand.
- Persist only safe, non-sensitive preferences.
- Reset sensitive stores on logout.
- Keep stores small and focused.
- Use selectors to prevent unnecessary re-renders.
- Never place business rules inside UI components.
- School and session context must be available before loading school-specific data.

---

# End of Part 2

# Server State Management

The NEMP frontend uses **TanStack Query** to manage all server-side state.

Server state refers to data that originates from the backend and is synchronized with the frontend.

Unlike client state, server state belongs to the backend and should never be duplicated inside Zustand stores.

TanStack Query provides intelligent caching, automatic synchronization, optimistic updates, background refetching, pagination, and request deduplication.

---

# Server State Architecture

The server state architecture follows the workflow below.

```text
React Component

↓

Custom Hook

↓

TanStack Query

↓

API Service

↓

REST API

↓

Backend

↓

Database

↓

API Response

↓

Query Cache

↓

UI Re-render
```

TanStack Query acts as the single source of truth for all backend-managed data displayed by the frontend.

---

# Responsibilities of TanStack Query

TanStack Query is responsible for:

- Fetching server data
- Caching API responses
- Synchronizing backend updates
- Background refetching
- Request deduplication
- Automatic retries
- Optimistic updates
- Cache invalidation
- Pagination
- Infinite scrolling
- Offline synchronization (Future)

Business logic must remain in the backend.

---

# Query Organization

All queries should be organized by module.

```text
src/

queries/

├── auth/
├── students/
├── teachers/
├── schools/
├── curriculum/
├── assessments/
├── attendance/
├── reports/
├── certificates/
├── portfolios/
├── analytics/
├── notifications/
└── settings/
```

Each module manages its own queries independently.

---

# Query Key Standards

Every query must use standardized query keys.

Example structure

```text
['students']

['students', studentId]

['students', classId]

['teachers']

['reports']

['reports', reportId]

['assessments']

['dashboard']

['notifications']

['analytics']
```

Query keys should remain predictable and hierarchical.

---

# Query Naming Convention

Query hooks should follow this naming pattern.

Examples

```text
useStudents()

useStudent()

useTeachers()

useTeacher()

useReports()

useReport()

useAssessments()

useDashboard()

useNotifications()
```

Mutation hooks should follow:

```text
useCreateStudent()

useUpdateStudent()

useDeleteStudent()

useGenerateReport()

usePublishAssessment()

useApproveReport()
```

---

# Query Categories

The platform supports several categories of queries.

---

## Standard Queries

Retrieve collections.

Examples

```text
Students

Teachers

Schools

Reports

Assessments
```

---

## Detail Queries

Retrieve a single resource.

Examples

```text
Student Details

Teacher Profile

Assessment

Report

Certificate
```

---

## Paginated Queries

Support server-side pagination.

Examples

```text
Student List

Teacher List

Audit Logs

Notifications
```

---

## Infinite Queries

Used where continuous loading improves usability.

Examples

Future

- Activity Timeline
- Portfolio Timeline
- Notification History

---

## Dashboard Queries

Load summarized information.

Examples

- Dashboard Statistics
- Revenue
- Attendance
- Performance Trends

Dashboard queries should minimize network traffic by returning aggregated data.

---

# Cache Strategy

Caching is one of the most important responsibilities of TanStack Query.

---

## Cache Goals

- Reduce API traffic
- Improve application speed
- Improve responsiveness
- Reduce duplicate requests

---

## Cache Lifecycle

```text
API Request

↓

Response

↓

Cache

↓

UI

↓

Background Refresh

↓

Updated Cache

↓

Updated UI
```

---

## Cache Duration

Recommended cache durations.

| Data | Cache Duration |
|--------|---------------|
| School Settings | Long |
| User Profile | Medium |
| Dashboard Statistics | Short |
| Students | Medium |
| Reports | Medium |
| Notifications | Very Short |
| Analytics | Short |

Actual cache timing should remain configurable.

---

# Background Refetching

TanStack Query automatically refreshes stale data.

Examples

- Dashboard
- Notifications
- Student Lists
- Reports

Background refetching should never interrupt user interaction.

---

# Query Invalidation

Caches must be invalidated whenever backend data changes.

Examples

Student Created

↓

Invalidate Students Query

Assessment Published

↓

Invalidate Assessment Query

Report Generated

↓

Invalidate Report Query

Invalidation ensures users always see current data.

---

# Optimistic Updates

Certain operations should update the interface immediately before the server confirms success.

Examples

- Mark Notification Read
- Toggle Active Status
- Update Preferences
- Reorder Curriculum Topics

If the backend rejects the operation, the UI should roll back automatically.

---

# Mutation Workflow

```text
User Action

↓

Mutation

↓

Optimistic Update

↓

API Request

↓

Backend

↓

Success

↓

Cache Update

↓

UI Refresh
```

If an error occurs:

```text
Rollback

↓

Show Error

↓

Restore Previous State
```

---

# Prefetching Strategy

Frequently accessed data may be prefetched.

Examples

- Student Profile
- Report Preview
- Assessment Details
- Teacher Profile

Prefetching improves perceived performance.

---

# Pagination Strategy

Large datasets must use server-side pagination.

Examples

- Students
- Teachers
- Schools
- Reports
- Audit Logs

Pagination reduces bandwidth and improves rendering performance.

---

# Filtering Strategy

Filtering should occur on the server whenever datasets are large.

Supported filters

- Session
- Term
- Class
- Programme
- Status
- Teacher
- Date
- School

Filter state should synchronize with query keys.

---

# Sorting Strategy

Sorting should remain server-driven for large datasets.

Supported sorting

- Name
- Date
- Score
- Status
- Attendance
- Class

Sorting parameters should be reflected in the query key.

---

# Synchronization Strategy

Server state should remain synchronized with backend data.

Synchronization methods include:

- Query Invalidation
- Background Refetch
- Manual Refresh
- Polling (where appropriate)
- Future WebSocket Updates

---

# Error Recovery

TanStack Query should automatically retry transient failures.

Examples

- Temporary network interruption
- Server timeout
- Connection loss

Permanent failures should present user-friendly error messages.

---

# Loading Strategy

Each query should expose consistent loading states.

Examples

- Initial Loading
- Background Refresh
- Refetching
- Mutation Loading

Loading indicators should remain consistent throughout the application.

---

# Offline Strategy (Future)

Future versions may support limited offline operation.

Potential capabilities

- Cached Dashboard
- Cached Reports
- Cached Student Lists
- Draft Forms

Changes made offline should synchronize when connectivity returns.

---

# Server State Business Rules

- TanStack Query is the only source of truth for server-owned data.
- Never duplicate server data inside Zustand.
- Use standardized query keys.
- Always invalidate affected queries after successful mutations.
- Prefer optimistic updates only where rollback is safe.
- Use pagination for large datasets.
- Server-side filtering should be preferred over client-side filtering.
- Cache durations should match the volatility of the data.
- Background refetching should not disrupt user workflows.
- Every query and mutation must be implemented through the API Service Layer.

---

# End of Part 3
```

# Enterprise State Management Standards

This section defines the enterprise-wide standards governing state management throughout the Nobletech Education Management Platform (NEMP).

These standards ensure consistency, maintainability, scalability, security, and high performance across all current and future frontend applications.

---

# State Naming Standards

All state objects should use clear, descriptive, and predictable names.

## Store Naming

```text
auth.store.ts

user.store.ts

school.store.ts

theme.store.ts

sidebar.store.ts

notification.store.ts

session.store.ts

settings.store.ts
```

---

## Hook Naming

```text
useAuthStore()

useUserStore()

useSchoolStore()

useThemeStore()

useSidebarStore()

useSessionStore()

useNotificationStore()

useSettingsStore()
```

---

## Query Naming

```text
useStudents()

useStudent()

useTeachers()

useTeacher()

useReports()

useReport()

useAssessments()

useDashboard()

useNotifications()
```

---

## Mutation Naming

```text
useCreateStudent()

useUpdateStudent()

useDeleteStudent()

useCreateAssessment()

useGenerateReport()

usePublishReport()

useApproveAssessment()

useGenerateCertificate()
```

Naming consistency improves readability and AI-assisted code generation.

---

# Store Organization Standards

Every Zustand store should follow a consistent structure.

```text
State

↓

Actions

↓

Selectors

↓

Reset Functions

↓

Persistence Configuration (Optional)
```

A single store should manage only one business domain.

---

# State Ownership Rules

Every state object must have exactly one owner.

| State | Owner |
|---------|-------|
| Authentication | Authentication Store |
| User Profile | User Store |
| School Context | School Store |
| Academic Session | Session Store |
| Theme | Theme Store |
| Sidebar | Sidebar Store |
| Notifications | Notification Store |
| Students | TanStack Query |
| Teachers | TanStack Query |
| Reports | TanStack Query |
| Assessments | TanStack Query |
| Analytics | TanStack Query |

Duplicating ownership is prohibited.

---

# Cache Management Standards

Caching must be intentional and predictable.

## Cache Objectives

- Reduce API requests
- Improve responsiveness
- Improve scalability
- Reduce backend load
- Improve user experience

---

## Cache Strategy

### Long Cache

Suitable for data that rarely changes.

Examples

- School Settings
- Academic Structure
- User Permissions

---

### Medium Cache

Suitable for data that changes periodically.

Examples

- Student Lists
- Teacher Lists
- Curriculum
- Reports

---

### Short Cache

Suitable for frequently changing information.

Examples

- Dashboard Statistics
- Attendance
- Notifications
- Analytics

---

### Immediate Refresh

Suitable for real-time information.

Examples

- Active CBT Sessions
- Security Alerts
- Live Examination Monitoring

Future versions may use WebSockets for these scenarios.

---

# Query Invalidation Standards

Cache invalidation should occur automatically after successful mutations.

Examples

Student Created

↓

Invalidate Student List

Teacher Updated

↓

Invalidate Teacher Details

Assessment Published

↓

Invalidate Assessment Queries

Report Generated

↓

Invalidate Report Queries

Certificate Issued

↓

Invalidate Certificate Queries

Invalidation should be as granular as possible.

---

# Performance Optimization Standards

State management should minimize unnecessary rendering.

Strategies include:

- Selective Zustand subscriptions
- Memoized selectors
- Stable query keys
- Lazy loading
- Code splitting
- Virtualized tables
- Debounced search
- Background refetching
- Optimistic updates

Performance should be measured continuously.

---

# Persistence Strategy

Only non-sensitive information may be persisted locally.

---

## Safe to Persist

- Theme
- Language
- Sidebar State
- Dashboard Layout
- Table Density
- Accessibility Preferences
- Recently Selected School (when permitted)
- Last Active Academic Session

---

## Never Persist

- Passwords
- Authentication Secrets
- Raw Student Records
- Examination Answers
- Assessment Scores
- Medical Information
- Financial Information
- Confidential Reports

Sensitive data must always be retrieved securely from the backend.

---

# Session Management Standards

The frontend must monitor session validity continuously.

Supported behaviours

- Automatic Session Refresh
- Session Expiration Warning
- Automatic Logout
- Logout on Token Expiration
- Logout on Account Disable
- Logout on Password Reset
- Logout on School Access Revocation

Expired sessions must immediately clear sensitive client state.

---

# Multi-Tenant State Standards

NEMP is a multi-school platform.

Every server query must execute within the currently selected school context.

Examples

```text
Current School

↓

Student Query

↓

Backend Validation

↓

School Data Only
```

Client state must never expose information belonging to another school.

---

# State Synchronization Standards

Synchronization should occur automatically whenever backend data changes.

Supported methods include:

- Query Invalidation
- Background Refetch
- Manual Refresh
- Polling (where appropriate)
- Future WebSocket Synchronization

Users should rarely need to refresh pages manually.

---

# Error Recovery Standards

Every state operation should support graceful recovery.

Supported behaviours

- Retry
- Rollback
- Cache Recovery
- User Notification
- Background Retry

Permanent failures should display user-friendly messages.

---

# Offline Readiness (Future)

Future versions of NEMP may support offline operation.

Potential offline capabilities include:

- Draft Assessment Entry
- Draft Attendance
- Cached Reports
- Cached Student Lists
- Cached Curriculum
- Dashboard Snapshots

Offline changes should synchronize automatically when connectivity is restored.

---

# Testing Standards

State management must be fully testable.

Testing should cover:

- Store Actions
- Selectors
- Query Hooks
- Mutation Hooks
- Cache Invalidation
- Optimistic Updates
- Error Recovery
- Session Expiration
- State Persistence

Recommended tools

- Vitest
- React Testing Library
- Playwright

---

# Security Standards

State management must comply with NEMP security requirements.

Requirements include:

- No sensitive data in Local Storage
- Secure session handling
- Token expiration monitoring
- Permission-aware UI rendering
- Tenant-aware state isolation
- Automatic store reset on logout
- Secure API communication
- No exposure of backend implementation details

Security takes precedence over convenience.

---

# AI-Assisted Development Standards

NEMP is designed for AI-assisted software development.

When using GitHub Copilot or other AI coding assistants:

- Follow official store naming conventions.
- Use approved query keys.
- Never duplicate server state in Zustand.
- Separate client state from server state.
- Keep stores small and domain-focused.
- Use TypeScript interfaces.
- Follow the approved folder structure.
- Implement standardized error handling.
- Respect multi-tenant architecture.

All AI-generated state management code must undergo human review before production deployment.

---

# Future Enhancements

The architecture supports future expansion without redesign.

Planned enhancements include:

- Offline-First Synchronization
- Real-Time WebSocket Updates
- Background Data Synchronization
- Event-Driven State Management
- Cross-Device Session Synchronization
- AI-Powered Cache Optimization
- Intelligent Prefetching
- Edge Caching
- Collaborative Editing
- Conflict Resolution Engine
- Native Mobile Synchronization
- Progressive Web Application (PWA) Support

---

# Relationship Overview

```text
React Components

↓

Local Component State

↓

Zustand Stores

↓

TanStack Query

↓

API Services

↓

REST API

↓

Backend Services

↓

PostgreSQL Database

↓

API Response

↓

Query Cache

↓

State Synchronization

↓

UI Update
```

---

# Summary

The NEMP State Management Architecture establishes a standardized approach for managing client-side and server-side state across the entire platform.

By clearly separating local component state, global client state, and backend-managed server state, the architecture promotes predictable behaviour, high performance, scalability, and maintainability. Leveraging Zustand for lightweight client state and TanStack Query for intelligent server state management enables efficient caching, background synchronization, optimistic updates, and reduced network traffic.

This architecture also supports NEMP's multi-tenant design, robust security requirements, AI-assisted development, and future enhancements such as offline functionality, real-time synchronization, and Progressive Web Applications. It serves as the definitive reference for all frontend state management decisions within the Nobletech Education Management Platform.

---

# End of Document

