---
name: exec-complex
description: Four-phase workflow for complex, high-risk tasks. Risk assessment, implementation, testing, and independent verification.
teams:
  - risk
  - implementation
  - testing
  - verification
gates:
  before_completion: true
---

# exec-complex Workflow

## Stages

1. **risk** — assess change risk before any code is written.
2. **implementation** — write production code.
3. **testing** — write and run tests covering normal paths and edge cases.
4. **verification** — security verification, architectural verification, and final sign-off.

## Flow

1. The Coordinator receives the task.
2. The Coordinator delegates to the risk team (Phase 1).
3. The risk agent returns a Final Report with a risk level.
4. The Coordinator delegates to the implementation team (Phase 2), passing the risk level.
5. The implementation agent returns a Final Report.
6. The Coordinator runs `scripts/verify-ledger.js --workflow=<run> --mode report`.
7. The Coordinator delegates to the testing team (Phase 3).
8. The testing agent writes and runs tests.
9. If tests fail or bugs are found, the testing agent reports back to the Coordinator.
10. The Coordinator routes the fix back to Phase 2.
11. The loop repeats until the testing agent signs off.
12. The Coordinator delegates to the verification team (Phase 4).
13. The verification agent audits the work and returns a Final Report.
14. If critical findings are reported, the Coordinator routes them back to Phase 2.
15. The loop repeats until verification signs off.
16. The Coordinator emits the gate report and the Final Deliverable Report.

## Loop Limit

Maximum 5 cycles. On reaching the limit, stop and escalate to the user with a full report.

## Coordinator

Read `coordinator.md`.
