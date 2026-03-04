# Agent Team Assembly Guide

Use this guide to run OmG with dynamic, task-fit teams instead of fixed engineering-only rosters.

## Why Dynamic Assembly

Some requests are not pure coding tasks. They mix:

- research and evidence gathering
- strategy and decision framing
- implementation and validation
- report or content packaging

`/omg:team-assemble` builds a roster that matches this shape before execution starts.

## Command Entry Points

- `/omg:team-assemble "<task>"`
- `$team-assemble "<task>"`

These entry points create a team charter with role lanes, model profile, and handoff protocol.

## Activation

No separate research-preview toggle is required in OmG.
If the extension is loaded, `team-assemble` is available through:

- `/omg:team-assemble`
- `$team-assemble`

## Stage Model

OmG lifecycle with dynamic assembly:

1. `team-assemble` (new stage 0)
2. `team-plan`
3. `team-prd`
4. `team-exec`
5. `team-verify`
6. `team-fix`

Repeat `team-exec -> team-verify -> team-fix` until criteria pass or blockers are explicit.

## Role Taxonomy

Team assembly separates two role families:

- Domain specialists:
  - `omg-researcher`
  - `omg-architect`
  - `omg-consultant`
  - `omg-executor`
- Format specialists:
  - `omg-editor`
  - `omg-reviewer`
  - `omg-verifier`
  - `omg-debugger`

Orchestration lane:

- `omg-director` coordinates handoffs and resolves conflicts.

## Model Allocation Policy

Default role-to-model policy:

- judgment and acceptance gates: `gemini-3.1-pro`
- implementation-heavy execution: `gemini-3.1-flash`
- broad low-risk exploration: `gemini-3.1-flash-lite`

This keeps budget predictable while preserving quality at key decision points.

## Approval Gate

`team-assemble` proposes first, then asks:

`Proceed with this team? (yes/no)`

Execution starts only when explicit approval is present (for example: `yes`, `approve`, `go`, `run`).

## Example Team Patterns

### 1) Competitor Analysis + Executive Brief

Suggested roster:

- `omg-director`
- `omg-researcher` x3 (parallel lanes)
- `omg-consultant`
- `omg-editor`
- `omg-reviewer` (quality gate)

### 2) Feature Delivery with Validation Discipline

Suggested roster:

- `omg-director`
- `omg-planner`
- `omg-product`
- `omg-executor`
- `omg-reviewer`
- `omg-verifier`
- `omg-debugger`

### 3) Research-to-Implementation Bridge

Suggested roster:

- `omg-director`
- `omg-researcher` x2
- `omg-architect`
- `omg-executor`
- `omg-verifier`
- `omg-editor`

## State Files

When filesystem tools are available, OmG can persist:

- `.omg/state/team-assembly.md`
- `.omg/state/workflow.md`

Use these to resume sessions without rebuilding the full decision context.

## Recommended Sequence

```text
/omg:doctor team
/omg:intent "<task>"
/omg:team-assemble "<task>"
# approve roster
/omg:team "<same task>"
/omg:loop "Continue unresolved verify backlog"
```

## Failure Handling

If the team stalls:

1. Re-run `/omg:team-assemble` with tighter constraints.
2. Reduce lane count and simplify role overlap.
3. Force verification-first loop via `/omg:team-verify`.
4. Use `/omg:consensus` when strategy lanes disagree.
