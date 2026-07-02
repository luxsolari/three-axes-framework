# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1] - 2026-07-02

### Changed
- **Third fresh-eyes pass:** moved README's "Troubleshooting" section from
  between Installation and Quickstart to after Research basis, right before
  License. A first-time reader following the doc top-to-bottom used to hit
  an SSH-permission-denied troubleshooting block (with key-generation
  instructions) immediately after the install commands, before ever seeing
  the success-path Quickstart — reading like "expect this to fail" rather
  than "here's a fix if it does." Also added a note pointing at the cited
  upstream issue's current status, since the troubleshooting content pins a
  specific Claude Code version (`v2.1.80`) that may no longer apply by the
  time someone reads it.

## [1.2.0] - 2026-07-02

### Fixed
- **Command invocation syntax.** All four subcommands (`setup`, `status`, `mode`, `set`) lived at `commands/three-axes/*.md` — a nested folder — while every doc (this README, all command files' own cross-references, SKILL.md) consistently documented space-separated invocation (`/three-axes setup`). Claude Code documents commands as flat `.md` files with no specified nested-folder namespacing convention, unlike `skills/` which explicitly uses colon-namespacing (`/plugin:skill`). Rather than leave that ambiguous, flattened the files to `commands/three-axes-{setup,status,mode,set}.md` and updated every reference to the now-unambiguous hyphenated form (`/three-axes-setup`, `/three-axes-status`, `/three-axes-mode`, `/three-axes-set`) — the same pattern this project's own bare `/three-axes` and `/three-axes-framework` commands already used successfully.
- **README's Installation and Quickstart bash blocks used `claude plugins marketplace add` / `claude plugins install`** (plural "plugins") — the documented CLI is singular (`claude plugin marketplace add`, `claude plugin install`). As written, these would likely have failed if run literally.
- **CONTRIBUTING.md's remote-marketplace install command was missing the `luxsolari/` owner prefix** (`lux-solari-plugins` instead of `luxsolari/lux-solari-plugins`), inconsistent with every other instance in this project and in sage-instructor.
- **CONTRIBUTING.md referenced an unexplained `@local` marketplace** ("if you have the local marketplace configured" — never said how). Replaced with the verified `claude --plugin-dir .` flow for local testing, matching the fix applied to sage-instructor.
- **Second-pass review caught a self-inflicted ordering bug**: the first pass's new `/three-axes` / `/three-axes-framework` subsection was inserted between `/three-axes-set`'s example block and its "Valid values" list, breaking a logical grouping that belongs together. Moved the bare-invocation subsection after the valid-values list instead.

### Added
- README's Commands section now documents the bare `/three-axes` / `/three-axes-framework` invocation (added in 1.1.2/1.1.3) — it was shipped but never listed alongside the other four commands.
- License and version badges in README, both linked (to `LICENSE` and `CHANGELOG.md` respectively).
- **`.github/workflows/ci.yml`.** This project had no CI at all. Runs the profile unit tests (`node --test hooks/lib/__tests__/profile.test.mjs`) and a plugin-manifest/hooks-config JSON sanity check on every push/PR to `main` — mirroring the Tier 1 CI gate set up in sage-instructor.

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
