# Space Explorer

**Framework: Solid.** An illustrated solar-system explorer with animated orbits, controllable time, and approachable planet details.

Status: project brief only. Follow the [shared development directions](DEVELOPMENT.md).

## Experience and visual direction

Use a dark background, restrained star texture, distinct planet colors, and a readable floating detail panel. The main view is an SVG orbital diagram, with a planet list and playback controls underneath on smaller screens.

The signature interaction is selecting a planet and moving smoothly from the system view to a close-up. Scrubbing simulated time moves the planets around their paths. A planet list offers the same selection without requiring precise targeting of small objects.

## First release

- The Sun and eight planets in a stylized two-dimensional view.
- Select a planet from the diagram or a labelled list.
- Show an illustrated close-up and a short set of sourced facts.
- Pause/play motion, adjust speed, scrub time, and reset the view.
- Explain that sizes, distances, and circular paths are illustrative.

Three-dimensional rendering, realistic ephemerides, moons, texture rotation, free-camera controls, and VR are later work. This first release captures exploration and motion without a 3D engine.

## Technologies and architecture

Use Solid, TypeScript, Vite, SVG, and CSS. Use `createSignal` for selected planet, playback settings, and simulated time; use derived calculations for the selected record and orbit positions. See Solid's [signals documentation](https://docs.solidjs.com/concepts/signals) for reactive updates.

One `requestAnimationFrame` loop advances simulated time. A pure orbital module converts time and display parameters into positions. Keep the animation loop out of individual planet components and stop it when paused, hidden, or disposed.

Proposed structure inside `app/src/`:

```text
App.tsx
features/solar-system/
  SolarSystem.tsx
  PlanetMarker.tsx
  PlanetList.tsx
  TimeControls.tsx
  orbit.ts
  orbit.test.ts
  createSimulation.ts
features/planet/PlanetDetails.tsx
data/planets.ts
styles/tokens.css
```

`createSimulation` owns clock lifecycle; `orbit` owns pure math; the SVG view owns rendering; details own readable content. Reuse the planet color and label data across markers, list entries, and details. Do not build a general physics engine.

## Data and simulation rules

`Planet`: ID, label, display radius, display orbit radius, orbital period, starting angle, short description, facts, and source URLs. Keep illustrative display dimensions distinct from real scientific values.

For a circular illustration, use `angle = startingAngle + 2 * PI * simulatedDays / orbitalPeriodDays`, then sine/cosine for position. All planets read the same simulated time. On a frame, advance by elapsed real seconds multiplied by the selected simulated-days-per-second speed.

Pause the loop while the page is hidden. Reset the previous frame timestamp on resume so returning to the tab does not cause a jump. During scrubbing, pause playback; the user can explicitly resume afterward. Honor reduced motion by starting paused and moving directly to selected views.

No persistence is required for the first release: opening the app starts from the same illustrative epoch. Keep facts in a bundled dataset with units, source URL, and verification date. Verify them against authoritative sources during implementation, such as [NASA's planet overview](https://science.nasa.gov/solar-system/planets/).

## Build order and tests

1. **First slice:** draw static orbits and select a planet from a labelled list to show details. Test missing/unknown IDs fall back safely.
2. Add the orbital calculation and shared clock. Unit-test the start position, quarter orbit, full orbit, and speed scaling using a controlled clock.
3. Add pause, scrubbing, and reset. Browser-test that paused positions remain stable, scrubbing changes them, and reset restores the initial state.
4. Add view transitions, accessible SVG labels, mobile layout, and reduced motion. Test hidden-tab/resume logic for unexpected time jumps and confirm cleanup leaves no animation loop running after disposal.

Done when all planets can be selected by keyboard, time controls behave predictably, reduced motion starts paused, and the diagram remains usable on a narrow screen. Test smoothness with eight planets before adding rendering libraries; only introduce 3D if the next scope explicitly requires it.

## Future scaffold

Run from this folder when implementation starts:

```powershell
npm create vite@latest app -- --template solid-ts
cd app
npm install
npm run dev
```

Use the official [Vite scaffold](https://vite.dev/guide/) and configure the shared quality scripts.
