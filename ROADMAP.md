# Space Explorer roadmap

Status: first-release implementation is present; final acceptance remains open pending authentic manual tab hide/show evidence (production and automated checks pass). See [RELEASE-VERIFICATION.md](RELEASE-VERIFICATION.md). This plan covers the first release defined in [README.md](README.md), using the workflow in [DEVELOPMENT.md](DEVELOPMENT.md).

Read in order: roadmap, [integration stages](INTEGRATION.md), then [implementation tickets](TICKETS.md). Stages are ordered by dependencies and demonstrated behavior, not calendar estimates. SE-01–SE-09 are integrated; SE-11 automated coverage and SE-12 production checks pass; SE-10 manual visibility evidence keeps S4/S5 release acceptance open.

## Release outcome

A single-screen, illustrative two-dimensional solar system with the Sun and eight planets. Users can select any planet by diagram or labelled list, inspect a close-up and sourced facts, and control simulated time. The experience must remain usable with a keyboard, on narrow screens, and with reduced motion.

## Milestones

| Stage | Outcome | Tickets | Exit evidence |
| --- | --- | --- | --- |
| S0 — Foundation | Solid app runs through Compose with strict TypeScript and quality scripts | SE-01 | Clean setup, checks, and static production build work |
| S1 — Static exploration | All eight planets are selectable and show bundled details | SE-02–SE-04 | Keyboard selection, safe unknown IDs, sourced data, and a browser smoke journey |
| S2 — Simulation core | Pure orbital math and one lifecycle-safe simulation clock | SE-05–SE-06 | Controlled-time tests prove positions, speed scaling, pause, visibility, and disposal |
| S3 — Time interaction | Play, pause, speed, scrubbing, and reset work together | SE-07–SE-08 | Integrated browser journey proves stable pause, scrub-to-pause, and predictable reset |
| S4 — Complete experience | Selection travel, close-ups, responsive layout, and accessible controls | SE-09–SE-10 | Manual keyboard, narrow-screen, reduced-motion, and animation review |
| S5 — Release verification | The built first release meets the product acceptance criteria | SE-11–SE-12 | All quality gates and production-build journeys pass; documentation reflects reality |

S0 → S1 → S2 → S3 → S4 → S5 is the integration order. Tickets may be prepared earlier when their dependencies permit, but a stage closes only after its combined behavior passes the [stage gate](INTEGRATION.md#stage-gates).

## Planning decisions

These decisions define the implemented behavior. The stage descriptions preserve the dependency order; completion depends on the recorded evidence.

- The Sun is the diagram's central reference. The first release requires selection and detail views for the eight planets; a separate Sun detail view is outside this plan.
- Opening the completed app starts at simulated day zero, at the documented default speed, with no selected planet. Normal motion starts playing; reduced motion starts paused. Intermediate stages stay paused until usable playback controls exist.
- Selecting a planet changes selection and view without changing simulated time or playback. The list and diagram share the same selected ID.
- Scrubbing immediately pauses playback and sets simulated time. Finishing the gesture does not resume playback.
- Reset restores day zero, the default speed, no selection, and the full-system view, and leaves playback paused. It is distinct from returning to the system view, which only clears selection and changes the view.
- Hiding the page suspends animation without overwriting the user's playback intent. Showing it resumes only if playback was active, with a fresh frame timestamp and no hidden-time catch-up.
- The default speed is 30 simulated days per second; choices are 1, 30, 365, and 1000. Scrubbing covers days 0–60,000 in steps of 1; playback pauses at the upper bound. Controls expose simulated days and simulated days per real second; no real-world date accuracy is implied.

## Scope boundary

Use Solid, strict TypeScript, Vite, SVG, CSS, bundled data, and static production assets. Reuse native controls and Solid primitives. No backend, external runtime data API, persistence, authentication, routing, global state library, physics engine, or 3D rendering is needed.

Moons, texture rotation, realistic ephemerides, free-camera controls, VR, and 3D are deferred ideas, not follow-on commitments. Reassess them only after the first release is accepted. Hosting or deployment is a separate task; this roadmap ends with a verified static build.

## Risks and responses

| Risk | Response in the plan |
| --- | --- |
| A polished diagram hides broken time behavior | Prove the math and shared clock before animated transitions |
| Eight moving markers are hard to target | Keep a labelled keyboard-accessible list available throughout |
| Camera movement conflicts with live orbits | Define the selected-view behavior and test it during playback in SE-09 |
| Small screens cannot fit the system and details | Stack list, controls, and details without making the diagram the only way to select |
| Browser tests depend on missing container libraries | Add a dedicated Compose test service in SE-04 |
| Illustrations appear scientifically to scale | Separate display parameters from scientific facts and show an illustrative-scale explanation |
| Facts lose provenance | Verify bundled facts, including orbital periods, in SE-02 and review at release |

## Completion rule

Finish the release when all stage gates pass and SE-12 records the evidence. Do not expand scope to solve speculative future requirements. Failed checks or unavailable manual verification remain explicit open work.
