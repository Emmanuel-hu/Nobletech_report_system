Every API endpoint we'll need

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