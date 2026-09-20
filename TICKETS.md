# Implementation tickets

Status: SE-01–SE-09 are implemented and integrated. SE-10 implementation is integrated but authentic manual tab hide/show evidence remains open. SE-11 automated checks are complete; SE-12 production and quality checks pass, but release closure still requires SE-10 manual visibility evidence. No external tracker issues have been created. IDs remain stable; acceptance criteria below are the completion contract. See [RELEASE-VERIFICATION.md](RELEASE-VERIFICATION.md) for current evidence and limitations.

Product scope: [README.md](README.md). Delivery order: [ROADMAP.md](ROADMAP.md). Combined acceptance gates: [INTEGRATION.md](INTEGRATION.md).

## Backlog order

| ID | Ticket | Stage | Depends on |
| --- | --- | --- | --- |
| SE-01 | Establish the application and quality commands | S0 | None |
| SE-02 | Bundle verified planet data | S1 | SE-01 |
| SE-03 | Deliver static exploration and selection | S1 | SE-02 |
| SE-04 | Add containerized browser verification | S1 | SE-03 |
| SE-05 | Implement pure orbital calculations | S2 | SE-02 |
| SE-06 | Integrate the shared simulation clock | S2 | SE-03, SE-05 |
| SE-07 | Add playback and speed controls | S3 | SE-06 |
| SE-08 | Add scrubbing and reset | S3 | SE-04, SE-07 |
| SE-09 | Add selected views and camera travel | S4 | SE-08 |
| SE-10 | Finish responsive layout and accessibility | S4 | SE-09 |
| SE-11 | Complete acceptance regression coverage | S5 | SE-04, SE-10 |
| SE-12 | Verify the production build and release documentation | S5 | SE-11 |

## SE-01 — Establish the application and quality commands

**Outcome:** a developer can start and check the Solid app using Docker Compose alone.

**Scope:** scaffold `app/` once using the documented Solid TypeScript template and existing `setup` service. Preserve the Compose-compatible `dev` script. Add only the tooling required for TypeScript, Solid-compatible linting, formatting, and Vitest. Browser dependencies belong to SE-04.

**Acceptance criteria:**

- Compose starts the app at the configured localhost port with source updates visible.
- Strict TypeScript is enabled. `format:check`, `lint`, `check`, `test`, and `build` exist and perform the documented operations; `test` exits rather than watches.
- The resolved Node/npm versions are recorded; package manifest and lockfile are consistent.
- Dependencies, build output, test reports, and local environment files stay ignored.
- README, DEVELOPMENT, and AGENTS accurately describe the implemented structure and commands. Any temporary empty-suite allowance is explicit and removed once meaningful tests land.

**Verification:** `docker compose config --quiet`, fresh-start smoke check, and the S0 quality commands. Record empty-suite behavior rather than calling it application test coverage.

## SE-02 — Bundle verified planet data

**Outcome:** views and simulation consume one small, typed local dataset.

**Scope:** add all eight planets with stable IDs, labels, colors, illustrative radii, starting angles, orbital periods in days, descriptions, and a short consistent set of facts. Represent the Sun separately as a central visual. Verify scientific claims against authoritative sources during implementation.

**Acceptance criteria:**

- All eight records are present with unique IDs and positive orbital periods.
- Scientific values and illustrative dimensions are distinct fields with explicit units.
- Facts and orbital periods include supporting source URLs and actual verification dates; descriptions do not introduce unsupported claims.
- The app requires no runtime data request. Shared labels and colors are reusable across views.

**Verification:** review each claim against its cited source; type-check the data. Include a focused invariant test for unique IDs and valid orbital periods when the dataset feeds the simulation.

## SE-03 — Deliver static exploration and selection

**Outcome:** the first usable slice shows the system and readable planet details.

**Scope:** implement the SVG diagram, labelled planet list, selected details with an illustrated close-up, and a return-to-system action. Keep shared selection at its smallest common owner. Use data-defined starting positions and keep this slice static.

**Acceptance criteria:**

- The Sun, eight planets, and orbit paths render with distinct colors and an illustrative-scale explanation.
- List and diagram selections use the same ID and display the correct details and source links.
- All planets are selectable by keyboard through the labelled list, with visible focus and a discernible selected state. Interactive diagram markers have accessible names.
- No selection, a missing ID, or an unknown ID produces a safe system view without a crash or stale details.
- The basic layout keeps list and details reachable on a narrow screen; final visual refinement remains in SE-10.

**Verification:** focused selection/unknown-ID tests and manual static keyboard journey. Replace any temporary empty-suite allowance from SE-01 with real coverage.

## SE-04 — Add containerized browser verification

**Outcome:** browser journeys run reproducibly through Compose.

**Scope:** add Playwright, `test:e2e`, and a dedicated Compose test service with browser and system dependencies matching the installed Playwright version. Configure service networking, app readiness, and a base URL without assuming the test container's localhost is `web`.

**Acceptance criteria:**

- A documented root-level Compose invocation runs the tests and returns a failing exit status on test failure.
- The test service waits for app readiness and includes a smoke journey that selects a planet by accessible name and verifies its details.
- A keyboard journey covers selection and returning to the system view.
- Package files stay consistent; reports and traces are ignored. Ordinary development startup does not unexpectedly launch the test runner.
- DEVELOPMENT explains prerequisites, the exact invocation, and how to inspect failures.

**Verification:** run the smoke and keyboard journeys through the new service; validate Compose configuration. Record the actual browser environment used.

## SE-05 — Implement pure orbital calculations

**Outcome:** a simulated-day value deterministically produces illustrative planet positions.

**Scope:** implement the README's circular-orbit formula in a pure module. Inputs use orbital-period days, radians, and display radii. No timer, renderer, or reactive store belongs in this module.

**Acceptance criteria:**

- Starting angle, quarter orbit, and full orbit produce expected coordinates within a numeric tolerance.
- Planets with different periods advance at different angular rates for the same simulated time.
- Zero time and supported scrub endpoints yield finite coordinates; display dimensions remain separate from scientific values.

**Verification:** deterministic unit tests with explicit expected positions and tolerances, including a nonzero starting angle. No sleeps or snapshots of the entire diagram.

## SE-06 — Integrate the shared simulation clock

**Outcome:** one owner advances simulated time and all planet positions derive from it.

**Scope:** implement `createSimulation` with Solid primitives, one `requestAnimationFrame` loop, visibility handling, and cleanup. Multiply elapsed real seconds by simulated days per second. Connect SE-05 to the SVG; keep the intermediate screen paused until SE-07 adds controls.

**Acceptance criteria:**

- Starting playback repeatedly never schedules duplicate loops; each planet reads the same simulated time.
- Pause, hidden-page state, and disposal leave no scheduled simulation frame.
- Resume resets the frame timestamp and excludes hidden or paused elapsed time. Showing a page does not start user-paused playback.
- Cleanup removes listeners and prevents later frames from mutating disposed state.
- Reduced-motion initialization is paused. Selection remains valid as positions change.

**Verification:** controlled-frame tests for elapsed-time conversion, speed scaling, duplicate start, pause/resume, hidden/visible behavior, and disposal. Inspect integrated nonzero-time positions and selection.

## SE-07 — Add playback and speed controls

**Outcome:** users can start, stop, and change the rate of orbital motion.

**Scope:** add labelled native controls wired to the shared simulation owner. Record a default speed, supported speed choices, and the scrub range/step to be implemented in SE-08; these are illustrative interaction settings. Define how the displayed scrub range handles playback reaching its bounds so the control never silently misrepresents time.

**Acceptance criteria:**

- Play/pause reflects playback intent and is keyboard-operable with visible focus.
- Speed is labelled in simulated days per real second; changing it preserves current time and paused/playing state.
- Normal startup plays from day zero; reduced-motion startup is paused. Explicit Play works in either preference.
- Time display uses simulated days. It does not announce every animation frame through a live region.
- Default values and bounds are documented and shared by controls and reset behavior.

**Verification:** focused control/state tests plus controlled-time speed changes. Manually verify keyboard use and both startup motion preferences; extend the browser journey when S3 is integrated.

## SE-08 — Add scrubbing and reset

**Outcome:** time navigation and reset are predictable across every view.

**Scope:** connect an accessible time input and Reset action to the existing simulation owner using SE-07's documented bounds. Make reset a single coordinated update of simulation and selection state.

**Acceptance criteria:**

- Pointer and keyboard scrubbing pause immediately, set time, and move all planets consistently.
- Scrubbing remains paused after release; only explicit Play resumes.
- Reset from playing, paused, or selected states restores day zero, default speed, no selection, and the system view, and leaves playback paused.
- Returning to the system view alone leaves time, speed, and playback unchanged.
- Bounds, endpoints, and displayed time agree during scrubbing and subsequent playback.

**Verification:** focused state tests and a Compose browser journey covering selection → play → speed change → pause → scrub → explicit resume → reset. Assert paused positions remain stable using controlled time rather than sleeps.

## SE-09 — Add selected views and camera travel

**Outcome:** selecting a planet provides the signature transition from system to close-up.

**Scope:** use SVG/CSS view transformations and existing artwork. Define and document how the selected framing remains stable while the shared simulation continues. Keep camera behavior separate from simulation time; use the existing shared loop if frame coordination is needed.

**Acceptance criteria:**

- Diagram and list selection produce equivalent close-up views and details without resetting time or playback.
- Returning to the system view restores its framing; reset also restores the system view.
- Rapid selections and reset during travel settle on the latest requested view without stale transitions.
- Reduced motion skips animated travel, including when the preference changes during a transition.
- Disposal cleans up transition resources; no planet-specific animation loops appear.

**Verification:** browser checks for selection/reset during transitions; manual checks while playing, paused, and under reduced motion. Confirm all eight close-ups remain readable.

## SE-10 — Finish responsive layout and accessibility

**Outcome:** the complete interaction is usable across input methods and screen sizes.

**Scope:** refine the dark visual theme, restrained stars, planet colors, floating desktop details, and stacked narrow-screen layout. Reuse the existing components and tokens.

**Acceptance criteria:**

- At 320 CSS pixels and a desktop width, list, controls, and details remain reachable without page-level horizontal scrolling.
- Every planet and control is keyboard-operable; focus is visible and not lost or trapped when details change or close.
- Labels, selected state, readable contrast, touch targets, and explanatory scale copy are clear. Color alone does not carry selection.
- Reduced motion starts paused and uses direct view changes. Hidden pages stop orbital animation, and returning does not jump.
- Motion with eight planets is visually smooth on the recorded test environment; optimize only observed problems.

**Verification:** manual desktop and narrow-screen journeys, keyboard-only use, reduced-motion startup and selection, tab hide/show, and animation inspection. Record viewport/browser and findings; DOM tests alone cannot close this ticket.

## SE-11 — Complete acceptance regression coverage

**Outcome:** the integrated release has focused regression proof for its required behavior.

**Scope:** review existing tests against README acceptance criteria and fill meaningful gaps. Reuse SE-04's browser service and controlled-time helpers; avoid duplicating every unit test in the browser.

**Acceptance criteria:**

- Unit coverage proves orbit math, shared-clock lifecycle, hidden-tab resume without catch-up, safe unknown IDs, and disposal without remaining frames/listeners.
- Browser journeys cover all eight selections, details, keyboard operation, pause stability, speed changes, scrubbing, reset, and reduced-motion startup/direct views.
- Coverage includes user-paused hide/show and rapid selection/reset during travel.
- Tests run once, deterministically, with useful failures and no fixed sleeps. All required quality commands and browser journeys pass.

**Verification:** execute the quality commands and full Compose browser suite. Map each acceptance requirement to a test or the manual evidence required by SE-10; leave unavailable evidence open.

## SE-12 — Verify the production build and release documentation

**Outcome:** a verified static build and an accurate handoff for the first release.

**Scope:** serve `app/dist/` locally through a documented Compose workflow, reusing existing tooling where practical. Run the primary browser journey against those assets, review provenance and scope, and update status documentation. Do not deploy or add a backend.

**Acceptance criteria:**

- The production build loads, selects planets, displays facts, and completes the playback/scrub/reset journey without runtime data APIs.
- Keyboard, narrow-screen, reduced-motion, and animation acceptance evidence is current for the release candidate.
- README, DEVELOPMENT, AGENTS, roadmap, and ticket status distinguish implemented behavior from deferred ideas and include reproducible current commands.
- A release verification record identifies the tested revision, environment, commands, results, manual checks, and known limitations. Generated output stays out of commits.
- Every first-release stage gate is satisfied. Any failed or unrun required check is reported and keeps the ticket open.

**Verification:** run all quality commands, Compose configuration validation, production-build browser journeys, documentation link checks, and `git diff --check`. Review the result against the README's release scope.
