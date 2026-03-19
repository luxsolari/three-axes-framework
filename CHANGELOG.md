# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-03-19

### Added
- Three-tier interaction model: persistent profile → session commands → conversational signals
- Profile cascade: global (`~/.claude/three-axes-profile.json`), project (`.three-axes.json`), session (`~/.claude/three-axes-session.json`)
- First-run detection: auto-triggers `/three-axes setup` when no profile exists
- `/three-axes setup` command — interactive axis configuration
- `/three-axes status` command — shows resolved profile with source labels
- `/three-axes mode <preset>` command — named presets (learning, output, production, explore, balanced)
- `/three-axes set` command — granular axis control with `--project` and `--global` scope flags
- Tier-3 signal axis mappings and duration semantics documented in SKILL.md
- Profile utility module (`hooks/lib/profile.mjs`) with unit tests
- `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`

## [1.0.0] - 2026-03-19

### Added
- Initial release: SessionStart hook with silent framework injection
- `three-axes-framework` skill with six principles, quick reference, and mode-switch signals
- Three axes defined: Mastery, Consequence, Intent
