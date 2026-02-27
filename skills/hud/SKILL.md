---
name = "hud"
description = "Control OmG visual HUD profile and keep status output readable in normal, compact, or hidden mode."
---

## Purpose

Use this skill to improve status readability for long sessions and different terminal densities.

## Trigger

- User asks for better visual status output
- Team needs compact updates in narrow terminals
- User wants to hide/show status visuals quickly

## Workflow

1. Identify requested visibility profile (`normal`, `compact`, `hidden`).
2. Update/persist `.omg/state/hud.json` when filesystem tools are available.
3. Return a HUD preview line matching the selected profile.
4. Recommend `/omg:status` as verification.

## Output Template

```markdown
## HUD Profile
- requested:
- applied:

## Preview
~~~text
[OMG][MODE ...][STAGE ...][TASKS ...][RISKS ...][NEXT ...]
~~~

## Next Command
- /omg:status
```
