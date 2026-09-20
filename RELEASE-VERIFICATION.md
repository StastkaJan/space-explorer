# First-release verification

Status on 2026-09-20: production and automated checks pass. **Release acceptance remains open** because authentic manual tab hide/show evidence is unavailable. SE-10 is implemented, SE-11 automated coverage passes, and SE-12 remains open for that required evidence. No deployment was performed.

## Tested candidate and environment

- Application/test revision: `dfa9978002dbc056c17e50ee740fccd3b7b5b721` (SE-11), with app tree `00d176efb5b82a6166baa5cfaacb2482aa253465`. The subsequent SE-12 changes are root documentation and the Compose preview service; application files were frozen during this verification.
- Windows host with Docker Desktop Linux containers; recorded foundation Docker Desktop 4.89.0 / engine 29.7.2. Release commands confirmed Compose v5.5.0, Node v24.21.0, npm 11.19.0, and Vite 8.3.0.
- Browser tests: `mcr.microsoft.com/playwright:v1.63.0-noble`, Playwright 1.63.0, Chromium 153.0.8010.12. Development base URL `http://web:5173`; production base URL `http://preview:4173`.
- Manual UI review reported by SE-10: Chrome 153 on Windows, desktop 1440×1000 and narrow 320×760 CSS pixels. The reviewed SE-10 application code is unchanged by SE-11, which adds test coverage only.
- Preview uses the configured Node image and existing `preview` script, localhost port 5177, read-only app/dependency mounts, native TypeScript config loading, and a scoped allowed hostname. Generated `app/dist/`, reports, and audit scripts are ignored.

## Commands and results

Run from the repository root with Docker Compose; no host Node/npm is required. Start `web` with `docker compose up -d --wait web` first.

| Command | Result |
| --- | --- |
| `docker compose config --quiet` | Passed for the final preview configuration |
| `docker compose exec web npm run format:check` | Passed |
| `docker compose exec web npm run lint` | Passed |
| `docker compose exec web npm run check` | Passed |
| `docker compose exec web npm test` | Passed: 22 tests in 4 files |
| `docker compose exec web npm run build` | Passed: 18 modules; static HTML, CSS, JavaScript |
| `docker compose run --rm test` | Passed in SE-11 final gate: 7 browser journeys |
| `docker compose up -d --wait preview` | Passed: preview healthy |
| `docker compose run --rm --no-deps -e PLAYWRIGHT_BASE_URL=http://preview:4173 test` | Passed: all 7 journeys against production assets |
| Root Markdown relative-link/anchor check | Passed: 31 links/anchors across 7 files |
| `git diff --check` | Passed |

Build output: `index.html` 0.59 kB; `assets/index-D744_m6l.css` 6.91 kB (2.29 kB gzip); `assets/index-CjORXWgm.js` 25.81 kB (9.85 kB gzip). Rebuild before checking changed source. Preview is a local verification server, not a hosting deployment.

Initial preview startup failed because Vite's default config loader tried to write into read-only dependencies. The final command uses `--configLoader native` with Node 24; restart and the complete production browser suite then passed.

Independent root verification repeated Compose configuration, all five quality commands, and all 7 production browser journeys successfully on the same candidate.

## Acceptance evidence

| Requirement | Evidence |
| --- | --- |
| Eight planets, sourced facts, common selection, safe unknown IDs | `app/e2e/exploration.spec.ts`, `app/src/App.test.tsx`, `app/src/data/planets.test.ts`; all passed |
| Orbit start/quarter/full cycle, angular-rate differences, finite endpoints | `app/src/features/solar-system/orbit.test.ts`; 9 passed |
| One clock, pause/resume, hidden suspension, user-paused hide/show, cleanup | `app/src/features/solar-system/createSimulation.test.ts`; 9 controlled-frame tests passed; authentic manual hide/show remains open |
| Playback/speed/scrub/reset and reduced-motion startup | `app/e2e/playback.spec.ts`; production journeys passed |
| Stable close-ups, rapid selection/reset, live motion preference changes | `app/e2e/camera.spec.ts`; production journeys passed |
| Keyboard, narrow screens, visible focus, reduced motion, smoothness | SE-10 manual findings below; visibility exception explicitly remains open |
| Static assets without runtime data APIs | Production network audit below; only local HTML/CSS/JS requested, no page errors |

The bundled dataset retains NASA source URLs and verification dates of 2026-09-20 for descriptions, measurements, and orbital periods. Release review confirmed provenance fields remain present and scientific/display dimensions remain separate; this gate did not change or re-derive scientific claims. The scientific source verification was performed in SE-02. Source links are optional further reading.

SE-10 manual findings: desktop and 320-pixel screenshots showed reachable controls/details and no horizontal page overflow; all eight list selections worked with Enter and visible focus. Keyboard playback, speed, scrubbing, reset, diagram selection, and Back worked. Reduced-motion startup was paused and selection was direct; changing the preference during travel and rapid selection/reset resolved correctly. Source links, controls, and Back had 44-pixel targets. All eight moving planets appeared smooth; a 60-frame sample recorded intervals of 13–16.1 ms in that environment. This is a local observation, not a cross-device performance guarantee.

Independent manual production review at localhost:5177 also passed: reduced-motion startup showed Play/day 0; Earth selection displayed details; explicit Play advanced time; scrubbing paused; keyboard Home → Tab → Enter Reset returned to the system at day 0, speed 30, paused with focus on Reset. Browser console showed no errors or warnings.

**Missing evidence:** actual tab hide/show could not be established in the automated desktop environment: even a CDP-confirmed minimized window reported `document.hidden === false` and no visibility events. Controlled visibility tests pass, but this does not replace the required manual observation. To close SE-10/S4 and SE-12/S5, check an ordinary browser tab while playing: hide it, return, confirm no hidden-time catch-up; then pause, hide/return, and confirm it stays paused. Record browser/environment and result. A user observation was requested and was pending when this record was written.

## Production network inspection

An additional Playwright run loaded production, selected all eight planets, changed speed, paused, scrubbed to day 1234, played, and reset. Observed requests were only `http://preview:4173/`, `/assets/index-CjORXWgm.js`, and `/assets/index-D744_m6l.css`; no fetch/XHR/WebSocket, external request, or page error occurred.

Reproduce from PowerShell with the existing test image:

```powershell
@'
import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
const requests = [], errors = [], sockets = []
page.on('request', r => requests.push({ url: r.url(), type: r.resourceType() }))
page.on('pageerror', e => errors.push(e.message))
page.on('websocket', socket => sockets.push(socket.url()))
await page.goto('http://preview:4173')
for (const id of ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune']) await page.locator('#planet-' + id).click()
const controls = page.getByRole('region', { name: 'Simulation controls' })
await controls.getByLabel('Speed (simulated days per real second)').selectOption('365')
await controls.getByRole('button', { name: 'Pause', exact: true }).click()
await controls.getByRole('slider', { name: 'Scrub simulated day' }).fill('1234')
await controls.getByRole('button', { name: 'Play', exact: true }).click()
await controls.getByRole('button', { name: 'Reset', exact: true }).click()
console.log(JSON.stringify({ browser: browser.version(), requests, errors, sockets }, null, 2))
await browser.close()
if (errors.length || sockets.length || requests.some(r => !r.url.startsWith('http://preview:4173/') || ['fetch','xhr','websocket'].includes(r.type))) process.exit(1)
'@ | docker compose run --rm --no-deps -T test node --input-type=module
```

Scope remains the Sun and eight planets in an illustrative 2D single screen. No backend, persistence, authentication, routing, external runtime data API, physics engine, or 3D was added. Chromium is the automated browser target; other engines and devices are not claimed verified. CI and hosting are not implemented. Deferred ideas remain listed separately in [ROADMAP.md](ROADMAP.md#scope-boundary).
