## Phase 2G Operational Curriculum Lifecycle Foundation

- New migration folder: `backend/prisma/migrations/20260713055000_operational_curriculum_lifecycle_foundation`.
- Added lifecycle enums: `CurriculumStatus`, `CurriculumCreationMethod`, `CurriculumReviewDecision`, `CurriculumAssignmentStatus`.
- Added operational models: `Curriculum`, `CurriculumUnit`, `CurriculumTopic`, `CurriculumConcept`, `CurriculumTopicConcept`, `CurriculumProject`, `CurriculumTopicProject`, `CurriculumProjectImplementation`, `CurriculumLearningOutcome`, `CurriculumTopicLearningOutcome`, `CurriculumProjectLearningOutcome`, `CurriculumResource`, `CurriculumVisibilitySetting`, `CurriculumVersion`, `CurriculumReviewAction`, `CurriculumStatusHistory`, `CurriculumAssignment`.
- Deferred or removed from this phase: `CurriculumComponent` (redundant for current one-component ownership model).
- Snapshot/versioning: immutable `snapshot_data` JSONB stored on each version; publication metadata and checksum checks enforced at DB constraint level.
# Database Schema

## Purpose

This document serves as the master index for all database schemas.

The complete database schema is divided into logical sections.

---

## Sections

1. Core System Tables
2. User & Security Tables
3. School Tables
4. Academic Tables
5. Programme Component Tables
6. Curriculum Tables
7. Assessment Tables
8. Report Tables
9. PDF Tables
10. CBT Tables
11. Notification Tables
12. Audit Tables
13. Analytics Tables
14. Settings Tables
15. File Storage Tables

---

Each section contains:

- Table Purpose
- Columns
- Data Types
- Constraints
- Foreign Keys
- Indexes
- Relationships
- Business Rules

---

## Phase 1.1 Alignment Notes

Before Prisma mapping begins, schema documentation should preserve:

- Permanent learner identity separation (`student_id`, `student_number` or `admission_number`, `username`, optional `email`).
- Optional email support for pupil and student authentication flows.
- Concept modelling guidance linked to Topics without breaking approved hierarchy.
- External resource launch metadata and policy controls.
- One-page end-of-term report constraints with preview and overflow governance.

---

## Phase 1.2 Policy Freeze Notes

The following policy decisions are frozen for documentation-to-Prisma mapping:

- Learner usernames are globally unique, case-insensitive, non-reused identifiers.
- `student_number` is the canonical NEMP academic reference.
- `admission_number` is optional and external-supplier specific.
- Concepts remain reusable instructional entities linked through an explicit join model with Topics.
- External learning resources require termly verification and secure fallback launch behavior.
- One-page report overflow must be validated by rendered-height measurement, not text limits alone.

### A. Student Identity Matrix

| Field name | Purpose | Required or optional | Mutable or immutable | Uniqueness scope | User visibility | Security classification | Generation source | Change authority | Audit requirement |
|---|---|---|---|---|---|---|---|---|---|
| student_id | Immutable internal learner identity | Required | Immutable | Globally unique | Internal only | High | System generated | None after creation | Yes |
| student_number | Canonical NEMP academic reference | Required | Mutable by policy | Globally unique within policy scope | School and internal | Medium | System or school provisioned | School Admin or Super Admin | Yes |
| admission_number | External school-provided reference | Optional | Mutable by school | School-scoped | School and internal | Medium | School provisioned | School Admin | Yes |
| username | Globally unique learner login identifier | Required | Mutable by controlled change | Global | Login-visible | High | System generated or controlled change | School Admin or Super Admin | Yes |
| email | Optional contact or login attribute | Optional | Mutable | Global where used | Conditional | Medium | User or administrator supplied | Authorized admin or user policy | Yes |
| guardian contact | Recovery and communication contact | Optional | Mutable | Not applicable | Restricted | Sensitive | Guardian or school supplied | Authorized admin | Yes |
| account status | Access eligibility state | Required | Mutable | Not applicable | Restricted | High | System or administrator set | Authorized admin | Yes |
| initial password status | Tracks first-login reset requirement | Required | Mutable | Not applicable | Restricted | High | System generated | System and authorized admin | Yes |
| last password reset | Last credential reset timestamp | Optional | Immutable history, append-only | Not applicable | Restricted | High | System event | Authorized admin or user flow | Yes |
| school_id | Tenant ownership reference | Required | Immutable after creation | Tenant unique context | Internal | High | System or import | None after creation | Yes |
| current class assignment | Active academic placement | Required for enrolled learners | Mutable through enrollment history | Scoped to enrollment context | Role-based | Medium | Enrollment workflow | Authorized academic staff | Yes |

### B. Curriculum Concept Mapping Matrix

| Entity | Definition | Parent or relationship | Reusable status | Class-specific context | Assessment use | Reporting use | Versioning requirement | Publication requirement |
|---|---|---|---|---|---|---|---|---|
| Curriculum | Full instructional plan for a school context | Belongs to school, session, term, class | Reusable as versioned instances | Yes | Yes | Yes | Required | Published version only |
| Curriculum Unit | Major structured learning block | Child of Curriculum / Programme Component | Reusable | Yes | Yes | Yes | Required | Published within curriculum |
| Topic | Lesson-level teaching unit | Child of Curriculum Unit | Reusable | Yes | Yes | Yes | Required | Published within curriculum |
| Concept | Underlying idea or principle | Many-to-many with Topic | Reusable | Yes | Yes | Yes | Required if modelled | Published via topic context |
| Skill | Performable ability | Associated with Topic, Project, Outcome | Reusable | Yes | Yes | Yes | Recommended | Published as part of curriculum |
| Learning Outcome | Measurable expected result | Linked to Topic / Project | Reusable | Yes | Yes | Yes | Required | Published within curriculum |
| Activity | Learner task or exercise | Linked to Topic / Assignment | Reusable | Yes | Yes | Yes | Recommended | Published where assigned |
| Project | Structured practical application | Child of Topic | Reusable | Yes | Yes | Yes | Required | Published within curriculum |
| Resource | Learning material or external link | Linked to Topic / Project / Lesson | Reusable | Yes | Yes | Yes | Recommended | Approved resource only |
| Assessment | Evaluative instrument | Linked to curriculum delivery | Reusable | Yes | Yes | Yes | Required | Approved and published assessment only |

### C. External Launch Metadata Matrix

| Field | Purpose | Required status | Validation rule | Security rule | Learner visibility | Audit requirement |
|---|---|---|---|---|---|---|
| platform_name | External platform label | Required | Must match approved resource record | No secrets in name field | Visible only when approved | Yes |
| resource_title | Human-readable activity label | Required | Non-empty | Safe content only | Visible only when active | Yes |
| website_url | Main resource URL | Required | HTTPS unless approved exception | Must not bypass platform policy | Visible only when approved | Yes |
| activity_url | Direct activity entry URL | Optional | HTTPS where used | Must be validated before publish | Visible only when approved | Yes |
| launch_mode | Allowed launch behavior | Required | Must be one of approved enum values | Must obey platform restrictions | Visible only when approved | Yes |
| embed_allowed | Indicates embed permission | Required | Boolean | Cannot override platform policy | Hidden unless approved | Yes |
| login_required | Indicates third-party login need | Required | Boolean | No passwords stored in plain text | Hidden unless approved | Yes |
| external_class_code | Class/join code handling | Optional | Secure format if present | Stored securely, never plain text | Hidden from learners | Yes |
| student_instruction | Learner guidance | Optional | Length limited by UI policy | Safe instructional content only | Visible when assigned | Yes |
| teacher_instruction | Staff guidance | Optional | Length limited by UI policy | Restricted to staff | Staff only | Yes |
| verification_status | Review state | Required | Must use frozen enum values | Must block unsafe states | Learner-visible only when VERIFIED | Yes |
| last_verified_at | Last successful review date | Optional | Timestamp format | Review trail required | Hidden | Yes |
| next_review_due_at | Planned next review date | Optional | Timestamp format | Review schedule enforced | Hidden | Yes |
| approved_by | Approver identity | Optional | Must reference authorised user | Approval audit required | Hidden | Yes |
| is_active | Publication visibility toggle | Required | Boolean | Inactive resources hidden | Visible only if active | Yes |

### D. One-Page Report Field-Budget Matrix

| Report section | Priority | Required or optional | Maximum recommended items | Maximum recommended text length | Summarisation rule | Hide rule | Overflow behaviour |
|---|---|---|---|---|---|---|---|
| Learner identity | 1 | Required | 6 fields | 180 chars total | Never summarise identifiers | Hide only if not applicable | Must never overflow |
| Class, term and session | 2 | Required | 4 items | 120 chars total | Use compact labels | Never hide | Must never overflow |
| Programme components | 3 | Required | 6 items | 220 chars total | Group untaught components | Hide untaught components if configured | Group and reflow |
| Assessment scores | 4 | Required | 12 rows | 240 chars total | Round where policy permits | Never hide required scores | Warn then compress |
| Learning outcomes and skills | 5 | Optional | 8 items | 260 chars total | Summarise by cluster | Hide if no outcomes mapped | Group and reflow |
| Projects completed | 6 | Optional | 6 items | 220 chars total | Group repeated project types | Hide if none completed | Group and reflow |
| Teacher comment | 7 | Required | 1 block | 500 chars recommended | Summarise before overflow | Never hide | Warn then request correction |
| Attendance | 8 | Required | 1 summary block | 120 chars total | Use summary figures | Never hide | Compress formatting |
| Approval and verification information | 9 | Required | 3 items | 120 chars total | Compact verification metadata | Never hide | Preserve over decorative fields |
| Tools and platforms used | 10 | Optional | 6 items | 180 chars total | Group by platform type | Hide if disabled by template | Group and reflow |
| Additional descriptive content | 11 | Optional | 1 block | 300 chars recommended | Condense aggressively | Hide first when overflow risk exists | Last to keep, first to trim |

Rendered-height validation is the final overflow authority.

### E. Learner Dashboard Visibility Matrix

| Content type | Required status | Required assignment | Required role | Visibility condition | Launch behaviour | Audit or tracking rule |
|---|---|---|---|---|---|---|
| Curriculum | Published and approved | School, session, term, class, programme | Learner | Assigned and published only | Open read-only view | Log view events where policy allows |
| Curriculum Unit | Published and approved | Curriculum assignment | Learner | Parent curriculum visible | Open within curriculum | Log navigation |
| Topic | Published and approved | Curriculum assignment | Learner | Topic assigned and published | Open topic view | Log topic access |
| Concept | Published and approved | Topic mapping | Learner | Visible only through assigned topic | Show as learning idea | Log concept view if enabled |
| Internal resource | Active | Assigned to topic or project | Learner | Approved internal material | Open internal viewer | Log access |
| External resource | Approved and active | Assigned to lesson or activity | Learner | Verification status must be VERIFIED | EMBEDDED or NEW_TAB depending on policy | Log launch if permitted |
| Lesson | Published and assigned | Assigned lesson | Learner | Published lesson content only | Open lesson page | Log lesson start |
| Assignment | Active and assigned | Assigned task | Learner | Assignment due and visible | Open assignment workflow | Log submission and access |
| Project | Published and assigned | Assigned project | Learner | Project visible in current curriculum | Open project workspace | Log project access |
| Assessment | Active and assigned | Assigned assessment | Learner | Assessment window or visibility rule met | Open assessment view | Log attempt and view |
| Feedback | Available | Linked to assessment or project | Learner | Released feedback only | Open feedback panel | Log feedback read where allowed |
| Report | Published and assigned | Current report context | Learner | Published report only | Open read-only report | Log report view if policy allows |

### F. Enum and Permission Constants Matrix

| Category | Frozen names |
|---|---|
| Curriculum lifecycle | GENERATED_DRAFT, DRAFT, UNDER_REVIEW, REVISION_REQUIRED, APPROVED, PUBLISHED, ARCHIVED |
| External launch modes | EMBEDDED, NEW_TAB, SAME_WINDOW, INTERNAL_RESOURCE |
| External verification statuses | PENDING_REVIEW, VERIFIED, BROKEN, ACCESS_RESTRICTED, EMBED_BLOCKED, DEACTIVATED |
| Recommended learner account statuses | INVITED, ACTIVE, SUSPENDED, LOCKED, ARCHIVED |
| Recommended permissions | curriculum.view, curriculum.create, curriculum.generate, curriculum.edit, curriculum.reorder, curriculum.regenerate_section, curriculum.submit_review, curriculum.request_revision, curriculum.approve, curriculum.publish, curriculum.assign, curriculum.archive, curriculum.restore_version, curriculum.view_audit, curriculum.compare_versions, student.username.change, student.username.view_history, external_resource.create, external_resource.edit, external_resource.verify, external_resource.approve, external_resource.deactivate, report.preview, report.approve, report.publish, report.revise |

### Module Title Consistency Notes

Legacy numbering is retained for database document references.

- Module 21 is clarified as Curriculum Topics.
- Module 22 is clarified as Curriculum Projects.
- These headings remain legacy-numbered to avoid breaking references, but their naming now aligns with the approved hierarchy and future concept mapping notes.

## Phase 2A Prisma Mapping Draft

This section converts the approved documentation into a Prisma-first schema design. It remains a documentation artifact only.

### 1. Current Prisma Baseline

- `schema.prisma` currently contains only `generator client` and `datasource db`.
- No Prisma models are defined yet.
- No Prisma enums are defined yet.
- No migrations, seeds, services, or generated client artifacts were created for this milestone.

### 2. Initial Repository Assessment

1. Current contents of `schema.prisma`: datasource and generator configuration only.
2. Existing datasource and generator configuration: PostgreSQL datasource via `DATABASE_URL`, Prisma Client generator `prisma-client-js`.
3. Existing Prisma models and enums: none.
4. Existing naming conventions: singular PascalCase Prisma models; plural lowercase snake_case physical tables; camelCase Prisma fields; snake_case database columns through `@map()` and `@@map()`.
5. Remaining documentation-to-schema inconsistencies: the approved docs already converge on school-as-tenant, learner identity separation, explicit concept joins, external-resource verification, and immutable published outputs; no blocking inconsistencies remain for Phase 2A mapping.
6. Deferred entities: school branch, class arm / section, full authentication credential implementation, full report engine, AI generation, and Prisma Client generation remain later-phase implementation work unless a later approved document introduces them.

### 3. Mapping Principles Applied In Prisma

- Use `schoolId` as the effective tenant boundary for all school-owned operational rows.
- Treat any standalone `Tenant` table as deferred unless a later approved document requires organization rollups beyond school.
- Use UUID primary keys for all major business entities.
- Preserve immutable identifiers such as `studentId`, published curriculum version identity, and report snapshot identity.
- Use explicit join models wherever lifecycle, ordering, approval, or metadata must be preserved.
- Prefer `Restrict`, `NoAction`, or soft-deactivation for protected historical data.
- Use cascade deletion only for fully disposable child records that are never audited independently.

### 4. Recommended Case-Insensitive Username Strategy

Recommended approach: PostgreSQL `citext` for `User.username` with a database unique constraint.

- Prisma representation: `username String @db.Citext @unique`.
- Database requirement: enable the `citext` extension in a migration before applying the model.
- Why this is preferred: the database enforces case-insensitive uniqueness directly, Prisma can still treat the field as a normal string, and lookup semantics match login behavior.
- Fallback if the project team avoids `citext`: add a normalized `usernameNormalized` field maintained in application code plus a unique index on that field. This is less elegant and should be treated as a migration-time compatibility fallback, not the preferred design.
- Functional unique index on `lower(username)` is also valid PostgreSQL design, but it requires explicit SQL migration support and is not the preferred Prisma-first option for this milestone.

### 5. Recommended Enum Mapping

| Approved documentation concept | Proposed Prisma enum | Notes |
|---|---|---|
| Curriculum lifecycle | `CurriculumStatus` | GENERATED_DRAFT, DRAFT, UNDER_REVIEW, REVISION_REQUIRED, APPROVED, PUBLISHED, ARCHIVED |
| External launch mode | `ExternalLaunchMode` | EMBEDDED, NEW_TAB, SAME_WINDOW, INTERNAL_RESOURCE |
| External resource verification | `ExternalResourceVerificationStatus` | PENDING_REVIEW, VERIFIED, BROKEN, ACCESS_RESTRICTED, EMBED_BLOCKED, DEACTIVATED |
| Learner account lifecycle | `LearnerAccountStatus` | INVITED, ACTIVE, SUSPENDED, LOCKED, ARCHIVED |
| User lifecycle | `UserStatus` | Deferred until the approved user-status vocabulary is finalized in implementation docs; use a dedicated enum only if a status field is required separate from learner accounts |
| School lifecycle | `SchoolStatus` | Use only if school activation states are required; otherwise a boolean active flag is sufficient |
| Academic term lifecycle | `AcademicTermStatus` | Use only if term approval / archive states are modelled explicitly |
| Curriculum version lifecycle | `CurriculumVersionStatus` | Usually mirrors `CurriculumStatus` but is only needed if version rows carry their own workflow state |
| Review decision | `CurriculumReviewDecision` | APPROVED, REVISION_REQUIRED, REJECTED, DEFERRED if a standalone review decision is needed |
| Assignment status | `CurriculumAssignmentStatus` | Use only if assignment workflow state is tracked separately from curriculum status |
| Resource type | `ResourceType` | Use only where a general resource discriminator is needed; avoid duplicate status columns |
| Content source type | `ContentSourceType` | Raw source, extracted source, master content, published curriculum |
| Report status | `ReportStatus` | Draft, pending review, approved, published, archived; keep separate from curriculum lifecycle |
| Publication status | `PublicationStatus` | Use only if publication applies across multiple aggregates and a shared status is needed |
| Audit action type | `AuditActionType` | Logged event categories; keep as enum only if the approved audit architecture requires it |

### 6. Group A - Tenant And School Foundation

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| School | `School` | `schools` | `schoolId`, `schoolCode`, `schoolName`, branding, contact, `isActive`, audit fields | `schoolCode` unique; `schoolName` unique if approved; restrict deletion when linked operational history exists | School is the tenant boundary |
| Academic session | `AcademicSession` | `academic_sessions` | `academicSessionId`, `schoolId`, session label, date range, status | Unique per school + session label; index `schoolId`, `status` | School |
| Term | `AcademicTerm` | `academic_terms` | `academicTermId`, `schoolId`, `academicSessionId`, term label, dates, status | Unique per session + term order; index session/status | School |
| Class | `ClassGroup` | `classes` | `classId`, `schoolId`, `academicSessionId`, `termId`, class name / grade, status | Unique class naming within school/session scope; preserve class history | School |
| Class arm / section | `ClassSection` | `class_arms` | `classSectionId`, `classId`, `sectionName` | Deferred unless existing docs explicitly require sections; if introduced, scope under class and school | School |
| Subject / integration domain | `Subject` or `IntegrationDomain` | `subjects` or approved equivalent | `subjectId`, `schoolId`, label, code, status | Deferred if the approved curriculum docs do not require a separate subject table beyond curriculum source metadata | School |
| School configuration | `SchoolConfiguration` | `school_configurations` or `system_settings` where platform-wide | `schoolId`, branding, report settings, grading rules, defaults | One active config row per school; do not duplicate platform-wide settings | School |

### 7. Group B - User, RBAC And Identity

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| User | `User` | `users` | `userId`, `schoolId` nullable for global admins if required, `username`, optional `email`, names, status | Username unique globally and case-insensitive; `email` optional; soft delete or archive only if approved | School for school users; platform for super admins |
| Role | `Role` | `roles` | `roleId`, role name, scope, description, `isSystem` | Role names unique per scope; do not encode permissions in enum values | School or platform depending on role scope |
| Permission | `Permission` | `permissions` | `permissionId`, permission key string, description | Permission keys string-based; keep RBAC extensible | Platform |
| RolePermission | `RolePermission` | `role_permissions` | `roleId`, `permissionId` | Explicit join; unique pair; cascade only if role/permission is disposable | Role / platform |
| UserRole | `UserRole` | `user_roles` | `userId`, `roleId`, assignedBy, assignedAt | Explicit join to support audit; unique pair; preserve assignment history if needed | School |
| User session / credential support | `UserSession` / `UserCredential` | `user_sessions`, `user_credentials` | Token/session identifiers, credential flags, expiry, password reset flags | Only include if approved in the implementation baseline; avoid storing raw secrets | School or platform |
| AuditLog | `AuditLog` | `audit_logs` | actor, action, entity, before/after summary, tenant, timestamp | Immutable retention; index actor, entity, timestamp, tenant | School or platform event context |
| DataAccessLog | `DataAccessLog` | `data_access_logs` | actor, resource, reason, timestamp | Append-only; do not cascade delete | School or platform |
| SecurityEvent | `SecurityEvent` | `security_events` | event type, severity, actor, tenant, timestamp | Append-only; index severity and createdAt | School or platform |

### 8. Group C - Learner Identity

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| Student | `Student` | `students` | `studentId` UUID PK, `schoolId`, `userId` optional/required by policy, `studentNumber`, `admissionNumber` optional, `username`, optional `email`, status, timestamps | `studentId` immutable; `studentNumber` unique within the approved scope; `admissionNumber` unique within school; username globally unique and case-insensitive; username changes auditable | School |
| Guardian | `Guardian` | `guardians` | `guardianId`, `schoolId`, contact details, status | Separate from learner credentials; archive rather than delete when historical records exist | School |
| StudentGuardian | `student_guardians` | `student_guardians` | `studentId`, `guardianId`, relationship type, primary flag, status | Explicit join; unique pair; use for recovery / communication links only where policy allows | School |

### 9. Group D - Programme Components

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| Subject | `Subject` | `subjects` | canonical subject code/name, status, optional framework metadata | Subject code unique (case-insensitive via `citext`); status indexed; archive allowed | Platform foundation with school linking |
| SchoolSubject | `SchoolSubject` | `school_subjects` | `schoolId`, `subjectId`, local code/name override, enablement dates | Partial unique active link per school+subject; partial unique local code per school where provided | School |
| IntegrationDomain | `IntegrationDomain` | `integration_domains` | canonical domain code/name, category, status | Domain code unique (case-insensitive via `citext`); status indexed; archive allowed | Platform foundation |
| SubjectIntegrationDomain | `SubjectIntegrationDomain` | `subject_integration_domains` | subject-domain mapping, relevance, relationship type, primary flag | Unique subject+domain pair; active-state index | Platform foundation |
| ProgrammeComponent | `ProgrammeComponent` | `programme_components` | component code/name, lifecycle status, requirement flags, optional duration | Component code unique (case-insensitive); status and name indexed | Platform foundation |
| ProgrammeComponentSubject | `ProgrammeComponentSubject` | `programme_component_subjects` | component-subject linkage, sequence, primary flag, integration purpose | Unique component+subject pair; active-state index | Platform foundation |
| ProgrammeComponentIntegrationDomain | `ProgrammeComponentIntegrationDomain` | `programme_component_integration_domains` | component-domain linkage, sequence, primary flag, integration purpose | Unique component+domain pair; active-state index | Platform foundation |
| SchoolProgrammeComponent | `SchoolProgrammeComponent` | `school_programme_components` | `schoolId`, `programmeComponentId`, local code/name, school defaults, activation dates | Partial unique active link per school+component; partial unique local code per school where provided | School |
| TermProgrammeComponent | `TermProgrammeComponent` | `term_programme_components` | `schoolId`, `termId`, `schoolProgrammeComponentId`, term-level scheduling overrides | Partial unique active row per school+term+school component; school-scoped composite FK to `terms` and `school_programme_components` | School |
| ClassProgrammeComponent | `ClassProgrammeComponent` | `class_programme_components` | `schoolId`, `academicClassId`, `academicSessionId`, optional `termId`, `schoolProgrammeComponentId` | Partial unique active rows for term-scoped and term-null scope; composite school FKs enforce tenant isolation | School |
| ProgrammeComponentSetting | `ProgrammeComponentSetting` | `programme_component_settings` | configuration key/value, scope, JSON settings if approved | Store configuration once; do not duplicate across scope tables | School |
| ProgrammeComponentStatusHistory | `ProgrammeComponentStatusHistory` | `programme_component_status_history` | previous status, new status, actor, reason, timestamp | Append-only; audit-driven; no cascade delete | School |

Phase 2E implementation note:

- Group D foundation schema is implemented and migrated in `20260712233500_programme_component_subject_foundation`.
- Scope includes subject/integration-domain/programme-component foundations, school-term-class enablement, settings, and status history only.
- Operational curriculum content models remain deferred to later milestone execution.

### 10. Group E - Curriculum Operational Models

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| Curriculum | `Curriculum` | `curricula` | `curriculumId`, `schoolId`, `academicSessionId`, `termId`, `classId`, status, version pointer, metadata | One current operational curriculum per approved scope where required; published rows immutable | School |
| CurriculumComponent | `CurriculumComponent` | `curriculum_components` | `curriculumId`, `programmeComponentId`, order, weight, status | Represents the instructional layer between Curriculum and ProgrammeComponent, not a loose duplicate of enablement tables | School |
| CurriculumUnit | `CurriculumUnit` | `curriculum_units` | `curriculumId`, `curriculumComponentId`, order, title, status | Unique ordering within parent curriculum/component; no cascade delete once published | School |
| CurriculumTopic | `CurriculumTopic` | `curriculum_topics` | `curriculumUnitId`, order, title, lesson metadata, status | Explicit order index; published topics immutable | School |
| CurriculumProject | `CurriculumProject` | `curriculum_projects` | `curriculumTopicId`, order, title, status | Child of topic; reorderable before publication | School |
| CurriculumProjectImplementation | `CurriculumProjectImplementation` | `curriculum_project_implementations` | implementation steps, resources, status | Separate from project header so operational guidance can version independently | School |
| CurriculumLearningOutcome | `CurriculumLearningOutcome` | `curriculum_learning_outcomes` | linked to topic / project / unit, descriptor, level, status | Distinct measurable entity; avoid duplication with skills or concepts | School |
| CurriculumResource | `CurriculumResource` | `curriculum_resources` | internal resource metadata, file refs, display order, status | General resource row for non-external resources; external links should not be forced into this model | School |
| CurriculumVisibilitySetting | `CurriculumVisibilitySetting` | `curriculum_visibility_settings` | role or audience, visibility flags, release timing | One settings row per curriculum version or scope | School |
| CurriculumVersion | `CurriculumVersion` | `curriculum_versions` | `curriculumId`, version number, lifecycle status, comparison refs, generated/edited flags | Unique version per curriculum; published versions immutable; new draft required for changes | School |
| CurriculumPdfTemplate | `CurriculumPdfTemplate` | `curriculum_pdf_templates` | template name, layout, render settings, status | Template metadata only; file storage handled separately | School |

### 11. Group F - Curriculum Concepts

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| CurriculumConcept | `CurriculumConcept` | `curriculum_concepts` | concept label, description, subject/domain, status, audit fields | Reusable instructional construct; not inserted into the main hierarchy between unit and topic | School |
| CurriculumTopicConcept | `CurriculumTopicConcept` | `curriculum_topic_concepts` | `topicId`, `conceptId`, sequenceOrder, importanceLevel, expectedDepth, instructionalEmphasis, isCore, teacherNote, assessmentRelevance, isActive, createdById | Explicit join model required; unique pair plus ordering constraint; prefer controlled reference values or numeric levels for importance/depth, and reserve enums only if the vocabulary is formally frozen | School |

### 12. Group G - Master Content And Curriculum Sources

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| MasterProgrammeComponent | `MasterProgrammeComponent` | `master_programme_components` | reusable component definition, code, status | Master-only definition; operational copies derive from it | Platform |
| MasterCurriculumUnit | `MasterCurriculumUnit` | `master_curriculum_units` | reusable unit structure | Master source for operational units | Platform |
| MasterTopic | `MasterTopic` | `master_topics` | reusable topic definition | Master source for operational topics | Platform |
| MasterProject | `MasterProject` | `master_projects` | reusable project definition | Master source only | Platform |
| MasterProjectImplementation | `MasterProjectImplementation` | `master_project_implementations` | reusable project steps and guidance | Master source only | Platform |
| MasterLearningOutcome | `MasterLearningOutcome` | `master_learning_outcomes` | reusable outcome definition | Master source only | Platform |
| MasterResource | `MasterResource` | `master_resources` | reusable internal content metadata | Distinct from raw source documents and external links | Platform |
| MasterAssessmentTemplate | `MasterAssessmentTemplate` | `master_assessment_templates` | reusable assessment design | Separate from school-run assessment instances | Platform |
| MasterRubric | `MasterRubric` | `master_rubrics` | rubric criteria and scoring bands | Separate reusable evaluation artifact | Platform |
| CurriculumSourceDocument | `CurriculumSourceDocument` | `curriculum_source_documents` | raw source metadata: title, subject, grade, term, standard, framework, source type, academic year/version, file reference, upload / review / approval status, active flag | Keep raw document separate from extracted content; secure file reference only | School or platform depending on upload scope |
| CurriculumSourceExtraction | `CurriculumSourceExtraction` | `curriculum_source_extractions` | structured extracted content, parsed sections, extraction provenance, source document link | Stores normalized extracted content; not a replacement for master content | School or platform |

### 13. Group H - External Learning Resources

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| ExternalLearningResource | `ExternalLearningResource` | `external_learning_resources` | `platformName`, `resourceTitle`, `websiteUrl`, `activityUrl`, `launchMode`, `embedAllowed`, `loginRequired`, `externalClassCode`, `studentInstruction`, `teacherInstruction`, verification status, last verified timestamps, approval data, active flag | Dedicated model recommended for lifecycle, verification, audit, reuse across topics/curricula; do not store third-party passwords; protect class codes via restricted visibility or encryption-at-rest if approved | School |
| CurriculumResourceExternalLink | `CurriculumResourceExternalLink` | `curriculum_resource_external_links` | `curriculumResourceId`, `externalLearningResourceId`, assignment / usage metadata | Join model only if the same external resource must be reused across multiple curriculum resources or assignments | School |

### 14. Group I - Curriculum Review, Lifecycle And Versioning

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| CurriculumReviewAction | `CurriculumReviewAction` | `curriculum_review_actions` | action type, actor, reason, timestamp, current version, target status | Needed because audit logs alone do not capture domain-specific review transitions and outcomes | School |
| CurriculumStatusHistory | `CurriculumStatusHistory` | `curriculum_status_history` | previous status, new status, actor, timestamp, reason | Append-only; one row per transition; no cascade delete | School |
| CurriculumVersionSnapshot | `CurriculumVersionSnapshot` | `curriculum_version_snapshots` | frozen snapshot payload, checksum, version link, generated/edited indicator | Captures published immutability and compare history | School |
| CurriculumRegenerationRequest | `CurriculumRegenerationRequest` | `curriculum_regeneration_requests` | request scope, source, reason, target version, review state | Records generated-vs-edited lineage separately from generic audit logs | School |

### 15. Group J - Curriculum Assignments

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| CurriculumAssignment | `CurriculumAssignment` | `curriculum_assignments` | `schoolId`, `academicSessionId`, `termId`, `classId`, optional `teacherId`, assignment status, effective dates | Recommended single anchor row with explicit required scope; invalid combinations are prevented by required FKs; keep program-component linkage in explicit join rows | School |
| CurriculumAssignmentProgrammeComponent | `CurriculumAssignmentProgrammeComponent` | `curriculum_assignment_programme_components` | `curriculumAssignmentId`, `programmeComponentId`, order / metadata | Explicit join for one-to-many or many-to-many component targeting; unique pair | School |
| CurriculumAssignmentTeacher | `CurriculumAssignmentTeacher` | `curriculum_assignment_teachers` | `curriculumAssignmentId`, `teacherId`, role / responsibility metadata | Use only if an assignment can have multiple teachers; otherwise a direct teacher FK on the assignment row is sufficient | School |

### 16. Group K - Report Foundation

| Documentation entity | Prisma model | Physical table | Key fields and relations | Unique / index / deletion notes | Tenant boundary |
|---|---|---|---|---|---|
| Report | `Report` | `reports` | `studentId`, `schoolId`, `academicSessionId`, `termId`, `classId`, status, version pointer, approval state | Report lifecycle is separate from curriculum lifecycle; published reports immutable; use versioned revisions for corrections | School |
| ReportVersion | `ReportVersion` | `report_versions` | `reportId`, version number, teacher comment, generated layout summary, status | Supports draft/review/approval/publish separation | School |
| ReportPdfSnapshot | `ReportPdfSnapshot` | `report_pdf_snapshots` | `reportVersionId`, file reference, checksum, generatedAt | Immutable file metadata only; large PDFs remain in file storage | School |
| ReportProgrammeComponent | `ReportProgrammeComponent` | `report_programme_components` | `reportVersionId`, `programmeComponentId`, order, score / remark summary | Explicit child table for printable component rows | School |
| ReportTopicCoverage | `ReportTopicCoverage` | `report_topic_coverages` | topic coverage, mastery summary, order | Preserve topic ordering and reporting visibility | School |
| ReportProjectCoverage | `ReportProjectCoverage` | `report_project_coverages` | project coverage, completion summary | Separate from topic and outcome summaries | School |
| ReportAssessmentCoverage | `ReportAssessmentCoverage` | `report_assessment_coverages` | assessment refs, scores, grades, remarks | Keep raw assessment references out of the PDF snapshot when not required | School |
| ReportSkillEvaluation | `ReportSkillEvaluation` | `report_skill_evaluations` | skill score, qualitative rating, notes | Distinct from curriculum outcome model | School |
| ReportAttendanceSummary | `ReportAttendanceSummary` | `report_attendance_summaries` | attendance counts, percentages, remarks | Summary-only model for one-page report support | School |
| ReportApprovalAction | `ReportApprovalAction` | `report_approval_actions` | reviewer, decision, timestamp, reason | Needed for approval chain beyond generic audit rows | School |

### 17. Deletion Behaviour Matrix

| Model | Recommended deletion behaviour | Rationale |
|---|---|---|
| School | Restrict or archive | Never remove tenant roots while history exists |
| User | Soft delete / archive | Preserve audit and login history |
| Student | Restrict or archive | Academic history and reports must survive |
| Guardian | Restrict or archive | Preserve student relationships and audit |
| Curriculum | Archive | Historical curriculum must remain traceable |
| CurriculumVersion | Immutable retention | Published versions must never be physically deleted |
| CurriculumUnit | Restrict or archive | Units belong to published curriculum history |
| CurriculumTopic | Restrict or archive | Preserve ordering and concept links |
| CurriculumConcept | Restrict or archive | Reusable entity with historical joins |
| ExternalLearningResource | Archive or soft delete | Broken links and verification history must remain |
| CurriculumAssignment | Restrict or archive | Assignment history must not be lost |
| Report | Immutable retention | Published reports are immutable by policy |
| AuditLog | Immutable retention | Audit events must never be cascaded away |

### 18. Required Indexing Matrix

| Index target | Recommended index |
|---|---|
| Tenant / school filtering | `schoolId` on all school-owned operational tables; composite `(schoolId, status)` where filtering is frequent |
| Username login lookup | Unique index on case-insensitive `username` (`citext` or equivalent) |
| Student number lookup | Unique or indexed `studentNumber` according to the approved scope |
| Admission number lookup | Composite unique / index on `(schoolId, admissionNumber)` |
| Class and session filtering | Composite indexes on `(schoolId, academicSessionId, termId, classId)` as appropriate |
| Curriculum status and version lookup | Composite `(schoolId, status, versionNumber)` or `(curriculumId, versionNumber)` |
| Curriculum hierarchy ordering | Indexes on parent FK plus `sequenceOrder` / `displayOrder` |
| Topic–concept joins | Unique `(topicId, conceptId)` and index on `conceptId` for reverse lookup |
| External-resource review due dates | `(schoolId, nextReviewDueAt, verificationStatus)` |
| Curriculum assignment lookup | Composite scope indexes on `(schoolId, academicSessionId, termId, classId)` and any component joins |
| Report retrieval | `(schoolId, academicSessionId, termId, classId, studentId)` and report number where used |
| Audit history retrieval | `(schoolId, createdAt)` plus actor / entity composite indexes |

### 19. Custom PostgreSQL Requirements

| Requirement | Reason | Prisma impact |
|---|---|---|
| `citext` extension | Case-insensitive username uniqueness | Enables `User.username` to be unique without application-side lowercasing errors |
| Functional unique index on `lower(username)` | Fallback if `citext` is not used | Requires explicit SQL migration; not expressible as a standard Prisma schema unique constraint |
| Optional partial / filtered indexes | Efficient active-row lookups and review queues | Requires SQL migration support if Prisma schema cannot express the filter |
| Trigger or generated column support for audit / normalized fields | Safeguard derived values and immutability rules | Use only where approved by implementation docs |

### 20. Validation And Deferred Decisions

1. Every proposed Prisma model maps to an approved documented entity or an explicitly approved support table.
2. Operational curriculum models and master-content models remain separate.
3. Concept remains reusable and is linked by an explicit join model.
4. Username uniqueness is globally enforceable through a database-level case-insensitive strategy.
5. Optional learner email remains preserved.
6. External-resource verification is represented as a first-class lifecycle with termly review support.
7. Approval and publication remain separate states and transitions.
8. Published curriculum and published reports are immutable.
9. Report lifecycle remains separate from curriculum lifecycle.
10. No migrations or application code are created in Phase 2A.
11. No database commands are run in Phase 2A.

### 21. Open Questions

- Whether a standalone `Tenant` table is required beyond school-level tenancy.
- Whether `UserSession` and `UserCredential` belong in the first Prisma slice or remain deferred to the authentication implementation phase.
- Whether `ClassSection` and `SchoolBranch` are formally approved or should remain deferred.
- Whether report approval needs a dedicated decision enum or can be represented by a shared review action table plus status history.
- Whether `importanceLevel` and `expectedDepth` should be enums, numeric levels, or controlled reference rows in the concept join model.

### 22. Phase 2B Foundation Implementation Summary

The Prisma foundation slice now implements:

- School tenant foundation.
- Shared user identity foundation.
- RBAC foundation with roles, permissions, and explicit join models.
- Learner identity separated from login identity.
- Guardian profiles and learner-guardian relationships.
- Minimum immutable audit-log foundation.

Custom PostgreSQL support remains required for case-insensitive identity enforcement and for any future partial uniqueness rule on active user-role assignments across nullable scope.

### 23. Recommended Next Milestone

Phase 2C: Review and migrate the foundation schema.

### 24. Phase 2C Migration Execution Report

- Migration name: `20260712181640_foundation_identity_rbac`.
- Migration date: 2026-07-12.
- Migration location: `backend/prisma/migrations/20260712181640_foundation_identity_rbac/migration.sql`.
- Foundation tables created: schools, users, roles, permissions, role_permissions, user_roles, students, guardians, student_guardians, audit_logs.
- Enums created: SchoolStatus, UserStatus, StudentStatus, Gender.

PostgreSQL extensions enabled:

- `citext` via `CREATE EXTENSION IF NOT EXISTS citext;`.

Case-insensitive (`citext`) fields applied:

- `schools.school_code`
- `schools.school_name`
- `schools.email`
- `users.username`
- `users.email`
- `roles.role_code`
- `permissions.permission_code`
- `students.email`
- `guardians.email`

Native Prisma constraints retained:

- Global unique username (`users.username`) with case-insensitive matching.
- Optional unique email (`users.email`) with case-insensitive matching and multiple NULLs allowed.
- Composite admission uniqueness (`students.school_id`, `students.admission_number`) with nullable admission number support.
- Composite role-permission primary key (`role_permissions.role_id`, `role_permissions.permission_id`).
- Composite student-guardian primary key (`student_guardians.student_id`, `student_guardians.guardian_id`).

Custom PostgreSQL indexes and constraints added in migration SQL:

- `roles_global_role_code_active_key` for global role-code uniqueness where `school_id IS NULL`.
- `user_roles_active_scoped_unique_idx` for active school-scoped user-role uniqueness.
- `user_roles_active_global_unique_idx` for active global user-role uniqueness where `school_id IS NULL`.

Verification summary:

- Prisma schema validation passed.
- Prisma client generation passed.
- Migration status is clean and up to date.
- Database health check passed.
- Constraint verification test suite passed (11 of 11 checks).

Deferred constraints and known limits:

- One-primary-guardian-per-student rule remains deferred until explicitly approved.
- Foundation migration does not include academic structure, curriculum, report, assessment, CBT, external resource, or file-storage models.

Rollback considerations:

- Rollback should use Prisma migration rollback strategy for development environments.
- Manual rollback must remove dependent objects in reverse order and should not be attempted on shared environments without backup and approval.

### 25. Phase 2D Academic Structure Mapping and Implementation Report

Implemented Prisma entities in this milestone:

- `AcademicSession` -> `academic_sessions`
- `Term` -> `terms`
- `AcademicClass` -> `academic_classes`
- `StudentEnrolment` -> `student_enrolments`
- `AcademicClassTeacherAssignment` -> `academic_class_teacher_assignments`

Implemented Prisma enums in this milestone:

- `AcademicSessionStatus`: PLANNED, ACTIVE, CLOSED, ARCHIVED
- `TermStatus`: PLANNED, ACTIVE, CLOSED, ARCHIVED
- `AcademicClassStatus`: ACTIVE, INACTIVE, ARCHIVED
- `EnrolmentStatus`: PENDING, ACTIVE, PROMOTED, TRANSFERRED, WITHDRAWN, GRADUATED, COMPLETED, ARCHIVED
- `AcademicClassTeacherAssignmentType`: CLASS_TEACHER, ASSISTANT_TEACHER, SUPERVISOR

Preliminary consistency audit decisions:

- Student email: retained as optional student profile contact value and clarified in Prisma as `Student.contactEmail @map("email")`. `User.email` remains the authoritative account/login email where email login is used.
- School name `citext`: retained for now to prevent case-variant duplicate tenant names and to avoid destructive foundation changes within this milestone.
- Student number uniqueness: aligned to school scope (`@@unique([schoolId, studentNumber])`) and no longer globally unique.

Phase 2D constraint strategy:

- One current active session per school enforced by partial unique index: `academic_sessions_one_current_active_per_school_idx`.
- One current active term per school enforced by partial unique index: `terms_one_current_active_per_school_idx`.
- One active or pending enrolment per learner per school and session enforced by partial unique index: `student_enrolments_active_unique_idx`.
- Duplicate active teacher class assignments prevented using scoped and non-term partial unique indexes.
- Date validity checks implemented for session range, term range, term sequence, class age range, enrolment terminal dates, and assignment end-date ordering.

Cross-tenant integrity implementation:

- Composite foreign keys were added using `(entity_id, school_id)` references for session, term, class, student enrolment, and class teacher assignment relationships.
- This enforces school-bound linkage at database level for key academic joins.

Known validation boundary:

- Cross-table rule "term dates must fall inside academic session dates" remains a service-layer or trigger-level rule and is deferred from this milestone.

### 26. Phase 2F Master Content Library and Curriculum Source Foundation Report

Implemented Prisma entities in this milestone:

- `CurriculumSource` and `CurriculumSourceContent` for raw-source registry and structured extraction content.
- `MasterCurriculumUnit`, `MasterTopic`, `MasterConcept`, `MasterSkill`, `MasterLearningOutcome`, `MasterActivity`, `MasterProject`, `MasterProjectImplementation`, `MasterResource`, `MasterAssessmentTemplate`, `MasterRubric`, `MasterRubricCriterion`, and `MasterRubricLevel`.
- Explicit reusable join entities for approved links across subjects, integration domains, programme components, concepts, skills, outcomes, activities, projects, resources, and assessment templates.
- `CurriculumSourceMasterContentLink` for source lineage from curriculum sources to master content records.

Implemented enums in this milestone:

- `CurriculumSourceType`
- `CurriculumSourceFormat`
- `ContentReviewStatus`
- `MasterContentStatus`
- `CurriculumSourceContentType`
- `MasterActivityType`
- `MasterProjectImplementationType`
- `MasterResourceType`
- `MasterAssessmentType`

Phase 2F data-layer separation implemented:

- Raw source records are stored in `curriculum_sources`.
- Structured extracted content is stored in `curriculum_source_contents` and remains traceable to source records.
- Reusable approved building blocks are stored in `master_*` tables.
- Operational school curriculum assignment, publication, and delivery records remain deferred.

Ownership and tenant scope:

- Global sources and global master content are represented with nullable `school_id`.
- School-owned source and master records are represented by non-null `school_id`.
- Source-type scope checks enforce school ownership for school-scheme sources and global scope for internal Nobletech source records.

Phase 2F custom integrity controls:

- Case-insensitive active uniqueness for source codes and selected master codes using `citext` plus partial unique indexes.
- Positive value checks for sequence and duration fields.
- Approval and archive safety checks to prevent approved records from being silently inactivated without archive handling.
- Single-target lineage check on `curriculum_source_master_content_links` to prevent one lineage row from linking multiple master entities.
- Partial unique lineage indexes by target entity to prevent duplicate source-to-master lineage links.

Validation summary:

- Prisma schema validation passed.
- Prisma client generation passed.
- Migration status is clean and up to date after Phase 2F migration deploy.
- Database health check passed.
- Phase 2F artifact verification passed.
- Phase 2F rollback-safe constraint suite passed.
- Phase 2C, Phase 2D, and Phase 2E regression suites re-passed.
