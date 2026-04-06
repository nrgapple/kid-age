# AGENTS

## Environment

- Package manager: `bun`
- If `bun` is not on `PATH`, run `export PATH="$HOME/.bun/bin:$PATH"` or start a new shell with `exec zsh`.
- Primary app commands:
  - `bun run web`
  - `bun run ios`
  - `bun run android`
  - `bun run test --runInBand --watch=false`

## Agent Workflow

Use these commands in this order unless the task clearly needs something else:

1. `bun run doctor`
2. `bun run build:web`
3. `bun run e2e:web`
4. If a native flow changed, run `bun run maestro:smoke` after booting a native app and exporting `APP_ID`.

`bun run doctor` is the main pre-handoff gate. It chains:

- `bun run doctor:expo`
- `bun run typecheck`
- `bun run lint`
- `bun run test --runInBand --watch=false`

## Tooling Added For Agents

### Expo Doctor

- Command: `bun run doctor:expo`
- Purpose: catch Expo SDK, config, and package mismatches before spending time on UI or runtime debugging.

### TypeScript

- Command: `bun run typecheck`
- Purpose: fail fast on route/component refactors and shared helper changes.

### Biome

- Commands:
  - `bun run lint`
  - `bun run format`
- Config: [biome.json](/Users/nrgapple/Projects/kid-age/biome.json)
- Purpose: fast formatting and linting without adding a heavier ESLint/Prettier stack.

### Playwright

- Command: `bun run e2e:web`
- Config: [playwright.config.ts](/Users/nrgapple/Projects/kid-age/playwright.config.ts)
- Smoke test: [tests/e2e/home.spec.ts](/Users/nrgapple/Projects/kid-age/tests/e2e/home.spec.ts)
- Purpose: verify the web app boots and the first-run state renders.
- Notes:
  - The config builds the static web app and serves `dist/` on `http://127.0.0.1:4173`.
  - Install browser binaries once per machine with `bunx playwright install chromium`.
  - Jest is configured to ignore `tests/e2e/`, so Playwright and Jest do not fight over the same files.

### Knip

- Command: `bun run deps:check`
- Config: [knip.json](/Users/nrgapple/Projects/kid-age/knip.json)
- Purpose: find unused files, exports, and dependencies after refactors.
- Notes:
  - This runs in report-only mode because Expo Router and external CLIs produce a small amount of known noise.

### Maestro

- Command: `bun run maestro:smoke`
- Flow: [.maestro/smoke.yaml](/Users/nrgapple/Projects/kid-age/.maestro/smoke.yaml)
- Purpose: mobile smoke coverage for a booted native app.
- Notes:
  - `maestro` is an external CLI and is not installed through Bun.
  - Install it separately on the machine before use.
  - Export the app identifier first, for example: `export APP_ID=com.example.app`
  - The current flow is a starter smoke flow and assumes the app exposes visible text for `Home`, `Compare`, and the first-run empty state.

## Practical Guidance

- For UI work:
  - Run `bun run build:web` first.
  - Then run `bun run e2e:web`.
  - Use Playwright before reaching for manual browser checks.

- For shared logic or dependency cleanup:
  - Run `bun run typecheck`
  - Run `bun run test --runInBand --watch=false`
  - Run `bun run deps:check`

- For Expo/package issues:
  - Start with `bun run doctor:expo`
  - Only debug runtime symptoms after Expo Doctor is clean.

## Verified In This Repo

- `bun run typecheck`
- `bun run lint`
- `bun run test --runInBand --watch=false`
- `bun run build:web`
- `bun run e2e:web`
- `bun run doctor:expo`
- `bun run doctor`

## Not Fully Verified Here

- `bun run maestro:smoke` depends on the external Maestro CLI plus a real native `APP_ID`.
