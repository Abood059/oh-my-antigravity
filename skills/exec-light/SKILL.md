---
name: exec-light
description: Run the exec-light two-phase workflow for low-risk tasks. Use when a task is small, localized, or low-risk and requires implementation plus testing. Triggers include "exec-light workflow", "quick change with tests", "small feature".
---

# exec-light Workflow

Execute the exec-light two-phase workflow: implementation followed by testing.

## Steps

1. Identify the plugin root. It is the parent of this skill directory.
2. Read these files from the plugin root:
   - `workflows/exec-light/WORKFLOW.md`
   - `workflows/exec-light/coordinator.md`
   - `workflows/exec-light/skills.yml`
3. Follow the instructions in `coordinator.md` exactly.

## Rules

- Never read a `SKILL.md` file or a `CONSTITUTION.md` file as the Coordinator.
- Never write code or tests as the Coordinator.
- The Coordinator delegates all work to subagents.
- Pass full absolute paths to subagents.

## Objective

$ARGUMENTS
