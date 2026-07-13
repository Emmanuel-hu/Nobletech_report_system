Every API endpoint we'll need

## Phase 2H Update: Curriculum Authoring APIs

- Added `/api/v1/curriculum/curricula` resource group with school-scoped CRUD and archive workflow.
- Added structure authoring endpoints for units, topics, concepts, projects, learning outcomes, and resources.
- Added explicit lifecycle transition endpoints: submit review, request revision, approve, publish, withdraw review.
- Added versioning endpoints for snapshot retrieval and version comparison.
- Added assignment endpoints with explicit state transition actions (activate, complete, suspend, archive).
- All protected endpoints require authenticated user context plus permission checks.