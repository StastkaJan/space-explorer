# Developing Space Explorer

Space Explorer has a Solid TypeScript application in `app/`, a matching npm lockfile, and quality tooling. The first-release features and browser regression suite are implemented; final acceptance verification is in progress and no CI workflow exists. The [README](README.md) defines the first release and its acceptance criteria.

## Stack and scope

Use Solid, strict TypeScript, Vite, SVG, and CSS. Use npm and the `node:24-bookworm-slim` runtime configured in [compose.yaml](compose.yaml). Foundation verified with Node `v24.21.0` and npm `11.19.0` (Docker Desktop `4.89.0`, Linux engine `29.7.2`). Commit `app/package.json` and `app/package-lock.json` together.

The first release is a single screen with the Sun and eight planets, planet selection and details, and shared time controls. Facts are bundled locally. Persistence, a backend, authentication, routing, a global state library, and a 3D engine are outside this release.

## Docker Compose workflow

Run commands from the repository root. Docker Desktop with Linux containers, or Docker Engine with Compose, is required. Host Node.js and npm are unnecessary.

Validate the configuration, then start the existing application:

```powershell
docker compose config --quiet
docker compose up -d --wait web
docker compose logs -f web
```

Startup runs `npm ci` against the committed lockfile. Preserve the Compose-compatible `dev` script. The `setup` tools service remains available for one-off repository tooling.

Open http://localhost:5176 when Vite is ready. The published port binds to localhost. Set `APP_PORT=5178` (or another available port) in a root `.env` file to override it, then rerun `docker compose up -d`. Local `.env` files are ignored by Git.

Source files are bind-mounted for live updates, polling is enabled for Docker Desktop, and container dependencies live in a project-specific named volume. Stop the services with `docker compose down`.

### Dependencies and builds

Stop `web` and any running `preview` before changing dependencies so an install cannot overlap the dev server or tests:

```powershell
docker compose stop web preview
docker compose run --rm web npm install <package>
docker compose up -d
```

Replace `<package>` with the required package; add `--save-dev` for development tooling. Commit both package files after dependency changes.

With `web` running, build using `docker compose exec web npm run build`. For a build without a running server:

```powershell
docker compose run --rm web sh -c "npm ci && npm run build"
```

The production output is `app/dist/`. To verify those assets locally after building:

```powershell
docker compose up -d --wait preview
docker compose run --rm --no-deps -e PLAYWRIGHT_BASE_URL=http://preview:4173 test
```

Open http://localhost:5177 (`PREVIEW_PORT` overrides the host port). The tools-profile `preview` service reuses `npm run preview`, uses Node 24 native config loading to avoid temporary config writes, mounts source and dependencies read-only, and serves the existing build on container port 4173. It does not rebuild or install dependencies; build first and rebuild after source changes. `--no-deps` keeps this test invocation focused on the already healthy preview. Ordinary startup still launches only `web`. Stop preview with `docker compose stop preview`. Vite preview is a local release check; hosting is outside this task.

## Architecture and simulation

The implemented `app/src/` layout separates these responsibilities:

| Location | Responsibility |
| --- | --- |
| `App.tsx` | Compose the screen and coordinate shared state |
| `features/solar-system/` | SVG diagram, planet list, time controls, pure orbit calculations, and clock lifecycle |
| `features/planet/PlanetDetails.tsx` | Selected planet's illustration and readable facts |
| `data/planets.ts` | Stable IDs, labels, display parameters, facts, units, source URLs, and verification dates |
| `App.css`, `index.css`, `features/solar-system/camera.css` | Theme, layout, focus styles, and camera transitions |

Use Solid signals for selected planet, playback settings, and simulated time. Derive the selected record and positions rather than keeping duplicate state. Reuse planet labels and colors across the diagram, list, and details.

Keep orbit math pure and separate from rendering. All planets use the same simulated time, measured in days; speed is simulated days per real second. Keep illustrative radii separate from scientific measurements and label the view as illustrative.

Own one `requestAnimationFrame` loop in `createSimulation`. Stop it while paused or hidden and on disposal. Reset its previous timestamp on resume to avoid a jump. Scrubbing pauses playback until the user explicitly resumes. Reduced motion starts paused and skips animated camera travel. Clean up visibility listeners and other browser resources with their owner.

Playback controls now start from simulated day zero, playing at 30 simulated days per real second (paused for reduced motion). The native speed selector offers 1, 30, 365, and 1000 simulated days per real second. These illustrative settings live in `createSimulation.ts`. Playback stops at day 60,000 and stays paused when Play is requested at that boundary. The time display shows completed whole simulated days without a live region. The native scrub control covers day 0 through 60,000 in steps of 1, pauses on pointer or keyboard adjustment, and stays paused until explicit Play. Reset restores day 0, speed 30, and the unselected system view while paused. Returning from planet details preserves time, speed, and playback. Scrubbing backward or resetting allows leaving the upper boundary.

Verify scientific facts against authoritative sources during implementation and store their provenance with the data. Runtime exploration must not depend on external APIs.

Selecting a planet moves its existing SVG marker to the center over 650 ms and enlarges it to an illustrative radius of 120 SVG units. The close-up stays centered while the shared clock continues updating orbital positions; CSS overrides the marker's orbital transform only for the selected view. Other diagram markers are hidden from view, keyboard navigation, and assistive technology during a close-up; the planet list remains available for switching. Returning or resetting restores the live system positions directly while the orbit background fades in. Native CSS transitions retarget the latest selection and are disabled immediately by reduced motion, including preference changes during travel. Camera behavior adds no timers, animation loops, or event listeners.

## Implementation and verification

1. Start the existing Solid app and use the quality scripts below.
2. Draw static orbits; select a planet through the labelled list and show its details. Handle missing or unknown IDs safely.
3. Add pure orbital calculations and the shared clock, then pause, speed, scrubbing, and reset controls.
4. Add selection transitions, keyboard access, narrow-screen layout, and reduced-motion behavior.
5. Run the implemented checks and validate the built app's primary journey against the README's acceptance criteria.

The scripts below are available in `app/package.json`. `test` runs unit tests in `src/` once and fails on an empty suite. Browser journeys are separate under `e2e/`.

| Script | Expected behavior |
| --- | --- |
| `dev` | Start Vite; preserve compatibility with Compose's host and port arguments |
| `build` | Build static production assets |
| `check` | Run TypeScript checking with the Solid template's compiler settings |
| `lint` | Run a Solid-compatible ESLint configuration |
| `format:check` | Check formatting without rewriting files |
| `test` | Run Vitest unit tests once and exit |
| `test:e2e` | Run Playwright against a locally served app |

Run checks inside the running service:

```powershell
docker compose exec web npm run format:check
docker compose exec web npm run lint
docker compose exec web npm run check
docker compose exec web npm test
docker compose exec web npm run build
```

Use deterministic unit tests for start, quarter-orbit, and full-orbit positions, speed scaling, and clock lifecycle. Cover paused positions, scrubbing, reset, hidden-tab resume without a time jump, and disposal without a remaining frame loop. Use a controlled clock rather than real-time sleeps.

### Browser verification

Docker with Compose is the only prerequisite. From the repository root, run:

```powershell
docker compose run --rm test
```

This starts `web` if necessary, waits for its HTTP healthcheck, and runs the browser journeys once. The command returns a nonzero exit code on failure. Ordinary `docker compose up -d` starts only `web`; the test service belongs to the `tools` profile. Tests reach Vite at `http://web:5173` across the Compose network, with that hostname explicitly allowed by Vite.

The test service uses `mcr.microsoft.com/playwright:v1.63.0-noble`, matching the exact `@playwright/test` version in the lockfile. It provides Chromium and its system dependencies and mounts the installed application dependencies read-only. Keep the image and package versions aligned when upgrading. The slim `web` image does not supply browsers. See [Playwright's Docker guidance](https://playwright.dev/docs/docker).

The journeys cover all eight list and diagram selections, sourced details, keyboard selection and focus restoration, playback/speed/pause/scrub/reset, reduced motion, and rapid selection/reset during travel. Controlled-time unit tests cover hidden-page resume and user-paused hide/show; authentic manual tab visibility is a separate release gate. Reports go to `app/playwright-report/`; failed tests retain screenshots and traces in `app/test-results/`. Both directories are ignored. To inspect a failed run's report:

```powershell
docker compose run --rm --no-deps -p 127.0.0.1:9323:9323 test npx playwright show-report --host 0.0.0.0
```

Open http://localhost:9323 and stop the report server with Ctrl+C. The report links to failure details, screenshots, and trace inspection. The browser base URL can be overridden with `docker compose run --rm -e PLAYWRIGHT_BASE_URL=http://web:5173 test` when verifying a different locally served build.

Manually verify visible focus, labelled controls, readable contrast, touch targets, narrow screens, and reduced motion. The planet list must provide selection without precise targeting of small SVG markers. Avoid per-frame live-region announcements. Check animation smoothness with all eight planets before introducing rendering optimizations.

For documentation-only changes, verify relative links, commands against Compose, and `git diff --check`. Report unavailable checks explicitly; do not scaffold the app solely to validate documentation.
