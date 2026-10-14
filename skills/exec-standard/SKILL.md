---
name: exec-standard
description: Run the exec-standard three-phase workflow for standard tasks. Use when a task is moderately complex and requires implementation, testing, and independent verification. Triggers include "exec-standard workflow", "standard feature with verification", "medium task".
---

# exec-standard Workflow

Execute the exec-standard three-phase workflow: implementation, testing, then independent verification.

## Steps

1. Identify the plugin root. It is the parent of this skill directory.
2. Read these files from the plugin root:
   - `workflows/exec-standard/WORKFLOW.md`
   - `workflows/exec-standard/coordinator.md`
   - `workflows/exec-standard/skills.yml`
3. Follow the instructions in `coordinator.md` exactly.

## Rules

- Never read a `SKILL.md` file or a `CONSTITUTION.md` file as the Coordinator.
- Never write code or tests as the Coordinator.
- The Coordinator delegates all work to subagents.
- Pass full absolute paths to subagents.

## Objective

$ARGUMENTS
