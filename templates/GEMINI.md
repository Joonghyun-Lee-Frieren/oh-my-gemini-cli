# GEMINI.md - Project Context Template for oh-my-gemini-cli

> This file is a template used as project context for Gemini CLI sessions.
> Replace placeholders with project-specific details.

---

# {{PROJECT_NAME}}

## Project Overview

Write a 1-3 sentence description of this project.

- **Language/Framework**: Example: TypeScript, Node.js, React
- **Build System**: Example: esbuild, webpack, vite
- **Testing**: Example: vitest, jest
- **Package Manager**: Example: npm, pnpm, yarn

## Directory Structure

```text
{{PROJECT_NAME}}/
|- src/       # Source code
|- tests/     # Tests
|- docs/      # Documentation
`- ...
```

## Coding Conventions

- Example: function names use camelCase, class names use PascalCase
- Example: use relative imports and include `.js` extension where required
- Example: use consistent error handling (try/catch or result-style)

## Core Commands

```bash
<package-manager> install
<package-manager> run build
<package-manager> run test
<package-manager> run dev
```

---

## oh-my-gemini-cli Integration

This project can use OmG workflows through Gemini CLI extensions.

### Commands

- `/omg:status` - summarize progress and risks
- `/omg:team` - run a multi-agent flow
- `/omg:optimize` - optimize context and cache stability
- `/omg:cache` - run cache-focused diagnostics

### Skills

- `$plan` - create a phased implementation plan
- `$execute` - implement scoped tasks quickly
- `$team` - coordinate multi-agent execution
- `$research` - collect and compare technical sources
- `$context-optimize` - improve context efficiency

### Sub-agents

- `omg-architect`
- `omg-planner`
- `omg-executor`
- `omg-reviewer`
- `omg-debugger`
- `omg-researcher`
- `omg-quick`

---

## Context Engineering Guidelines

1. Keep stable instructions stable during a session.
2. Avoid unnecessary re-sending of large context blocks.
3. Delegate deep design work and coding work by role.
4. Keep file reads focused to relevant paths.
5. Validate with tests/checks before concluding work.

## Project-Specific Notes

Add repository-specific constraints here.

- Example: Never commit `.env` files.
- Example: Do not edit `src/legacy/` without approval.
- Example: Update `docs/api.md` when API behavior changes.

## Common Workflows

### New Feature

```text
1) $plan "feature description"
2) $team "feature delivery"
3) /omg:status
4) /prompts:reviewer
```

### Bug Fix

```text
1) /prompts:debugger "error details"
2) $execute "apply fix"
3) /prompts:reviewer
```

### Research Then Build

```text
1) $research "topic"
2) $plan "implementation plan from findings"
3) $execute "phase 1"
```
