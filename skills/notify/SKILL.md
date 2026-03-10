---
name = "notify"
description = "Configure OmG notification routing for approvals, verification outcomes, blockers, checkpoints, and idle watchdog alerts."
---

## Purpose

Use this skill to keep long-running OmG sessions observable without enabling unsafe side effects by default.

## Trigger

- User asks for alerts, notifications, webhook routing, or desktop ping behavior
- Long autonomous runs need visibility into approvals, blockers, or verification failures
- Team wants an idle watchdog for unattended `autopilot` or `loop` sessions

## Workflow

1. Identify the notification profile (`quiet`, `balanced`, `watchdog`) and desired channels (`desktop`, `terminal-bell`, `file`, `webhook`).
2. Map events to channels:
   - `approval-needed`
   - `team-approved`
   - `verify-passed`
   - `verify-failed`
   - `blocker-raised`
   - `checkpoint-saved`
   - `idle-watchdog`
   - `session-stop`
3. Apply safety gates:
   - external channels are opt-in only
   - delegated/worker sessions cannot emit external notifications
   - webhook bridges must keep secrets outside prompt text
4. Persist/update `.omg/state/notify.json` and `.omg/notify/*.md` scaffolding when filesystem tools are available.
5. Recommend adjacent controls such as `/omg:approval`, `/omg:hooks`, or `/omg:autopilot` when relevant.

## Output Template

```markdown
## Notification Plan
- profile:
- channels:
- template:
- idle watchdog:

## Event Matrix
| Event | Channel | Rationale |
| --- | --- | --- |

## Safety Notes
- ...

## Next Command
- ...
```
