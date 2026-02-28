# OmG Core Context

This extension provides a multi-agent workflow layer for Gemini CLI.

## Core Principles

1. Keep prefixes stable.
- Avoid rewriting static instructions during a session.
- Put changing details in the latest user message.

2. Plan before coding on non-trivial tasks.
- Use planning first, then execution, then review.
- Keep each phase explicit and verifiable.

3. Delegate by role.
- Use `omg-architect` for design and tradeoffs.
- Use `omg-planner` for task decomposition.
- Use `omg-product` for PRD-quality scope and acceptance criteria.
- Use `omg-executor` for implementation.
- Use `omg-reviewer`, `omg-verifier`, and `omg-debugger` for quality and recovery.

4. Minimize context load.
- Read only files needed for the current step.
- Summarize before handing off to another agent.

5. Always finish with validation.
- Run relevant tests and checks when possible.
- Report changed files, known risks, and next actions.

6. Gate intent before execution when scope is unclear.
- Use `intent` to classify whether the task should go to planning, PRD, execution, verification, or research.
- Do not jump to implementation if acceptance criteria are missing.

7. Keep loop discipline for incomplete work.
- Use `loop` to continue `team-exec -> team-verify -> team-fix` cycles.
- Do not mark done while blocker/major items remain.

## Team Pipeline Stages

Use this stage order for complex work:

1. `team-plan` - decompose and map dependencies
2. `team-prd` - lock scope, constraints, and acceptance criteria
3. `team-exec` - implement one validated slice at a time
4. `team-verify` - run correctness/regression checks
5. `team-fix` - patch only issues found in verification

Repeat `team-exec -> team-verify -> team-fix` until acceptance criteria pass or a blocker is escalated.

## Intake and Rule Controls

- `intent`: request-intent gate and stage routing.
- `rules`: conditional rule-pack activation (`tests-required`, `migration-safety`, `security-review`, `docs-sync`, `perf-watch`).
- `memory`: maintain durable memory index (`MEMORY.md`) and modular rule packs (`.omg/rules/*.md`).
- `deep-init`: one-time deep repository mapping before long sessions.
- `loop`: strict continuation loop for unresolved acceptance criteria.
- `hud`: visual status profile control (`normal`, `compact`, `hidden`) for `/omg:status`.
- `hooks`: extension-native hook trigger/policy control for deterministic lanes and safer autonomous loops.

## Operating Modes

- `balanced` (default): stable quality/speed mix.
- `speed`: favor short cycles and narrower diffs.
- `deep`: favor design depth and stricter verification.
- `autopilot`: iterative multi-stage execution until done/blocker.
- `ralph`: strict quality-gated orchestration with no skipped verify gate.
- `ultrawork`: throughput mode for many independent or batchable tasks.

## Runtime State Conventions

When filesystem tools are available, persist current workflow state:

- `.omg/state/mode.json`
- `.omg/state/workflow.md`
- `.omg/state/checkpoint.md`
- `MEMORY.md`
- `.omg/memory/*.md`
- `.omg/rules/*.md`
- `.omg/state/intent.md`
- `.omg/state/rules.md`
- `.omg/state/deep-init.md`
- `.omg/state/project-map.md`
- `.omg/state/validation.md`
- `.omg/state/hud.json`
- `.omg/state/hooks.json`
- `.omg/state/hooks-validation.md`
- `.omg/state/hooks-last-test.md`
- `.omg/hooks/*.md`

If these files do not exist, create them only when a mode/lifecycle command is explicitly requested.

## Safety Rails

- Never claim completion without listing what was validated.
- Never claim completion while `loop` status is `continue` or unresolved blockers remain.
- Stop autonomous loops when blocked by missing requirements, missing permissions, or repeated failures.
- Default maximum autonomous cycles: 5 unless user requests a different limit.
- Keep side-effect hooks disabled in delegated worker sessions unless user explicitly opts in.
