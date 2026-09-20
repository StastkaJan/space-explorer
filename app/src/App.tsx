import { createSignal } from 'solid-js'
import { planets } from './data/planets'
import PlanetDetails from './features/planet/PlanetDetails'
import PlanetList from './features/solar-system/PlanetList'
import SolarSystem from './features/solar-system/SolarSystem'
import { createSimulation } from './features/solar-system/createSimulation'
import './App.css'

export function selectedPlanet(id: string | undefined) {
  return planets.find((planet) => planet.id === id)
}

export default function App() {
  const simulation = createSimulation(false)
  const [selectedId, setSelectedId] = createSignal<string>()
  const selected = () => selectedPlanet(selectedId())
  const returnToSystem = () => {
    const previousId = selected()?.id
    setSelectedId(undefined)
    document.getElementById(`planet-${previousId}`)?.focus()
  }
  return (
    <main class="explorer">
      <header class="masthead">
        <a class="wordmark" href="#" onClick={() => setSelectedId(undefined)}>
          <span aria-hidden="true">✳</span> SPACE EXPLORER
        </a>
        <span class="edition">A FIELD GUIDE TO OUR SOLAR SYSTEM</span>
      </header>
      <div class="intro">
        <p class="eyebrow">YOUR NEIGHBORHOOD, REIMAGINED</p>
        <h1>A little perspective.</h1>
        <p>Eight worlds. One extraordinary place to call home.</p>
      </div>
      <section class="observatory" aria-label="Explore the solar system">
        <div class="system-stage">
          <div class="map-caption">
            <span class="status-dot" /> SOLAR SYSTEM{' '}
            <span>ILLUSTRATED VIEW</span>
          </div>
          <SolarSystem
            simulatedDays={simulation.simulatedDays()}
            selectedId={selected()?.id}
            onSelect={setSelectedId}
          />
          <p class="scale-note">
            An illustration, not an ephemeris. Sizes, distances, and circular
            paths are not to scale.
          </p>
        </div>
        <PlanetDetails planet={selected()} onReturn={returnToSystem} />
      </section>
      <PlanetList selectedId={selected()?.id} onSelect={setSelectedId} />
      <footer class="page-footer">
        <span>A small invitation to look up.</span>
        <span>EXPLORE WITH CURIOSITY</span>
      </footer>
    </main>
  )
}
