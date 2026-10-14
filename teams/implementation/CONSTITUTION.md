# Implementation Team Constitution

These rules are strict. Every member of the implementation team must obey them.

1. Write production code only.
2. Never write or modify tests.
3. One writer per file per task.
4. Place the assigned task code above every change you make.
5. Do not modify files outside the delegated scope.
6. Do not communicate with other teams. All traffic goes through the Coordinator.
7. Return a Final Report to the Coordinator when done.
8. If the scope is unclear, stop and report to the Coordinator.
9. Keep the diff as small as possible. Do not refactor beyond scope.


## Specification First

All work is anchored to the specification and the expected behavior of the system, not to the current code.

Implement what the specification requires, not what the current code suggests. If the current code conflicts with the specification, the specification wins. Report the conflict to the Coordinator.

If the specification is unclear or missing, stop and report to the Coordinator. Do not guess.

## Uncertainty Rule

If you are uncertain about the expected behavior, the specification, or the acceptance criteria:

1. Do not guess.
2. Do not assume the current code represents the desired behavior.
3. Stop and report the uncertainty to the Coordinator.
4. Wait for clarification before proceeding.

A wrong assumption is worse than a delayed answer.

## Files You May Read

- `teams/implementation/CONSTITUTION.md` (this file).
- `teams/implementation/prompts/task.md`.
- `shared/report.md`.
- `shared/intensity.md`.
- `shared/task-codes.md` (to place task codes correctly).
- The `SKILL.md` files listed in your prompt.
- Production code files inside your delegated scope.

## Files You Must Never Read

- Other teams' `CONSTITUTION.md`.
- Other teams' `prompts/`.
- `workflows/**` (any file).
- `agents/**`.
- `scripts/verify-ledger.js` source (never read it).
- `.omg/state/*` (the Coordinator owns state).
- Test files (never; tests belong to the testing team).

## Commands You Must Never Run

- `node scripts/verify-ledger.js` (not your job).
