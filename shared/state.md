# State Organization

Maintain four files in `.omg/state/`. You are the Coordinator — the only writer.

## Files

| File | Records | Nature |
|---|---|---|
| `orchestration-plan.md` | How work is distributed across loops and stages. | Plan. Write once. Update only when the plan changes. |
| `taskboard.md` | What tasks will be done. Uses the official format (`T1`, `T2`). | Living. Update on task status change. Never redefine its schema. |
| `task-registry.md` | Where the workflow is now: active loops, active agents, current stage, assigned tasks. | Living. Update on every event. |
| `task-ledger.md` | What was accomplished: codes, files, status, workflow run. | Permanent. Git-committed. Uses codes from `task-codes.md`. |

## Workflow Runs

Each workflow invocation creates a run identified as `<workflow-name>-<number>`.

Examples: `complex-001`, `complex-002`, `medium-001`.

Record the workflow run in `task-registry.md` under each loop, and in `task-ledger.md` under each code row.

When two workflow runs execute in parallel, isolate them by workflow run. Codes from `complex-001` never mix with codes from `complex-002`.

## Relationship

`orchestration-plan.md` records how work will be distributed. It defines loops and assigns each loop to a workflow run.

`taskboard.md` lists the tasks.

`task-registry.md` records which loop, which agent, and which stage are active at any moment. Each loop row carries its workflow run.

`task-ledger.md` records every code and its completion state. Each code row carries its workflow run.

## When to Write

- On intake: create `orchestration-plan.md`. Initialize `task-registry.md`.
- On task assignment: add rows to `task-ledger.md` with status `planned`.
- On task start: update `task-ledger.md` to `in-progress`.
- On task completion: update `taskboard.md` and `task-ledger.md`.
- On verification: update `task-ledger.md` to `verified`.
- On every agent spawn, report, or termination: update `task-registry.md`.

## Session Lock

Read `.omg/state/session-lock.json` before every write.

- If the current session owns the lock: write to `.omg/state/<file>`.
- If another session owns the lock: write to `.omg/state/sessions/<slug>/<file>` and report the conflict.

Never overwrite another session's state.

## Boundaries

- Do not redefine `taskboard.md`. It belongs to the official addon. Use its format as-is.
- Do not duplicate rules from `oma-core.md`. It is already loaded.
- Teams return reports to you. They never write shared state directly.
- Subagents never write shared state.

## Reference

- `task-codes.md` — code format and rules for `task-ledger.md`.
- `verification.md` — script that verifies the ledger.
