# Security Policy

Version 1.0

---

# Purpose

Define enforceable security and authorization rules for curriculum authoring, review, approval, publication, and reporting across all schools.

---

# Objectives

- Enforce strict RBAC for curriculum lifecycle actions.
- Separate approval authority from publication authority.
- Preserve tenant isolation for every curriculum operation.
- Require auditable lineage for master-derived curriculum records.
- Protect published records from unauthorized modification.
- Support learner authentication without mandatory learner email.
- Protect external learning resource launch and credential handling.

---

# User Roles

Super Admin

School Admin

Curriculum Supervisor

Teacher

Auditor

---

# Phase 2N Master Content Promotion RBAC

## Promotion Permissions

- `master_content.promotion.view`: List and retrieve promotions, items, and audit history. Granted to CURRICULUM_SUPERVISOR, TEACHER, AUDITOR.
- `master_content.promotion.create`: Initialize new promotions from processing sessions. Granted to CURRICULUM_SUPERVISOR, TEACHER.
- `master_content.promotion.edit`: Modify promotion metadata and items when promotion is in DRAFT or REVISION_REQUIRED states. Granted to CURRICULUM_SUPERVISOR, TEACHER (creator only).
- `master_content.promotion.add_item`: Add items to promotions in editable states. Granted to CURRICULUM_SUPERVISOR, TEACHER (creator only).
- `master_content.promotion.update_item`: Modify promotion items including action and mapping. Granted to CURRICULUM_SUPERVISOR, TEACHER (creator only).
- `master_content.promotion.remove_item`: Delete items from promotions in editable states. Granted to CURRICULUM_SUPERVISOR, TEACHER (creator only).
- `master_content.promotion.reorder_items`: Reorder items within a promotion. Granted to CURRICULUM_SUPERVISOR, TEACHER (creator only).
- `master_content.promotion.submit_review`: Transition promotion from DRAFT to READY_FOR_REVIEW. Granted to CURRICULUM_SUPERVISOR, TEACHER (creator only).
- `master_content.promotion.request_revision`: Request changes to promotion under review. Granted to CURRICULUM_SUPERVISOR (reviewer authority).
- `master_content.promotion.approve`: Transition promotion from UNDER_REVIEW to APPROVED. Granted to CURRICULUM_SUPERVISOR.
- `master_content.promotion.reject`: Reject promotion, transition to rejected state. Granted to CURRICULUM_SUPERVISOR.
- `master_content.promotion.complete`: Mark promotion as completed after approval. Granted to CURRICULUM_SUPERVISOR.
- `master_content.promotion.archive`: Archive promotion for audit retention. Granted to SUPER_ADMIN, SCHOOL_ADMIN.

## Promotion Status Lifecycle

- DRAFT: Editable state for item addition and configuration; created on promotion initialization.
- READY_FOR_REVIEW: Preparation state; after submit-review, awaiting reviewer action.
- UNDER_REVIEW: Active review state; items locked for review completion.
- REVISION_REQUIRED: Feedback state; returned to DRAFT-like editability pending author changes.
- APPROVED: Approved state; ready for completion or archive.
- REJECTED: Terminal rejection state; no further transitions.
- COMPLETED: Terminal completion state; processing finished.
- ARCHIVED: Terminal archive state; read-only for audit retention.

## Promotion Data Rules

1. Promotions are scoped by school; cross-school visibility is denied.
2. Promotion items support 10 master-content entity types (curriculum unit, topic, concept, skill, learning outcome, activity, project, project implementation, resource, assessment template).
3. Each promotion item must specify an action: CREATE_DRAFT (new master), LINK_EXISTING (existing master), SKIP (no action), MARK_DUPLICATE (redundancy), ADAPT (modified).
4. Duplicate detection uses normalized code/title matching with deterministic rules; manual override supported.
5. Lineage tracking preserved for all draft-created master content linking back to source.
6. All state transitions are auditable with actor, reason, and timestamp metadata.
7. Optimistic concurrency enforced via lastKnownUpdatedAt on all mutable operations.

# Business Rules

1. Curriculum status values are restricted to GENERATED_DRAFT, DRAFT, UNDER_REVIEW, REVISION_REQUIRED, APPROVED, PUBLISHED, and ARCHIVED.

2. Generated curriculum content must start as GENERATED_DRAFT and cannot be directly published.

3. Approval and publication are separate actions requiring separate permissions.

4. Published curricula are immutable; corrections require a new DRAFT version.

5. Every curriculum operation must be scoped by school, session, term, class, and programme component context.

6. Master Library records are source assets only and cannot be directly published.

7. Learner email must be optional for pupil and student accounts.

8. Username changes require explicit authorization and immutable audit history.

9. Password reset and account recovery for learners must not depend only on learner email.

10. External platform credentials, join codes, and tokens must never be stored in plain text.

11. Embedded third-party launches are conditional on platform policy and must fall back securely when blocked.

---

# Workflow Controls

1. Authoring: curriculum.edit, curriculum.reorder

2. Review Submission: curriculum.submit_review

3. Review Decision: curriculum.request_revision or curriculum.approve

4. Publication: curriculum.publish

5. Archival and Recovery: curriculum.archive, curriculum.restore_version

6. Source Processing Session Lifecycle:
	curriculum_source.processing.create,
	curriculum_source.processing.edit,
	curriculum_source.processing.submit_review,
	curriculum_source.processing.request_revision,
	curriculum_source.processing.approve,
	curriculum_source.processing.reject,
	curriculum_source.processing.complete,
	curriculum_source.processing.archive

7. Source Section Operations:
	curriculum_source.section.create,
	curriculum_source.section.edit,
	curriculum_source.section.delete,
	curriculum_source.section.reorder

8. Source Processing Governance:
	curriculum_source.processing.compare_versions,
	curriculum_source.processing.view_audit

---

# Permission Matrix

| Permission | Super Admin | School Admin | Curriculum Supervisor | Teacher | Auditor |
|------------|-------------|--------------|------------------------|---------|---------|
| curriculum.view | Yes | Yes | Yes | Yes | Yes |
| curriculum.edit | Yes | Yes | Yes | Yes | No |
| curriculum.submit_review | Yes | Yes | Yes | Yes | No |
| curriculum.request_revision | Yes | Yes | Yes | No | No |
| curriculum.approve | Yes | Yes | Yes | No | No |
| curriculum.publish | Yes | Yes | No | No | No |
| curriculum.archive | Yes | Yes | No | No | No |
| curriculum.restore_version | Yes | Yes | Yes | No | No |
| curriculum_source.processing.view | Yes | Yes | Yes | Yes | Yes |
| curriculum_source.processing.create | Yes | Yes | Yes | Yes | No |
| curriculum_source.processing.edit | Yes | Yes | Yes | Yes | No |
| curriculum_source.processing.submit_review | Yes | Yes | Yes | Yes | No |
| curriculum_source.processing.request_revision | Yes | Yes | Yes | No | No |
| curriculum_source.processing.approve | Yes | Yes | Yes | No | No |
| curriculum_source.processing.reject | Yes | Yes | Yes | No | No |
| curriculum_source.processing.complete | Yes | Yes | Yes | No | No |
| curriculum_source.processing.archive | Yes | Yes | No | No | No |
| curriculum_source.processing.compare_versions | Yes | Yes | Yes | No | Yes |
| curriculum_source.processing.view_audit | Yes | Yes | Yes | No | Yes |
| curriculum_source.section.create | Yes | Yes | Yes | Yes | No |
| curriculum_source.section.edit | Yes | Yes | Yes | Yes | No |
| curriculum_source.section.delete | Yes | Yes | Yes | Yes | No |
| curriculum_source.section.reorder | Yes | Yes | Yes | Yes | No |

---

# Audit Trail Requirements

The following events must be logged:

- Curriculum creation and derivation source metadata
- Lifecycle status transitions with before and after values
- Review comments, approvals, and revision reasons
- Publication, archival, and restoration actions
- Permission denied events for protected curriculum actions

Each audit event must include actor, role, tenant, timestamp, client context, and change summary.

---

# Acceptance Criteria

- No user can publish curriculum without curriculum.publish permission.
- No generated curriculum can bypass review and approval steps.
- Published curriculum records are immutable in normal edit flows.
- Every status transition is visible in audit logs.
- Permission checks are enforced before every protected API operation.

---

# Future Enhancements

- Multi-factor step-up authentication for publication actions
- Risk-based access controls for high-impact operations
- Automated compliance checks for curriculum workflow violations