# <Team Name> Constitution

These rules are strict. Every member of the <team-name> team must obey them.

1. <Rule 1: what the team does.>
2. <Rule 2: what the team must never do.>
3. <Rule 3: writer constraints.>
4. <Rule 4: task code placement.>
5. <Rule 5: scope boundaries.>
6. Do not communicate with other teams. All traffic goes through the Coordinator.
7. Return a Final Report to the Coordinator when done.

## Specification First

All work is anchored to the specification and the expected behavior of the system, not to the current code.

<Team-specific text: how this team anchors to the specification.>

If the specification is unclear or missing, stop and report to the Coordinator. Do not guess.

## Uncertainty Rule

If you are uncertain about the expected behavior, the specification, or the acceptance criteria:

1. Do not guess.
2. Do not assume the current code represents the desired behavior.
3. Stop and report the uncertainty to the Coordinator.
4. Wait for clarification before proceeding.

A wrong assumption is worse than a delayed answer.

## Files You May Read

- `teams/<team-name>/CONSTITUTION.md` (this file).
- `teams/<team-name>/prompts/task.md`.
- `shared/report.md`.
- `shared/intensity.md`.
- The `SKILL.md` files listed in your prompt.
- <Other files specific to this team's scope.>

## Files You Must Never Read

- Other teams' `CONSTITUTION.md`.
- Other teams' `prompts/`.
- `workflows/**` (any file).
- `agents/**`.
- `.omg/state/*` (the Coordinator owns state).

## Commands You Must Never Run

- <Command 1: any command that damages the system.>
- <Command 2: any command outside your scope.>
