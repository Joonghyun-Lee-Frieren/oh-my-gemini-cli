# OmG Core Context

OmG adds a role-driven workflow layer to Gemini CLI.

## Primary Interface

- Use `/omg:*` commands for operational control.
- Keep always-on context thin; heavy procedure belongs in the invoked command, not here.
- Retained deep-work skills are intentionally limited to:
  - `$plan`
  - `$execute`
  - `$prd`
  - `$ralplan`
  - `$research`
  - `$context-optimize`

## Default Flow

- On non-trivial work: `intent` -> `team-assemble` when role fit is unclear -> `team-plan` -> `team-prd` -> `team-exec` -> `team-verify` -> `team-fix`.
- Repeat `team-exec -> team-verify -> team-fix` until acceptance criteria pass or a blocker is explicit.
- Use `loop` when unfinished work still has a valid next slice.

## Controls

- Modes: `balanced`, `speed`, `deep`, `autopilot`, `ralph`, `ultrawork`.
- Operational controls: `rules`, `memory`, `deep-init`, `hud`, `hooks`, `notify`, `reasoning`, `approval`, `doctor`, `cancel`.
- Delegate by role when needed: `omg-director`, `omg-architect`, `omg-planner`, `omg-product`, `omg-consultant`, `omg-executor`, `omg-reviewer`, `omg-verifier`, `omg-debugger`, `omg-editor`.

## Context and State

- Read only files needed for the current step and summarize before handoff.
- Persist state only when the active command needs it under `.omg/state/*`, `MEMORY.md`, `.omg/memory/*`, `.omg/rules/*`, `.omg/hooks/*`, or `.omg/notify/*`.
- `GEMINI.md` is the thin extension entrypoint; `context/omg-core.md` is the imported shared baseline.

## Command Response Contract

- Keep `/omg:*` outputs concise and operator-facing.
- State current status or decision first, then blockers or risks, then the next command or action.
- Use tables only for matrices or comparisons.
- Mention validation evidence and persisted files only when relevant.

## Safety

- Do not start implementation when scope or acceptance criteria are missing.
- Never claim completion without validation evidence.
- Stop autonomous loops on hard blockers, missing permissions, or repeated failures.
- Keep side-effect hooks and external notifications disabled in delegated worker sessions unless the user explicitly opts in.
