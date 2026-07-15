## Phase 2J.1 API Completion Update

- Added operational concept endpoints:
	- `POST /api/v1/curriculum/curricula/:curriculumId/concepts`
	- `PATCH /api/v1/curriculum/curriculum-concepts/:conceptId`
	- `DELETE /api/v1/curriculum/curriculum-concepts/:conceptId`
- Added concept-mapping reorder endpoint:
	- `POST /api/v1/curriculum/curriculum-topics/:topicId/concepts/reorder`
- Added project-implementation reorder endpoint:
	- `POST /api/v1/curriculum/curriculum-projects/:projectId/implementations/reorder`
- Added learning-outcome delete endpoint:
	- `DELETE /api/v1/curriculum/curriculum-learning-outcomes/:outcomeId`
- Updated visibility update contract to include `lastKnownUpdatedAt` optimistic concurrency token.
- Conflict mapping remains safe and normalized through application error envelopes; raw Prisma errors are not exposed.

Every API endpoint we'll need

## Phase 2J API Integration Update

- Added editor lookup endpoint: `GET /api/v1/curriculum/curricula/:curriculumId/editor-lookups` with optional `sessionId` query.
- Added project implementation endpoints:
	- `POST /api/v1/curriculum/curriculum-projects/:projectId/implementations`
	- `PATCH /api/v1/curriculum/curriculum-project-implementations/:implementationId`
	- `DELETE /api/v1/curriculum/curriculum-project-implementations/:implementationId`
- Added mapping maintenance endpoints:
	- `PATCH|DELETE /api/v1/curriculum/curriculum-topic-concepts/:mappingId`
	- `DELETE /api/v1/curriculum/curriculum-topic-project-links/:linkId`
	- `DELETE /api/v1/curriculum/curriculum-topic-learning-outcome-links/:linkId`
	- `DELETE /api/v1/curriculum/curriculum-project-learning-outcome-links/:linkId`
- Version comparison payload now includes `snapshotData` on both compared sides to support structured frontend diffs.
- Error envelope normalization preserves service error `code`, `message`, and optional `details` for client-side handling.

## Phase 2I Administrative Portal Integration Notes

- Frontend administrative client consumes the existing `/api/v1/curriculum` Phase 2H endpoint family without introducing new backend routes.
- All protected requests are sent with tenant-aware headers `x-user-id` and `x-school-id`.
- Administrative views now consume these capability groups:
	- Curriculum CRUD and archive actions.
	- Unit and topic structure authoring and reorder actions.
	- Review lifecycle transitions: submit, request revision, approve, publish.
	- Version history retrieval and snapshot comparison.
	- Assignment CRUD and assignment status transitions.
- Client-side error normalization maps common HTTP states (`401`, `403`, `404`, `409`, `422`) for consistent UI feedback.
- AI curriculum generation or regeneration APIs remain out of scope and unimplemented for this phase.

## Phase 2H Update: Curriculum Authoring APIs

- Added `/api/v1/curriculum/curricula` resource group with school-scoped CRUD and archive workflow.
- Added structure authoring endpoints for units, topics, concepts, projects, learning outcomes, and resources.
- Added explicit lifecycle transition endpoints: submit review, request revision, approve, publish, withdraw review.
- Added versioning endpoints for snapshot retrieval and version comparison.
- Added assignment endpoints with explicit state transition actions (activate, complete, suspend, archive).
- All protected endpoints require authenticated user context plus permission checks.

## Phase 2K.1 Update: Curriculum Source Administration Foundation

- Added source register endpoints under `/api/v1/curriculum`:
	- `GET /sources`
	- `POST /sources`
	- `GET /sources/:sourceId`
	- `PATCH /sources/:sourceId`
	- `POST /sources/:sourceId/submit-review`
	- `POST /sources/:sourceId/request-revision`
	- `POST /sources/:sourceId/reject`
	- `POST /sources/:sourceId/approve`
	- `POST /sources/:sourceId/archive`
- Added source content administration endpoints:
	- `POST /sources/:sourceId/contents`
	- `PATCH /source-contents/:contentId`
	- `DELETE /source-contents/:contentId`
	- `POST /sources/:sourceId/contents/reorder`
- Added source-to-master lineage endpoints:
	- `POST /sources/:sourceId/master-links`
	- `PATCH /source-master-links/:linkId`
	- `DELETE /source-master-links/:linkId`
- Added approved master-content catalog endpoint:
	- `GET /master-content/catalog?type=<catalogType>&q=<optionalSearch>`
- Multi-tenant and lifecycle rules:
	- School-owned source records are editable only in `DRAFT` or `REVISION_REQUIRED` review states.
	- Global source records can be listed but are immutable from school-scoped admin operations.
	- All state-changing operations emit audit log entries with actor, entity, and reason/comment metadata.

## Phase 2L Update: Curriculum Source File-Storage Foundation

- Added curriculum source file endpoints for metadata updates, scan updates, unlink, and purge alongside the existing upload, replace, reorder, make-primary, archive, delete, download, and preview routes.
- Added upload and storage enforcement for allow-listed extensions, blocked extensions, MIME validation, scan status tracking, and file-lifecycle metadata.
- Deferred boundary retained: OCR, AI extraction, parsing, and generation remain out of scope for this phase.

## Phase 2K.2 Update: Master-Content Administration Completion

- Added `/api/v1/master-content` administration API group.
- Added dashboard and review endpoints:
	- `GET /api/v1/master-content/dashboard`
	- `GET /api/v1/master-content/review-queue`
- Added entity administration endpoints:
	- `GET /api/v1/master-content/entities/:entityType`
	- `GET /api/v1/master-content/entities/:entityType/:entityId`
	- `POST /api/v1/master-content/entities/:entityType`
	- `PATCH /api/v1/master-content/entities/:entityType/:entityId`
	- `POST /api/v1/master-content/entities/:entityType/:entityId/lifecycle/:action`
	- `POST /api/v1/master-content/entities/:entityType/:entityId/revisions`
	- `GET /api/v1/master-content/entities/:entityType/:entityId/audit`
- Added typed mapping administration endpoints:
	- `POST /api/v1/master-content/mappings/:mappingType`
	- `DELETE /api/v1/master-content/mappings/:mappingType/:mappingId`
- Added source-lineage administration endpoints:
	- `POST /api/v1/master-content/lineage/:entityType/:entityId`
	- `PATCH /api/v1/master-content/lineage/:lineageId`
	- `DELETE /api/v1/master-content/lineage/:lineageId`
- Mapping coverage includes unit-subject, unit-integration-domain, unit-programme-component, topic-concept, topic-skill, topic-outcome, topic-activity, topic-project, activity-resource, project-resource, project-skill, project-outcome, assessment-outcome, and assessment-rubric.
- Assessment-template to rubric relationship decision: implemented as explicit reusable mapping model (`master_assessment_template_rubrics`) to support rubric reuse and multi-rubric assessment templates.
- Safety posture: lifecycle immutability for approved or archived content, optimistic concurrency checks for mutable operations, tenant-scope enforcement, and auditable privileged mutation flows.
- Deferred boundary retained: AI extraction, OCR parsing, upload-driven ingestion, and AI-assisted generation APIs remain out of scope.