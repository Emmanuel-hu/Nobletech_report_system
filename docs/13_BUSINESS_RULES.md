## Phase 2G Rules

- Curriculum root records are reusable within a school and are not permanently bound to session or class context.
- Projects are unit-owned and linked to topics through explicit `curriculum_topic_projects`.
- Operational concept handling supports direct `master_concept_id` links and optional school-specific `curriculum_concepts` linked through `curriculum_topic_concepts`.
- Learning outcomes are reusable per curriculum and linked by typed joins to topics and projects.
- Duplicate active assignment scope is blocked via partial unique index; completed or archived history remains allowed.
- Service-level enforcement still required:
	- only published versions may be activated in assignments,
	- strict immutability write controls for review-action history,
	- cross-table policy checks that cannot be safely encoded as single-row constraints.
# Nobletech Report System (NRS)

# Business Rules

Version: 1.0

---

# Purpose

This document defines the business logic and operational rules that govern the Nobletech Report System.

Business rules ensure data consistency, security, and standardization across all schools using the platform.

---

# School Rules

1. Every school must have a unique profile.

2. Every school must have its own branding.

3. Every school may have its own report template.

4. Every school may use its own grading system.

5. Every school has its own users.

---

# User Rules

1. Every user must belong to one school.

2. Every user must have at least one role.

3. Users can only access information they are authorized to view.

4. Passwords must never be stored in plain text.

5. Users can only log in with active accounts.

6. Pupil and student email is optional and must not be mandatory for account access.

7. Permanent learner identity is anchored to immutable student_id, not username or email.

8. Username updates are restricted to authorized administrators and must be auditable.

---

# Student Rules

1. Every student belongs to one school.

2. Every student belongs to one class.

3. Every student belongs to one academic session.

4. Admission numbers must be unique within a school.

5. Student records cannot be permanently deleted.

6. student_id is permanent and must not change across class, term, session, branch, or programme movements.

7. student_number (or admission_number) is an academic reference and is distinct from login username.

8. Parent or guardian contact data is stored separately from learner login credentials.

---

# Teacher Rules

1. Teachers can only access assigned classes.

2. Teachers cannot edit another teacher's reports unless authorized.

3. Teachers can save reports as drafts.

4. Teachers can submit reports for approval.

---

# Assessment Rules

1. Every assessment belongs to one student.

2. Every assessment belongs to one term.

3. Every assessment belongs to one session.

4. Scores must be within configured limits.

5. The system calculates totals automatically.

6. The system calculates grades automatically.

7. Remarks are generated automatically unless manually overridden.

---

# Skills Assessment Rules

1. Schools may define their own coding skills.

2. Schools may define their own robotics skills.

3. Schools may define their own STEAM skills.

4. Skills can be reordered by administrators.

---

# Report Rules

1. Every report belongs to one student.

2. Every report belongs to one school.

3. Every report belongs to one session.

4. Every report belongs to one term.

5. Reports are generated from approved templates.

6. Reports can be saved as drafts.

7. Reports must be approved before final PDF generation.

8. Approved reports become read-only unless reopened by an administrator.

9. One-page end-of-term mode must keep output on one printable page under normal conditions.

10. If report content risks overflow, the system must warn the administrator before PDF generation.

11. Published reports are immutable; corrections must create revised versions.

---

# PDF Rules

1. Every generated PDF must match the approved school template.

2. Logos, colours, signatures and stamps are applied automatically.

3. PDFs must be printable on A4 paper.

4. PDFs may be downloaded unlimited times.

---

# Security Rules

1. All communication must use HTTPS.

2. Passwords must be encrypted.

3. Every important action is recorded.

4. Session timeout must occur after inactivity.

5. Failed login attempts should be monitored.

---

# Audit Rules

The following actions must be logged:

Login

Logout

Create Student

Edit Student

Delete Student

Generate Report

Print Report

Download PDF

Update School Branding

Update Assessment Template

---

# Curriculum Rules

1. Curriculum assignment scope must include school, session, term, class, and programme component.

2. Curriculum hierarchy must be maintained as Programme Component -> Curriculum Unit -> Topic -> Project -> Learning Outcome.

3. Master Library records are reusable source records and must not be directly published to learners.

4. School curricula derived from master records must retain source lineage metadata.

5. Curriculum lifecycle statuses are limited to GENERATED_DRAFT, DRAFT, UNDER_REVIEW, REVISION_REQUIRED, APPROVED, PUBLISHED, and ARCHIVED.

6. Approval and publication are separate actions and require distinct permissions.

7. Published curriculum versions are immutable and may only be changed through a new draft version.

8. Any transition to APPROVED, PUBLISHED, ARCHIVED, or restored states must be auditable with actor, timestamp, reason, and tenant context.

9. Topics may teach multiple concepts; concepts should be modelled as reusable instructional constructs linked to topics in future schema planning.

10. Concept representation must not break the approved curriculum hierarchy.

11. Skills and learning outcomes remain separate measurable entities.

---

# External Resource Rules

1. External learning resources must be approved before learner visibility.

2. External resource URLs must use HTTPS unless an authorized exception is recorded.

3. NEMP must not bypass third-party platform security or embedding restrictions.

4. EMBEDDED mode is allowed only where platform policy permits; otherwise secure NEW_TAB fallback is required.

5. Third-party credentials, class codes, and join codes must never be stored in plain text.

6. External resource access must be tenant-, class-, curriculum-, and assignment-aware.

7. Broken or outdated external links must be deactivatable and reviewable.

8. Learner launches of external activities may be logged subject to privacy policy.

9. Every approved external learning resource must be verified at least once per academic term.

10. External resources must be rechecked when broken reports, embedding changes, login changes, privacy concerns, or curriculum revisions occur.

---

# Future Rules

Parent Portal

Student Portal

AI Comment Generator

AI Performance Analytics

Online Payments

Certificate Generator

CBT Module