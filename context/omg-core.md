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
- Use `omg-executor` for implementation.
- Use `omg-reviewer` and `omg-debugger` for quality and recovery.

4. Minimize context load.
- Read only files needed for the current step.
- Summarize before handing off to another agent.

5. Always finish with validation.
- Run relevant tests and checks when possible.
- Report changed files, known risks, and next actions.
