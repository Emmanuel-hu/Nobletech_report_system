- Preserve existing documentation and architecture.
- Do not create duplicate modules, tables, documents, or schemas.
- Read the relevant requirements and approved docs before making changes.
- Follow approved naming conventions and canonical terminology.
- Maintain multi-tenant isolation in all designs and changes.
- Apply RBAC to all protected actions.
- Audit privileged and state-changing operations.
- Do not automatically publish generated content.
- Separate draft, review, approval, and publication states.
- Keep published curriculum and reports immutable.
- Do not expose secrets, passwords, tokens, or credentials.
- Stay within the active milestone scope.
- Run the required validation commands before reporting completion.
- Report all files changed and any unresolved issues.

Permanent milestone-completion policy:

- Work strictly in roadmap sequence.
- Do not start a new milestone until the current milestone is fully implemented, validated, tested, documented, committed, reviewed, and pushed.
- Do not leave placeholder or partial implementations inside an approved milestone.
- If required scope is incomplete, stop and complete it before proceeding.
- Documentation must describe implemented behavior only.
- End each milestone with: completed scope, incomplete scope, validation results, files changed, commit hashes, push status, remaining risks, and exact next milestone.
- Do not claim completion from editor diagnostics, partial test runs, or historical logs; rerun required validations from final committed state.
- Do not mix unrelated files into milestone commits.
