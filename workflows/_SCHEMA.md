# Workflow Schema

A workflow is a sequence of phases that coordinates teams to complete a task. Each workflow defines its phases, the teams involved, the loop limits, and the coordinator's behavior.

## Folder Structure

A workflow folder contains three required files, plus an optional entry skill and command:

```
workflows/<workflow-name>/
├── WORKFLOW.md            — the workflow definition (phases and flow)
├── coordinator.md         — the Coordinator's instructions
└── skills.yml             — the skills assigned to each role in each phase

skills/<workflow-name>/
└── SKILL.md               — the entry skill (defines triggers)

commands/<workflow-name>.toml — the slash command entry
```

## WORKFLOW.md

Defines the phases and the transitions between them.

Required frontmatter:

```yaml
---
name: <workflow-name>           # matches the folder name
description: <one-line>         # what this workflow is for
teams:                          # list of teams used, in order
  - <team-1>
  - <team-2>
gates:
  before_completion: true       # require user approval before closing
---
```

Required sections:

- `## Stages` — a numbered list of phases.
- `## Flow` — a numbered list of steps the Coordinator follows.
- `## Loop Limit` — the maximum number of cycles before escalation.
- `## Coordinator` — a line pointing to `coordinator.md`.

Example:

```markdown
# <Workflow Display Name>

## Stages

1. **<stage-1>** — <what happens>.
2. **<stage-2>** — <what happens>.

## Flow

1. The Coordinator receives the task.
2. The Coordinator delegates to the <team-1> team (Phase 1).
3. ...

## Loop Limit

Maximum <N> cycles. On reaching the limit, stop and escalate to the user with a full report.

## Coordinator

Read `coordinator.md`.
```

## coordinator.md

The Coordinator reads this file. It defines what the Coordinator does at each phase, which files it reads, and which files it must never read.

Required sections:

1. **Team identity** — "You are the Coordinator. You do not write code, tests, or scripts."
2. **`## Plugin Root`** — describes `<plugin-root>` and lists the files it points to.
3. **`## Files You Load`** — the exact list of files the Coordinator reads before starting.
4. **`## Your Tasks`** — phase-by-phase instructions with numbered steps.
5. **`## Rules You Never Break`** — the inviolable rules.
6. **`## Hard Boundaries`** — allowed reads, forbidden reads, allowed commands.

Copy the structure from an existing workflow's `coordinator.md`.

## skills.yml

Assigns skills to roles for each phase.

Required structure:

```yaml
phases:
  phase-1:
    team: <team-name>
    roles:
      - name: <role-name>
        skills:
          - path: shared/skills/<skill-name>/SKILL.md
            intensity: high | medium | low

  phase-2:
    team: <team-name>
    roles:
      - name: <role-name>
        skills:
          - path: shared/skills/<skill-name>/SKILL.md
            intensity: high | medium | low
```

Rules:

- Each role name must exist in the team's `TEAM.md`.
- Each skill path must exist under `shared/skills/`.
- Intensity is one of `high`, `medium`, or `low`.

## skills/<workflow-name>/SKILL.md

The entry point. When the user invokes the workflow, this skill tells the main agent to read the workflow files.

Required frontmatter:

```yaml
---
name: <workflow-name>
description: <when to use this workflow. Include trigger phrases.>
---
```

Required body:

```markdown
# <Workflow Display Name> Workflow

Execute the <workflow-name> workflow.

## Steps

1. Identify the plugin root. It is the parent of this skill directory.
2. Read these files from the plugin root:
   - `workflows/<workflow-name>/WORKFLOW.md`
   - `workflows/<workflow-name>/coordinator.md`
   - `workflows/<workflow-name>/skills.yml`
3. Follow the instructions in `coordinator.md` exactly.

## Rules

- Never read a `SKILL.md` file or a `CONSTITUTION.md` file as the Coordinator.
- Never write code or tests as the Coordinator.
- The Coordinator delegates all work to subagents.
- Pass full absolute paths to subagents.

## Objective

$ARGUMENTS
```

## commands/<workflow-name>.toml

The slash command. Defines what the user types.

Required structure:

```toml
description = "<one-line description>"
prompt = """
Run the <workflow-name> workflow.

Objective:
$ARGUMENTS

The plugin root is: ${extensionPath}

Read these files from the plugin root before starting:
- ${extensionPath}/workflows/<workflow-name>/WORKFLOW.md
- ${extensionPath}/workflows/<workflow-name>/coordinator.md
- ${extensionPath}/workflows/<workflow-name>/skills.yml

You are the Coordinator for the <workflow-name> workflow.
Follow the instructions in `coordinator.md`.

Never read a SKILL.md file or a CONSTITUTION.md file.
Never write code or tests.
"""
```

## Rules for Creating a New Workflow

1. Decide which teams participate and in what order.
2. Copy `_TEMPLATE/` to a new folder under `workflows/`.
3. Rename the folder to the workflow name.
4. Fill in `WORKFLOW.md` with the phases and flow.
5. Fill in `skills.yml` with the role-to-skill mappings.
6. Copy `coordinator.md` from an existing workflow and adjust it.
7. Create the entry skill under `skills/<workflow-name>/SKILL.md`.
8. Create the command under `commands/<workflow-name>.toml`.
9. Run `agy plugin validate .` to check.
