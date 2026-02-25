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
- `/omg:team` - run full stage pipeline (`team-plan -> team-prd -> team-exec -> team-verify -> team-fix`)
- `/omg:team-plan` - stage 1 planning graph
- `/omg:team-prd` - stage 2 PRD and acceptance criteria lock
- `/omg:team-exec` - stage 3 scoped implementation
- `/omg:team-verify` - stage 4 acceptance and regression verification
- `/omg:team-fix` - stage 5 targeted patch loop
- `/omg:mode` - inspect/set operation mode
- `/omg:autopilot` - autonomous iterative execution
- `/omg:ralph` - strict quality-gated mode
- `/omg:ultrawork` - high-throughput batch mode
- `/omg:consensus` - option comparison and convergence
- `/omg:launch` - initialize lifecycle state for long tasks
- `/omg:checkpoint` - save compact progress snapshot
- `/omg:stop` - graceful stop with resume handoff
- `/omg:optimize` - optimize context and cache stability
- `/omg:cache` - run cache-focused diagnostics

### Skills

- `$plan` - create a phased implementation plan
- `$ralplan` - quality-first stage-gated plan
- `$execute` - implement scoped tasks quickly
- `$prd` - define measurable scope and acceptance criteria
- `$team` - coordinate multi-agent execution
- `$autopilot` - run autonomous looped execution
- `$ralph` - strict verification-gated orchestration
- `$ultrawork` - batch throughput execution workflow
- `$consensus` - converge on best option with tradeoff table
- `$mode` - switch operating posture
- `$cancel` - stop/pause autonomous flow with checkpoint summary
- `$research` - collect and compare technical sources
- `$context-optimize` - improve context efficiency

### Sub-agents

- `omg-architect`
- `omg-planner`
- `omg-product`
- `omg-executor`
- `omg-reviewer`
- `omg-verifier`
- `omg-debugger`
- `omg-consensus`
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
1) $ralplan "feature description"
2) $prd "lock acceptance criteria"
3) /omg:team "deliver stage pipeline"
4) /omg:team-verify
5) /omg:status
```

### Bug Fix

```text
1) /omg:team-verify "reproduce and classify failure"
2) /omg:team-fix "patch verified issues"
3) /omg:team-verify "confirm fix"
```

### Research Then Build

```text
1) $research "topic"
2) $consensus "choose architecture from findings"
3) /omg:team-plan
4) /omg:team-exec
```
