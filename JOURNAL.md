# Journal

## 2026-09-23 - Three Axes v1.7.0 release and public site

- Released the action-boundary profile gate, clarified scope-aware setup copy,
  and added lifecycle regression coverage for the portable SessionStart output
  envelope.
- Added and published the Lux-Swiss showcase site from the `gh-pages` branch at
  `https://luxsolari.github.io/three-axes-framework/`; linked it from README and
  kept the deployment static with `.nojekyll` and relative assets.
- Corrected the source release workflow to listen for the established
  `three-axes-framework-v<version>` tags and extract the version component before
  reading the changelog.
- Verified 44 source tests, the Claude plugin validator, release-note extraction,
  workflow YAML parsing, and `git diff --check`. GitHub's source Release workflow
  completed successfully, and the published site returned HTTP 200 with all hero
  assets visible in the browser.
- Published: source commit `69e9ffc`, tag `three-axes-framework-v1.7.0`, and
  GitHub Release. The matching Codex marketplace release and validation also
  completed successfully.
- Open: blog integration is intentionally left to the blog repository; this site
  now provides the stable public URL it can link to.
- Relevant files: `site/`, `.github/workflows/release.yml`, `CHANGELOG.md`,
  `.claude-plugin/plugin.json`, and `README.md`.

## 2026-09-23 - SessionStart resume compatibility

- Traced Codex's `invalid session start JSON output` notice to a second,
  outdated `three-axes-framework@claude-cowork` installation. Its legacy Claude
  hook returned `additionalContext` at the top level, which Codex rejects; the
  native package already uses `hookSpecificOutput.additionalContext`.
- Removed only that stale Codex-side duplicate and retained the enabled native
  `three-axes-framework@lux-solari-codex` package.
- Added lifecycle regression coverage for startup, resume, clear, and compact;
  it asserts the portable nested envelope and explicitly rejects a top-level
  `additionalContext` field.
- Verified all 44 source tests, all 20 packaged Three Axes tests, and
  `git diff --check` in both repositories. A fresh interactive resume was not
  launched from this task.
- Open: the broader action-boundary profile-gate changes remain uncommitted and
  unreleased. The stale hook trust hash remains inert in Codex configuration;
  the corresponding plugin is no longer installed.
- Relevant files: `tests/setup-gate.test.mjs`, `CHANGELOG.md`, and the Codex
  package's `tests/session-start.test.mjs`.

## 2026-09-23 - Action-boundary profile gate

- Moved first-run enforcement out of session startup and prompt submission: an
  attached `cwd` no longer causes setup by itself, so ordinary questions remain
  conversational even when the host supplies a workspace.
- Added a shared project-action classifier for Claude and Codex. Built-in file,
  patch, shell, and continued-process tools are gated only when they target the
  attached workspace; explicit paths and working directories outside it remain
  available, as do external tools without a local workspace path.
- Canonicalized existing path ancestors so symlink aliases cannot evade the
  workspace boundary, protected the persistent profile files from direct writes,
  and accepted the exact profile-writer command through both `Bash.command` and
  Codex `exec_command.cmd` inputs.
- Reworded onboarding and public documentation around the blocked action rather
  than the whole session, and mirrored the runtime, contract, and tests in the
  Codex marketplace package.
- Verified the full Claude suite (61 tests), the Codex Three Axes suite (19
  tests), the marketplace/parity checks (12 tests), the marketplace plugin
  validator, and `git diff --check` in both repositories.
- Open: no version bump, commit, release, or marketplace publication has been
  performed. Shell tools without an explicit outside working directory remain
  conservatively workspace-bound; unknown tools can only be classified when the
  host exposes an absolute local path.
- Relevant files: `hooks/lib/project-action.mjs`, `hooks/require-profile.mjs`,
  `hooks/inject-framework.mjs`, `hooks/lib/setup.mjs`, and
  `tests/setup-gate.test.mjs`.

## 2026-09-23 - Scope-aware profile questions

- Reframed first-run setup as a fallback for assistant behavior rather than a
  universal self-assessment of the developer's ability.
- Made mastery, consequence, and intent questions conditional on the selected
  scope: global wording now applies only when no project profile exists, while
  project wording explicitly names this repository and its domain/tools.
- Clarified that the setup gate appeared because the host attached a workspace;
  hook events without a workspace remain ungated.
- Mirrored the copy and contract coverage in the Codex marketplace package.
- Verified 42 Claude package tests and 18 Codex package tests; both repositories
  also pass `git diff --check`.
- Open: no version bump, commit, release, or marketplace publication has been
  performed for this copy refinement.
- Relevant files: `hooks/lib/setup.mjs`, `commands/three-axes-setup.md`, and
  `tests/setup-gate.test.mjs`.

## 2026-09-23 - Generated-code ownership standard

- Defined generated-code ownership as responsible authorship rather than
  line-by-line reproduction or framework/API recall.
- Added the human ownership loop and an explicit next-day comprehension gate;
  review now teaches the smallest missing concept against the implementation,
  challenges its important assumptions and evidence, then returns control.
- Verified with `node --test tests/setup-gate.test.mjs
  tests/plugin-structure.test.mjs` (42 tests) and `git diff --check`.
- Published: commit `88a934c` and tag `three-axes-framework-v1.6.0` are on
  GitHub. The Codex marketplace release and its validation completed
  successfully; the existing local-only site work remains outside this change.
- Relevant files: `skills/three-axes-framework/SKILL.md`, `README.md`,
  `.claude-plugin/plugin.json`, and `CHANGELOG.md`.

## 2026-09-23 - Local Three Axes marketing site

- Built a static Lux-Swiss/Geist mini-site in `site/`, then revised its copy
  against the framework documentation and companion essay.
- Added six technical-vector editorial plates for the hero, comprehension debt,
  axis calibration, conversational modes, integrity rules, and task orientation.
  The static bundle uses optimized WebP derivatives (roughly 568 KB total).
- Rebuilt the page around one centered 16-column, 1440px editorial frame,
  widened the hero copy so its title does not clip, and normalized every
  image/caption pair to the same bordered treatment. The mobile breakpoint
  collapses the grid without horizontal overflow.
- Reorganized the Integrity Rules into a full-width heading row over a balanced
  image-and-ledger row, then made all thirteen rules a native, exclusive
  disclosure accordion with concise explanations based on the framework docs.
- Added contextual command references for overview/status, setup/set, mode,
  audit, handoff, and journal logging alongside the sections they operate on;
  the two continuity commands now explain their output.
- Verified the local `http://127.0.0.1:4173` preview in the built-in browser:
  the assets load, the accordion keeps one rule open at a time, the desktop and
  390px layouts align without overflow, and the console reports no warnings or
  errors. `git diff --check` also reports no whitespace errors.
- Open: the site remains local-only and uncommitted; publishing to GitHub Pages
  has not been attempted.
- Relevant files: `site/index.html`, `site/styles.css`, `site/script.js`, and
  `site/assets/*.webp`.

## 2026-09-23 - Profile-gate UX 1.5.1

- Named the Three Axes Framework plugin and missing persistent profile in the
  setup block, exempted hook events without a workspace, and clarified direct
  native-picker use for Codex Desktop.
- Verified with the local Node suites for the Claude and Codex packages.
- Open: marketplace publication has not yet been attempted.
- Relevant files: `hooks/require-profile.mjs`, `hooks/inject-framework.mjs`,
  `hooks/lib/setup.mjs`, and `tests/setup-gate.test.mjs`.
