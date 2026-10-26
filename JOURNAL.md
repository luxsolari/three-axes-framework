# Journal

## 2026-10-26 — prepare authorized lockstep 1.7.3 release

- User explicitly requested merging upstream PR 8 and publishing both editions as 1.7.3 before advancing the marketplace PRs. The fix-only commits since three-axes-framework-v1.7.2 derive a patch bump matching that requested version. Updated canonical manifest, README badge and changelog section in this same PR; retained native fixes and tests.
- Existing release workflow/tag scheme is reused. Prior tags/assets remain immutable; Supporter follows this exact released source through its existing checked draft/publish workflow. No independent supporter version is derived.
- Pending: exact-head CI after metadata update, normal protected merge, signed tag and workflow publication/readback. Required approving GitHub review may need owner action; no new admin exception has been authorized for PR 8. Marketplace PRs remain unmerged. Files: .claude-plugin/plugin.json; CHANGELOG.md; README.md; JOURNAL.md.

## 2026-10-26 — Windows onboarding final audit and CI evidence

- Canonical source PR 8 at 9c0552329f00d8b8d46fa04e07ad9f69af8b1b35 carries the Windows PowerShell quoting and macOS path-alias fixes. The original lifecycle regression is retained; no previous source test was removed. Host-specific question guidance is preserved.
- Verified all 64 tests on native Windows Node 24. Hosted CI 40389162916 passed the complete original suite and Linux/Windows/macOS Node 20 onboarding jobs, including actual Windows PowerShell 5.1/7 execution with literal quoted paths. Cross-host audit confirms canonical and Codex quoting mechanisms and project-action modules match. No further focused code issue found.
- Remaining: one approving human review is required by active main ruleset 18443106; PR state REVIEW_REQUIRED/BLOCKED at readback. No merge exception was requested or used. Manifest remains 1.7.2 with changes under Unreleased; immutable released 1.7.2 is unchanged. Claude's catalog pin cannot receive this fix until a subsequent published open patch, whose Supporter version must match. No new product release authorized or published. Files: setup/project-action helpers, setup-gate tests, CI matrix, README/CHANGELOG/JOURNAL. Final observation local/uncommitted.

## 2026-10-26 — prepare native Windows onboarding and macOS path fixes

- User requested repair of Windows onboarding quoting failures before marketplace merges. Canonical helper always emitted POSIX quoting; Windows supports native PowerShell in Claude as well as Codex. Emit shell-specific literal arguments, pin the running Node executable and explicitly name PowerShell on Windows. Preserve each host's onboarding/question guidance.
- Audit exposed a macOS realpath alias mismatch: shell text may contain the hook cwd /var spelling while the gate matched only /private/var. Compare both original resolved and realpath spellings; test commands via a directory alias from an outside workdir.
- Add actual Windows PowerShell 5.1/7 command execution with apostrophes, smart single quotes, substitutions/separators and Unicode in installation/profile paths. Initialize disposable Git projects, and use Windows junctions to retain alias-boundary coverage without symlink privilege. Add Node 20 onboarding CI on Linux/Windows/macOS alongside the original full suite.
- Pending: local canonical suite, exact-head hosted checks and follow-up audit. No live profiles, permissions, user installation or published version/tag/asset changed. Version remains 1.7.2 with fixes under Unreleased; Claude's marketplace pin cannot obtain these changes until a later published open patch. No 1.7.3 publication is authorized by this source PR alone.
- Files: hooks/lib/{setup,project-action}.mjs; tests/setup-gate.test.mjs; .github/workflows/ci.yml; CHANGELOG.md; JOURNAL.md.

## 2026-10-26 - Prepare 1.7.2 stable invocation identity clarification

- Clarified the existing three-axes-framework skill identity independently of installation display labels; native command, profile and hook code are unchanged.
- Prepared manifest, README badge and changelog 1.7.2 under the existing three-axes-framework-v<version> tag scheme. Existing release workflow is reused.
- User explicitly requested 1.7.2 publication. CI, protected-branch merge and signed tag/release verification remain pending; no old tag or asset is replaced.
- Files: .claude-plugin/plugin.json; README.md; CHANGELOG.md; JOURNAL.md.

## 2026-10-25 - Publish 1.7.1 after verification

- Merged documentation-only PR #6 at b00c72a6652de0b5db2745a1597c906d437d43a4.
  The owner explicitly authorized a scoped admin merge after green CI and audit;
  repository protection settings were not changed and still require one approval.
- The merge tree matches audited head 12906a7ff17dda75a099444a771b1c07b879cd79.
  CI passed 18 profile tests and 44 structure/setup tests. Post-merge CI run
  40258908791 also passed; native profile/hook code remains unchanged.
- Signed and pushed three-axes-framework-v1.7.1 without replacing an old tag.
  Remote annotation 5cd9a76bf0c5859b8fb967e5182ad164965e172e points to the merge
  commit and GitHub reports a valid verified signature. Release run 40258943792
  succeeded and the published release/manifest/README/changelog identify 1.7.1.
- Existing 1.7.0 tag annotation c2c00e4d9d650170c697cd58dc1cea0bee0ae180
  was preserved. No public runtime or profile changes were added during release.
- Evidence: https://github.com/luxsolari/three-axes-framework/releases/tag/three-axes-framework-v1.7.1
- Open: no new implementation finding reproduced in the release audit. This local
  observation is written after the immutable release commit; no retag is needed.


## 2026-10-25 - Prepare 1.7.1 verification-scope clarification

- Clarified IR-08 so execution-check reports name the source revision/checkout
  and relevant working-tree context; a committed-only review does not establish
  the state a command ran against. Native profile/hook code is unchanged.
- Prepared plugin manifest, README badge and changelog version 1.7.1 under the
  established three-axes-framework-v<version> tag scheme. Publication remains
  pending checks and release execution; no existing tag is replaced.
- Verified 48 local Node profile/structure tests, exact 1.7.1 changelog extraction
  and whitespace checks. Full setup-gate validation belongs to Ubuntu/Node 20 CI.
- A Windows-local full-suite attempt exposed existing LF and POSIX-shell test
  assumptions. Unmodified command files were materialized with their committed LF
  form; no hook/runtime behavior was changed to accommodate that local test host.
- Open: complete Ubuntu CI and final audit before merge/tag/publication.
- Files: skills/three-axes-framework/SKILL.md, .claude-plugin/plugin.json,
  README.md, CHANGELOG.md and JOURNAL.md.


## 2026-09-23 - GitHub Pages source aligned with design-system repositories

- Moved the static showcase from `site/` to `docs/` on `main` so its publishing
  source matches Lux Swiss and Tri-Swiss.
- Preserved the pre-existing design notes by moving `docs/superpowers/` to
  `project-notes/superpowers/`; the publishing folder now contains only the
  website.
- Configured GitHub Pages to deploy from `main` / `docs` while retaining the
  public URL `https://luxsolari.github.io/three-axes-framework/`.
- Verified the local document paths and static asset references before changing
  the Pages source. Live-deployment verification and retirement of the old
  `gh-pages` branch are pending until the pushed `main` deployment completes.
- Ruled out repository exposure as a concern: Pages serves only the selected
  publishing folder, not the repository tree.
- Relevant files: `docs/index.html`, `docs/styles.css`, `docs/script.js`,
  `docs/assets/*.webp`, and `project-notes/superpowers/`.

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
