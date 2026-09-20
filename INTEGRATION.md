# Integration stages

Status: SE-01–SE-09 are integrated. SE-11 automated and SE-12 production checks pass. Final manual visibility evidence keeps S4/S5 acceptance open; see [RELEASE-VERIFICATION.md](RELEASE-VERIFICATION.md). Stage descriptions below retain the original dependency sequence. This document defines how the [roadmap](ROADMAP.md) becomes working increments. Implementation tasks and dependencies are in [TICKETS.md](TICKETS.md).

Integration here means combining application features and verifying them together. The first release has no external service integration or runtime API dependency.

## Shared contracts

| Boundary | Contract |
| --- | --- |
| Data → views | Stable planet IDs, labels, colors, illustrative dimensions, descriptions, and sourced facts are shared by diagram, list, and details. The Sun is a separate central visual, not a planet with a fake orbital period. |
| Data → orbital math | Orbital periods use days; starting angles use radians. Display orbit radii and marker sizes are explicitly illustrative. |
| Simulation → orbital math | One simulated-day value drives every planet. Pure position calculations have no signals, timers, DOM access, or mutation. |
| Controls → simulation | One owner stores time, playback intent, and speed in simulated days per real second. Controls invoke that owner's operations; they do not create clocks. |
| Selection → views | One selected ID drives list state, details, and the diagram view. Derive the selected record; missing or unknown IDs safely produce the system view. |
| Visibility → simulation | Hidden pages have no scheduled simulation frame. Resume resets the previous timestamp; paused playback stays paused. Disposal cancels frames and removes listeners. |
| Motion preference → experience | Reduced motion starts paused and skips animated camera travel. Explicit Play can start orbital motion; no camera travel is required to access details. |
| Data → reader | Each scientific fact has a unit where relevant, source URL, and verification date. Source links are optional reading; rendering never waits for a remote request. |

Keep state at the smallest shared Solid owner. Create feature files only as they become necessary, following the layout in [DEVELOPMENT.md](DEVELOPMENT.md#architecture-and-simulation).

## Stage gates

### S0 — Foundation

**Original entry:** documentation and Compose configuration, before `app/` was created. The application now exists; do not scaffold it again.

**Integrate:** SE-01. Scaffold once through the existing `setup` service. Establish the package scripts, strict TypeScript, formatting, linting, and unit-test tooling. Record actual Node/npm versions and update repository status documents.

**Exit:** a fresh checkout starts at the configured localhost port, `dev` accepts Compose's arguments, and the quality commands below run successfully. Package manifest and lockfile agree. Do not invent placeholder tests merely to make an empty suite green; document the empty-suite behavior until SE-03 adds meaningful coverage.

### S1 — Static exploration

**Entry:** S0 passes.

**Integrate:** SE-02's dataset with SE-03's static diagram, list, and details. Add SE-04's browser service and smoke journey. Render all eight planets and the Sun; use data-defined starting positions until S2 supplies shared orbital calculations.

**Exit:** each planet can be selected through the list and diagram; details and selected state agree. Unknown IDs safely show the system view. Keyboard selection works, facts include provenance, and illustrative scale is explained. The browser smoke journey runs through the documented Compose test service.

### S2 — Simulation core

**Entry:** S1 passes.

**Integrate:** SE-05's pure orbital positions and SE-06's single simulation owner into the SVG view. Every planet derives its position from the same time value. Keep the integrated screen paused until S3 supplies playback controls; exercise clock advancement through controlled-time tests.

**Exit:** tests prove start, quarter orbit, full orbit, speed scaling, pause/resume, visibility suspension, fresh-timestamp resume, and cleanup. Selection and details still work at nonzero simulated times. No planet component owns an animation loop.

### S3 — Time interaction

**Entry:** S2 passes; browser test infrastructure is available.

**Integrate:** SE-07's play/pause and speed controls, followed by SE-08's scrub and reset actions. Enable the planned startup playback behavior only after the controls exist.

**Exit:** the combined browser journey selects a planet, plays, changes speed, pauses, scrubs, explicitly resumes, and resets. Paused positions stay stable; speed changes do not reset time; scrubbing stays paused; reset clears selection and restores the documented initial values while paused. Reduced-motion startup is paused. Hiding and showing the page cannot introduce a time jump or restart a paused simulation.

### S4 — Complete experience

**Entry:** S3 passes.

**Integrate:** SE-09's selected views and camera transitions, then SE-10's responsive and accessibility finish. Keep camera state separate from scientific values and simulation state.

**Exit:** switching selections during playback or travel resolves to the latest selection. Returning to the system view preserves time and playback. Reduced motion moves directly to views. Manually verify a 320 CSS-pixel viewport and a desktop viewport, keyboard focus, readable details, control labels, and smooth motion with eight planets. No page-level horizontal scrolling or unreachable controls remain.

### S5 — Release verification

**Entry:** S4 passes.

**Integrate:** SE-11's complete acceptance coverage and SE-12's production-build verification and documentation updates.

**Exit:** all quality commands pass, the primary browser journey works against locally served production assets, and manual acceptance evidence is recorded. Report the tested revision, environments, commands, and any limitations. Missing or failing required evidence blocks completion; deployment is not part of this gate.

## Verification workflow

Use [DEVELOPMENT.md](DEVELOPMENT.md#docker-compose-workflow) for setup and dependency operations. Run Compose from the repository root, use the configured Node image and npm, and stop `web` before dependency changes.

Run these implemented checks in the running `web` service for every integrated stage:

```powershell
docker compose exec web npm run format:check
docker compose exec web npm run lint
docker compose exec web npm run check
docker compose exec web npm test
docker compose exec web npm run build
```

The suite contains real behavior tests. Run development browser journeys with `docker compose run --rm test`. For production assets, build first, run `docker compose up -d --wait preview`, then `docker compose run --rm --no-deps -e PLAYWRIGHT_BASE_URL=http://preview:4173 test`. Browser dependencies belong to the dedicated test image; `web` does not provide them.

Use controlled frames and visibility events for lifecycle tests, and event/state assertions for browser journeys, rather than time-based sleeps. Browser automation complements manual visual checks; it does not replace them.

## Integration discipline

- Keep changes reviewable by ticket. Integrate dependency tickets before dependents and keep unrelated work out of each change.
- A ticket can close only when its acceptance criteria and relevant checks pass. A stage can close only when its integrated journey passes as well.
- Retest earlier journeys when new behavior touches them, especially selection, paused positions, and reset.
- Keep the default branch usable at each stage; intermediate features may remain paused as specified above, with their current limits documented.
- Record unresolved failures against the responsible ticket. Fix them or revert the responsible change before advancing the stage; avoid adding speculative feature flags or parallel implementations.
