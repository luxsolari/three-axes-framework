# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.3] - 2026-03-19

### Added
- `/three-axes-framework` bare invocation as an alias for `/three-axes` — handles users invoking by plugin name

## [1.1.2] - 2026-03-19

### Added
- `/three-axes` bare invocation now shows active profile and command reference

## [1.1.1] - 2026-03-19

### Fixed
- `/three-axes setup` now explicitly invokes the `AskUserQuestion` tool with pre-selected options, ensuring consistent interactive UI across all environments
- Removed unreachable first-run auto-prompt from SessionStart hook — Claude cannot initiate conversation, so setup must be run manually after installation
- Post-setup summary now always shows all six framework principles with per-profile descriptions, and documents all three adjustment tiers (presets, granular set, conversational signals)

### Added
- Quickstart section to README
- Context window cost note in README (≈2,400 tokens, one-time per session)

### Changed
- README `/three-axes setup` description updated to reflect manual first-run requirement

## [1.1.0] - 2026-03-19

### Added
- Three-tier interaction model: persistent profile → session commands → conversational signals
- Profile cascade: global (`~/.claude/three-axes-profile.json`), project (`.three-axes.json`), session (`~/.claude/three-axes-session.json`)
- First-run detection: prompts user to run `/three-axes setup` when no profile exists
- `/three-axes setup` command — interactive axis configuration
- `/three-axes status` command — shows resolved profile with source labels
- `/three-axes mode <preset>` command — named presets (learning, output, production, explore, balanced)
- `/three-axes set` command — granular axis control with `--project` and `--global` scope flags
- Tier-3 signal axis mappings and duration semantics documented in SKILL.md
- Profile utility module (`hooks/lib/profile.mjs`) with unit tests
- `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`

## [1.0.0] - 2026-03-18

### Added
- Initial release: SessionStart hook with silent framework injection
- `three-axes-framework` skill with six principles, quick reference, and mode-switch signals
- Three axes defined: Mastery, Consequence, Intent
