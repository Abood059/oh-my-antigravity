---
name: exec-standard
description: Three-phase workflow for standard tasks. Implementation merges risk assessment. Testing covers unit and integration. Verification owns final sign-off.
teams:
  - implementation
  - testing
  - verification
gates:
  before_completion: true
---

# exec-standard Workflow

## Stages

1. **implementation** — write production code, with risk assessment merged in.
2. **testing** — write and run tests.
3. **verification** — security verification and final sign-off.

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
10. The Coordinator delegates to the verification team (Phase 3).
11. The verification agent audits the work and returns a Final Report.
12. If the verification reports critical findings, the Coordinator routes them back to Phase 1.
13. The loop repeats until verification signs off.
14. The Coordinator emits the gate report and the Final Deliverable Report.

## Loop Limit

Maximum 4 cycles. On reaching the limit, stop and escalate to the user with a full report.

## Coordinator

Read `coordinator.md`.
