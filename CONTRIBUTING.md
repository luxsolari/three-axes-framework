# Contributing

## Reporting issues

Open an issue at [github.com/luxsolari/three-axes-framework/issues](https://github.com/luxsolari/three-axes-framework/issues). Include your Claude Code version, OS, and what you expected vs. what happened.

## Proposing changes

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes with tests where applicable
4. Run tests: `node --test hooks/lib/__tests__/profile.test.mjs`
5. Open a pull request against `main`

## Testing locally

Install the plugin from your local clone:

```
/plugin marketplace add ./path/to/three-axes-framework
/plugin install three-axes-framework@local
```

Or if you have the local marketplace configured:

```
/plugin install three-axes-framework@local
```

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change that is not a fix or feature
- `test:` — adding or updating tests
- `chore:` — build process or tooling changes
