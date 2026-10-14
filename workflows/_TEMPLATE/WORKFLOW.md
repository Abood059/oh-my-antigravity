---
name: <workflow-name>
description: <one-line description of what this workflow is for.>
teams:
  - <team-1>
  - <team-2>
gates:
  before_completion: true
---

# <Workflow Display Name>

## Stages

1. **<stage-1>** — <what happens in this phase>.
2. **<stage-2>** — <what happens in this phase>.

## Flow

1. The Coordinator receives the task.
2. The Coordinator delegates to the <team-1> team (Phase 1).
3. The <team-1> agent returns a Final Report.
4. The Coordinator runs `scripts/verify-ledger.js --workflow=<run> --mode report`.
5. The Coordinator delegates to the <team-2> team (Phase 2).
6. The <team-2> agent returns a Final Report.
7. If bugs or findings are reported, the Coordinator routes them back to Phase 1.
8. The loop repeats until the final phase signs off.
9. The Coordinator emits the gate report and the Final Deliverable Report.

## Loop Limit

Maximum <N> cycles. On reaching the limit, stop and escalate to the user with a full report.

## Coordinator

Read `coordinator.md`.
