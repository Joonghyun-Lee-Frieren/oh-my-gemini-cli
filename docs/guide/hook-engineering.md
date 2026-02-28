# Hook Engineering Guide

OmG provides an extension-native hook layer for deterministic orchestration and safer autonomy loops.

## Why This Layer Exists

- Prevent repeated regressions in long `exec -> verify -> fix` loops
- Detect stall/drift signals earlier
- Apply guardrails without inflating the base prompt every turn

## Native Events

Hooks can be attached to these core events:

- `session-start`
- `stage-transition`
- `pre-verify`
- `post-verify`
- `checkpoint-save`
- `blocker-raised`
- `session-stop`

## Derived Signals

Derived signals are optional and evaluated from runtime/session state:

- `context-drift`
- `risk-spike`
- `loop-stall`
- `token-burst`
- `blocker-repeat`

## Deterministic Lanes

Use a fixed lane order to keep behavior predictable:

1. `P0-safety`
2. `P1-quality`
3. `P2-optimization`

Recommended behavior:

- `P0-safety`: fail-closed only for explicit safety violations
- `P1-quality`: retryable, with bounded timeout/debounce
- `P2-optimization`: fail-open to avoid blocking delivery

## Efficiency Controls

- Idempotency key per `(event, task, stage)` tuple
- Debounce repeated triggers in noisy loops
- Timeout budgets per lane
- Cooldown for repeatedly failing hooks

## Team Safety Policy

In delegated/worker sub-agent turns:

- Side-effect hooks stay disabled by default
- Read-only diagnostics and guardrail hooks remain available
- Side effects require explicit user opt-in

## Suggested Workflow

1. `/omg:hooks-init`
2. `/omg:hooks`
3. `/omg:hooks-validate`
4. `/omg:hooks-test`

Then run `/omg:autopilot` or `/omg:loop` with validated hook policy.
