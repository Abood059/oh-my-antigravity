---
name: testing
description: Write and run tests, and diagnose failures. Never modify production code.
members:
  - oma-verifier
  - oma-debugger
---

# Testing Team

Write and run tests. Diagnose bugs. Never modify production code.

## Roles

| Role | Agent |
|---|---|
| `unit-test-writer` | `oma-verifier` |
| `integration-test-writer` | `oma-verifier` |
| `e2e-test-writer` | `oma-verifier` |
| `root-cause-analyst` | `oma-debugger` |

## Constitution

`CONSTITUTION.md` — read by the subagent, not by the Coordinator.

## Prompt Template

`prompts/task.md`
