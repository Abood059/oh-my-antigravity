# Team Schema

A team is a reusable unit of work. It has one responsibility, a fixed roster of agents, a strict constitution, and a prompt template.

## Folder Structure

A team folder contains three required files:

```
teams/<team-name>/
├── TEAM.md                — the team definition (read by the Coordinator)
├── CONSTITUTION.md        — the strict rules (read by the subagent)
└── prompts/
    └── task.md            — the prompt template (filled by the Coordinator)
```

## TEAM.md

The Coordinator reads this file to know what the team does and which agents it uses.

Required frontmatter:

```yaml
---
name: <team-name>          # matches the folder name
description: <one-line>    # what the team does and does not do
members:                   # list of agent names that belong to this team
  - <agent-1>
  - <agent-2>
---
```

Required sections:

- `## Roles` — a table mapping roles to agents.
- `## Constitution` — a line pointing to `CONSTITUTION.md`.
- `## Prompt Template` — a line pointing to `prompts/task.md`.

Example:

```markdown
# <Team Display Name>

<One sentence stating the team's single responsibility.>

## Roles

| Role | Agent |
|---|---|
| `role-1` | `agent-1` |
| `role-2` | `agent-2` |

## Constitution

`CONSTITUTION.md` — read by the subagent, not by the Coordinator.

## Prompt Template

`prompts/task.md`
```

## CONSTITUTION.md

The subagent reads this file. It contains the strict rules the team must obey.

Required sections:

1. **Team rules** — numbered list at the top.
2. **`## Specification First`** — anchor work to the specification, not the current code.
3. **`## Uncertainty Rule`** — stop and report instead of guessing.
4. **`## Files You May Read`** — exact list of files this team is allowed to read.
5. **`## Files You Must Never Read`** — explicit list of forbidden files.
6. **`## Commands You Must Never Run`** — commands that damage the system.

Copy the structure from an existing team's `CONSTITUTION.md`.

## prompts/task.md

The Coordinator fills this template with values and passes it to the subagent.

Required structure:

```markdown
You are acting as **{{ROLE}}** in the **{{TEAM}}** team.

## Required Reading

Read these files before starting. Use your read_file tool.

- `teams/{{TEAM}}/CONSTITUTION.md` — team rules.
- `shared/report.md` — report format.
- `shared/intensity.md` — skill intensity levels.

Skills:

{{SKILL_PATHS_WITH_INTENSITY}}

## Task

- Task ID: {{TASK_ID}}
- Workflow: {{WORKFLOW}}
- Task Code: {{TASK_CODE}}
- Target: {{TARGET}}
- Scope: {{SCOPE}}
- Files allowed: {{FILES_ALLOWED}}
- Files forbidden: {{FILES_FORBIDDEN}}
- Acceptance criteria: {{ACCEPTANCE}}
- Risk level (if provided): {{RISK_LEVEL}}
```

Adjust the placeholders to match the roles this team performs.

## Rules for Creating a New Team

1. Copy `_TEMPLATE/` to a new folder.
2. Rename the folder to the team's task.
3. Fill in `TEAM.md` with the roles and agents.
4. Fill in `CONSTITUTION.md` with the strict rules.
5. Adjust `prompts/task.md` if needed.
6. Add the team to a workflow's `skills.yml`.
7. Run `agy plugin validate .` to check.
