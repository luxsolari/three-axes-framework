# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2026-09-07

### Added
- Guided first-run setup in chat using native interactive option pickers when
  available, one question at a time, with global/project scope selection and a
  dedicated profile writer. Prompt and tool hooks keep project work paused until
  a valid persistent profile exists; session overrides alone do not unlock work.
- Integration coverage for setup, invalid profiles, tool denial, profile writes,
  project-root discovery, and startup/resume behavior.

### Fixed
- Session injection reads the host's `source` and `cwd` fields, preserving session
  overrides on resume/clear/compact and resolving the correct project profile.
- Claude context uses the documented `hookSpecificOutput` envelope.
- Invalid profile layers no longer override the resolved baseline.

## [1.4.0] - 2026-09-07

### Changed
- `/three-axes-log` now writes to `JOURNAL.md` with a `# Journal` heading, instead of
  `BITACORA.md` / `# Bitácora`. The `CLAUDE.md` snippet the command tells agents to add was
  updated to match, as were the command tables in `/three-axes` and `/three-axes-framework`
  and the description in `SKILL.md`. Nothing else about the command changed: the entry
  template, the newest-first ordering, the write-in-the-repo's-language rule and the
  compaction policy are untouched.
- On a repository that already carries a `BITACORA.md`, the command now renames it rather
  than starting a second log beside it.

## [1.3.0] - 2026-08-30

### Added
- **The Integrity Rules (IR-01 … IR-13)** in `SKILL.md`. The six principles govern how much
  the AI does; these thirteen govern how honestly it does it — closing the failure modes that
  erode trust in AI-assisted work: self-certification, confident guessing, silent scope creep,
  guess-patch loops, unrequested "cleanup" of comments and docs, and apology loops that
  displace the useful reply, and reflexive agreement that hides a wrong assumption instead of
  correcting it. Each rule carries an ID so either side of the conversation can cite a
  specific rule instead of arguing about vibes.

  The rules are always in force; the *ceremony* around them scales with the axes. Consequence
  high makes IR-02 (diagnose before patching) and IR-08 (close with a status) formal and
  written down; consequence low with output intent compresses both to one line. Mastery low
  weights IR-03 and IR-09 most heavily — a developer still building intuition cannot catch a
  confident wrong answer or recognise misplaced blame.

- **`/three-axes-audit [what went wrong]`** — the recovery path when a rule is broken. The
  audit turn is constrained: no code, no apology, no resuming the interrupted task. It names
  the violated rule by ID with the offending output quoted, gives a *mechanical* account of
  the cause (an instruction fell out of recent context; an assumption replaced a missing
  input) rather than a moral one ("I should have been more careful"), proposes a concrete
  correction mechanism, and rates the session `CLEAN` / `DEGRADED` / `COMPROMISED`.

  If no existing rule covers the failure, the command requires saying so and proposing a
  candidate rule rather than manufacturing a confession — a ruleset that grows out of real
  failures is worth more than one that produces guilt on demand.

- **`/three-axes-handoff [output-path]`** — a continuity document for a fresh session, for
  when the context window is saturated or corrections have stopped sticking. Captures the
  two things handoffs habitually lose: a **failure log** (every approach tried and abandoned,
  with the reason, so the next session does not re-derive the same dead ends) and an
  **intent map** (code that looks removable but is load-bearing — unreferenced functions,
  defensive branches, deliberate duplication). Closes with an explicit caveat that the
  outgoing diagnosis is a hypothesis to verify; if it were reliable the handoff would
  probably not have been needed.

- **`/three-axes-log [note]`** — appends a completed-task entry to `BITACORA.md` at the repo
  root. IR-08 closes the loop inside the conversation; this closes it on disk, so the next
  agent to open the repo reads what was done, verified, left open and ruled out instead of
  re-deriving it from the diff and burning tokens rebuilding context that already existed.

  Entries are newest-first and written in the language the repository already uses. Past
  ~40 entries the log compacts: everything older than the most recent 15 folds into a
  one-line-per-entry historical summary. Compaction is lossy by design but never drops a
  **decision** or a **recorded failure** — those are exactly what stop a later session
  re-litigating a settled question or re-walking a dead end; routine detail goes instead.
  The command's page carries a `CLAUDE.md` / `AGENTS.md` block to paste into a repo so every
  agent working there maintains the same log.

- `tests/plugin-structure.test.mjs` — asserts every command file has parseable frontmatter
  with a `description`, that IR IDs in `SKILL.md` are unique and contiguous from IR-01, that
  every command referenced in the docs and in either command menu exists on disk, that every
  shipped command has a row in both menus and the two menus agree, and that `plugin.json`'s
  version matches the README badge and the newest CHANGELOG entry. Wired into CI alongside the
  existing profile tests.

### Changed
- SKILL.md gained a "Session commands" subsection documenting `/three-axes-audit`,
  `/three-axes-handoff` and `/three-axes-log` next to the existing conversational
  mode-switch signals.
- README's context-window cost note updated from ~2,400 to **~3,550 tokens** per session
  (~1.7% of a 200k window). Both figures are estimated from the hook's real output payload
  at ~4 chars/token — the same method behind the 1.2.1 number, so they are comparable — and
  the README now says so rather than implying a precise measurement.
- `plugin.json` description and keywords now mention the Integrity Rules.

### Credits
- The Integrity Rules take their central idea — enumerating AI failure modes and giving them
  IDs, rather than gesturing at "be careful" — from Santiago Bustelo's
  [Perkele Protocol](https://github.com/sbustelo/AI-DevTools/tree/main/AI-PerkeleProtocols).
  Two departures are deliberate: that protocol treats adversarial pressure as the enforcement
  mechanism (its own LAW_57 concedes the cost, instructing the model to read anger as a
  trigger for *more* caution — which survives here as IR-11, without the hostility), and it
  demands total submission to the operator, where this framework depends on the AI pushing
  back.

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
