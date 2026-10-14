# Verification

Verify `task-ledger.md` against the codebase using the verification script.

## Script

Location: `scripts/verify-ledger.js`
Runtime: Node.js. Cross-platform.

## Invocation

    node scripts/verify-ledger.js [options]

| Option | Default | Purpose |
|---|---|---|
| `--ledger <path>` | `.omg/state/task-ledger.md` | Ledger file. |
| `--root <path>` | `.` | Codebase root. |
| `--mode report\|strict` | `report` | `report` prints and exits 0. `strict` exits 1 on critical issues. |
| `--format text\|json` | `text` | Output format. |
| `--workflow <name>` | all | Filter by workflow run (e.g., `complex-001`). |
| `--by-status <status>` | all | Filter by status. |
| `--ignore-paths <csv>` | `.git,node_modules,dist,build,.next,coverage` | Paths to skip. |

## Two Usage Modes

Use two modes depending on context.

### Focused (during work)

    node scripts/verify-ledger.js --workflow <name> --mode report

Run after a team submits a report. Checks only the current workflow run. Fast. Does not surface historical deletions.

### Full (at the gate)

    node scripts/verify-ledger.js --mode strict

Run before closing a work unit or merging to a long-lived branch. Checks every code across every workflow run. Detects historical deletions and regressions.

Never use focused mode as final verification. Focused mode cannot detect a code that was deleted from an earlier workflow run.

## Checks

Enforce four checks:

1. **Ledger integrity**
   - Every code matches `OMA-W<3digits>-T<3digits>`.
   - No duplicate codes.
   - Every status is one of `planned | in-progress | done | verified | blocked | deprecated`.
   - Every row carries a `Workflow` value.

2. **Code presence**
   - Every code with status `done` or `verified` exists in the codebase.
   - Every code with status `planned` should not yet exist (warning only).
   - `blocked` codes are informational.
   - `deprecated` codes are not checked for presence. A warning is emitted if a deprecated code still appears in the codebase.

3. **Orphan detection**
   - Every code found in the codebase has a row in `task-ledger.md`.

4. **Location match (optional)**
   - If a row records `Files Touched`, the code should appear in those files.

Do not check consistency with `taskboard.md`. Out of scope.

## Handling Deletions and Refactors

When an old code is deleted from the codebase:

- If the deletion was accidental: restore the code.
- If the deletion was intentional (feature cancelled, superseded, or refactored away):
  1. Set the code's status to `deprecated` in `task-ledger.md`.
  2. Record the reason in `task-registry.md`.
  3. Remove any lingering occurrence of the code from the codebase.

Never delete a code from the ledger. Always mark it `deprecated`. The ledger is permanent.

## Handling Failures

- Missing code (`done` or `verified`): route to the implementation team for rework, or mark `deprecated` if intentionally removed.
- Orphan code: route to the responsible team to add the ledger row, or remove the code.
- Malformed code: route to the team that wrote it.
- Duplicate code in ledger: fix the ledger before proceeding.
- Missing `Workflow` value: fix the ledger before proceeding.
- Invalid status: fix the ledger before proceeding.
- Deprecated code still present: remove it from the codebase.

Do not proceed past a critical failure without explicit user approval.

## Reference

- `task-codes.md` — code format and rules.
- `state.md` — where the ledger lives and how workflow runs are tracked.
