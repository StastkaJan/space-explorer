# Agent instructions

## Repository context

- Read [README.md](README.md) for product scope and acceptance criteria and [DEVELOPMENT.md](DEVELOPMENT.md) for setup and checks before making changes.
- This repository contains the Solid TypeScript application in `app/`, documentation, and [compose.yaml](compose.yaml). Quality scripts, Vitest, Playwright, and a Compose production preview exist; no CI workflow exists. Keep this status current as implementation lands.
- Keep work within the requested scope. Documentation work does not authorize scaffolding the application.

## Development workflow

- Use Docker Compose for setup, dependency operations, development, and checks. Run Compose commands from the repository root; do not require host Node.js or npm.
- Use the configured Node image and npm. Generate the Solid TypeScript app into `app/` only when implementing the application and only if it does not already exist.
- Preserve `dev` script compatibility with Compose. Keep `app/package.json` and `app/package-lock.json` consistent and commit them together for dependency changes.
- Stop `web` and any running `preview` before installing dependencies. Keep generated output, dependencies, reports, and local environment files out of commits.
- Prefer the existing framework, native platform features, and installed dependencies. Create feature files as needed rather than scaffolding unused abstractions.

## Implementation constraints

- Use Solid, strict TypeScript, Vite, SVG, and CSS. The first release covers the Sun and eight planets in an illustrative two-dimensional view.
- Keep state in Solid primitives at the smallest shared owner. Derive selected records and orbit positions from source state.
- Keep orbit calculations pure; one shared simulation clock owns animation, pause/resume, visibility handling, and cleanup. Never create one animation loop per planet.
- Use simulated days and simulated-days-per-second consistently. Keep display sizes and distances distinct from scientific measurements.
- Stop animation while paused, hidden, or disposed. Reset the frame timestamp on resume. Scrubbing pauses until explicit playback resumes.
- Start paused for reduced motion and skip animated camera travel. Preserve keyboard selection, visible focus, labelled controls, and a usable narrow-screen layout.
- Keep planet facts bundled with units, source URLs, and verification dates. Verify new or changed scientific claims against authoritative sources.
- Do not add persistence, a backend, authentication, routing, a global state library, a physics engine, or 3D rendering without a requirement that needs it.

## Verification and completion

- For documentation-only work, check relative links, command consistency with Compose, and `git diff --check`. Run `docker compose config --quiet` if Docker is available.
- Once the app and quality scripts exist, run these checks in the running `web` service:

  ```powershell
  docker compose exec web npm run format:check
  docker compose exec web npm run lint
  docker compose exec web npm run check
  docker compose exec web npm test
  docker compose exec web npm run build
  ```

- Add focused tests for meaningful behavior changes. Prioritize orbit math, shared clock lifecycle, pause/scrub/reset, hidden-tab resume, and safe handling of unknown IDs. Use controlled time rather than sleeps.
- Run relevant browser journeys with `docker compose run --rm test`. For production verification, build in `web`, run `docker compose up -d --wait preview`, then `docker compose run --rm --no-deps -e PLAYWRIGHT_BASE_URL=http://preview:4173 test`. Do not assume Playwright browsers are installed in `web`.
- For UI changes, manually check keyboard interaction, reduced motion, narrow screens, and animation behavior. Automated DOM tests alone do not establish visual quality.
- Keep documentation accurate when commands, structure, scope, or setup change. Clearly distinguish planned behavior from implemented behavior.
- Report what changed, checks actually run, and any blocked or unavailable validation. Never report a missing script or unrun check as passing.
