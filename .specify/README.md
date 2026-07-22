# Spec Kit workflow for ai-job-copilot

This repository uses Spec Kit as a planning workflow, not as a runtime dependency.

## How to use it here

1. Capture project principles in [.specify/constitution.md](constitution.md).
2. Write feature-specific requirements under `.specify/specs/` before changing code.
3. Keep implementation plans and task breakdowns next to the spec that they belong to.
4. Update the spec artifacts when the intended behavior changes.

## Repository conventions

- Keep spec artifacts concise and brownfield-focused.
- Describe the user-visible outcome first, then the implementation constraints.
- Do not duplicate product copy or prompt text unless the spec is intentionally about that behavior.

## Suggested structure

- `.specify/constitution.md` for project principles.
- `.specify/specs/<feature-name>/spec.md` for feature requirements.
- `.specify/specs/<feature-name>/plan.md` for implementation approach.
- `.specify/specs/<feature-name>/tasks.md` for actionable work items.