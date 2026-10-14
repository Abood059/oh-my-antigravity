---
name: exec-complex
description: Run the exec-complex four-phase workflow for complex, high-risk tasks. Use when a task is critical, security-sensitive, or requires the highest quality gates. Triggers include "exec-complex workflow", "critical feature", "high-risk change", "security-sensitive implementation".
---

# exec-complex Workflow

Execute the exec-complex four-phase workflow: risk assessment, implementation, testing, then independent verification.

## Steps

1. Identify the plugin root. It is the parent of this skill directory.
2. Read these files from the plugin root:
   - `workflows/exec-complex/WORKFLOW.md`
   - `workflows/exec-complex/coordinator.md`
   - `workflows/exec-complex/skills.yml`
3. Follow the instructions in `coordinator.md` exactly.

## Rules

- Never read a `SKILL.md` file or a `CONSTITUTION.md` file as the Coordinator.
- Never write code or tests as the Coordinator.
- The Coordinator delegates all work to subagents.
- Pass full absolute paths to subagents.

## Objective

$ARGUMENTS
