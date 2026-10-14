# Task Codes

Assign a code to every scoped task before implementation starts.

## Format

`OMA-W###-T###`

- `OMA` — fixed prefix.
- `W###` — work unit number, zero-padded to 3 digits.
- `T###` — task number within the work unit, zero-padded to 3 digits.

Example: `OMA-W001-T003`.

## Work Units

Assign a fresh `W###` to every workflow invocation. A work unit is one run of one workflow.

- `/oma:complex "add auth"` -> `W001`
- `/oma:complex "add api"` -> `W002`
- `/oma:medium "fix login"` -> `W003`

Work units are globally sequential. Never restart numbering per workflow type. This guarantees every code in the project is unique.

## Assignment Rules

- Assign codes at planning time, before implementation starts.
- Assign codes yourself. Do not delegate assignment.
- Never change a code once assigned.
- Never reuse a code for a different task.
- Record every assigned code in `task-ledger.md` with its workflow run.

## Placement Rule

Require every code to appear as a comment above the code it implements.

Instruct the implementation team to place the code above every production-code change. Instruct the testing team to place the code above every test added. Instruct the verification team not to place codes — it does not modify code.

Comment syntax:

- Python: `# [OMA-W001-T003] ...`
- JavaScript / TypeScript: `// [OMA-W001-T003] ...`
- Go / Rust / Java / Kotlin: `// [OMA-W001-T003] ...`
- SQL: `-- [OMA-W001-T003] ...`
- YAML: `# [OMA-W001-T003] ...`
- Markdown: `<!-- [OMA-W001-T003] ... -->`

## Statuses

Use exactly one status per code in `task-ledger.md`:

- `planned` — code assigned, task not started.
- `in-progress` — being worked on.
- `done` — code submitted, awaiting verification.
- `verified` — confirmed by verification.
- `blocked` — cannot proceed; record the reason in `task-registry.md`.
- `deprecated` — cancelled or superseded; the code may be removed from the codebase. Record the reason in `task-registry.md`.

## Deprecation

When a task is cancelled, superseded, or its code is intentionally removed:

1. Set its status to `deprecated` in `task-ledger.md`.
2. Record the reason in `task-registry.md`.
3. Remove the code from the codebase if it is still present.

Deprecated codes are not checked for presence. If a deprecated code still appears in the codebase, verification emits a warning.

## Rules

- A task without its code in the codebase is incomplete.
- Every code with status `done` or `verified` must exist in the codebase.
- Every code in the codebase must have a row in `task-ledger.md`.
- Every code row must carry a `Workflow` column naming its workflow run.
- Route violations to the responsible team for rework.

## Reference

- `state.md` — where `task-ledger.md` lives and how workflow runs are tracked.
- `verification.md` — script that verifies these rules.
