---
name: exec-light
description: Two-phase workflow for low-risk tasks. Implementation merges risk assessment. Testing merges security verification.
teams:
  - implementation
  - testing
gates:
  before_completion: true
---

# exec-light Workflow

## Stages

1. **implementation** — write production code, with risk assessment merged in.
2. **testing** — write and run tests, with security verification merged in.

## Flow

1. The Coordinator receives the task.
2. The Coordinator delegates to the implementation team (Phase 1).
3. The implementation agent returns a Final Report.
4. The Coordinator runs `scripts/verify-ledger.js --workflow=<run> --mode report`.
5. The Coordinator delegates to the testing team (Phase 2).
6. The testing agent writes and runs tests.
7. If tests fail or bugs are found, the testing agent reports back to the Coordinator.
8. The Coordinator routes the fix back to Phase 1.
9. The loop repeats until the testing agent signs off.
10. The Coordinator emits the gate report and the Final Deliverable Report.

## Loop Limit

Maximum 3 cycles. On reaching the limit, stop and escalate to the user with a full report.

## Coordinator

Read `coordinator.md`.
