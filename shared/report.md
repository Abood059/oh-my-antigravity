# Report Protocol

Every subagent returns a Final Report in this exact format.

**Rule:** Fill only the sections that apply to your team.
Omit sections marked for other teams entirely. Do not write "N/A" for them.

## Final Report

### Team
- Team:
- Role:
- Agent ID:
- Task ID:
- Task Code:

### Termination
- Status: goal | blocked | stopped-early
- Summary: one concise sentence.

### Evidence
- Files touched:
- Commands run (with output reference):
- Test names (if applicable):

### Issues
- Bugs found: list, or "none".
- Blockers: list, or "none".

### Scope
- Adherence: confirmed | drifted (explain).
- Out-of-scope changes: none | list.

---

## Team-Specific Sections

Add only the section that matches your team. Skip the others entirely.

### For the risk team

    ### Risk
    - Level: low | medium | high
    - Reasoning: one sentence.

### For the verification team

    ### Security
    - Findings: list, or "none".
    - Severity: critical | high | medium | low | none.
