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