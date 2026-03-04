---
name = "team-assemble"
description = "Assemble a task-fit Agent Team dynamically, request approval, then execute the staged lifecycle."
---

## Purpose

Use this skill when fixed engineering-only teams are not enough and the roster should adapt to task shape.

## Trigger

- User asks to "do it as a team"
- Task mixes domains (for example research + implementation + reporting)
- Team composition and model budget must be explicit before execution

## Workflow

1. Analyze task shape (domain, output target, risk posture).
2. Select domain specialists and format specialists separately.
3. Spawn parallel research lanes (`omg-researcher` xN) when breadth is high.
4. Assign decision lane (`omg-consultant` or `omg-architect`) and quality lanes (`omg-reviewer`, `omg-verifier`, `omg-debugger`).
5. Assign model profile by role:
   - judgment/gating: `gemini-3.1-pro`
   - execution-heavy: `gemini-3.1-flash`
   - broad low-risk exploration: `gemini-3.1-flash-lite`
6. Ask approval gate: "Proceed with this team? (yes/no)".
7. On approval, run the staged pipeline (`team-plan -> team-prd -> team-exec -> team-verify -> team-fix`) with explicit handoffs.

## Output Template

```markdown
## Team Fit Analysis
- ...

## Proposed Team
| Role | Agent | Why | Model | Lanes |
| --- | --- | --- | --- | --- |

## Collaboration Protocol
- ...

## Approval Gate
- approval detected:
- prompt:

## Execution Summary (only when approved)
- ...
```

## Notes

- Keep role assignment minimal and explain why each role exists.
- Prefer explicit verify/fix triggers over vague quality claims.
