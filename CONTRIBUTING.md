# Contributing

## Reporting issues

Open an issue at [github.com/luxsolari/three-axes-framework/issues](https://github.com/luxsolari/three-axes-framework/issues). Include your Claude Code version, OS, and what you expected vs. what happened.

## Proposing changes

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes with tests where applicable
4. Run tests: `node --test hooks/lib/__tests__/profile.test.mjs` (also run in
   CI on every push/PR to `main` — see `.github/workflows/ci.yml`)
5. Open a pull request against `main`

## Testing locally

Clone the repository and validate the plugin structure:

```bash
git clone https://github.com/luxsolari/three-axes-framework
claude plugin validate ./three-axes-framework
```

To load your local clone into a real session for manual testing — no marketplace or install step needed:

```bash
claude --plugin-dir ./three-axes-framework
```

After editing a command or the skill mid-session, run `/reload-plugins` to pick up the change without restarting.

Or install from the published marketplace:

```
/plugin marketplace add luxsolari/lux-solari-plugins
/plugin install three-axes-framework@lux-solari-plugins
```

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change that is not a fix or feature
- `test:` — adding or updating tests
- `chore:` — build process or tooling changes
