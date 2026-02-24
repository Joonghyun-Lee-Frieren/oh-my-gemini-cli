# Changelog

All notable changes to oh-my-gemini-cli are documented here.

---

## v0.2.0 - Extensions-First Rebuild (2026-02-24)

Reimplemented OmG around Gemini CLI's official Extensions model.

### Added
- Root extension manifest: `gemini-extension.json`
- Extension-first package metadata: `package.json`
- Sub-agents in `agents/`
- Shared context in `context/omg-core.md`
- Namespaced commands in `commands/omg/`
- Frontmatter-based skills in `skills/`

### Changed
- Installation flow migrated to `/extensions install ...`
- Documentation rewritten for extension-native usage
- Korean README updated to extension structure

### Removed
- Legacy root-level command templates that depended on `!{omg ...}` shell execution

---

## Notes

Earlier pre-extension CLI-focused history is available in git history before `v0.2.0`.
