import { For } from 'solid-js'
import { planets, sun } from '../../data/planets'
import PlanetMarker from './PlanetMarker'

export default function SolarSystem(props: {
  selectedId: string | undefined
  onSelect: (id: string) => void
}) {
  return (
    <svg
      class="solar-system"
      viewBox="-360 -355 720 710"
      aria-label="Illustrated solar system with eight selectable planets"
    >
      <defs>
        <radialGradient id="sun-glow">
          <stop stop-color={sun.color} stop-opacity="0.25" />
          <stop offset="1" stop-color={sun.color} stop-opacity="0" />
        </radialGradient>
        <radialGradient id="planet-shade" cx="28%" cy="25%" r="80%">
          <stop stop-color="white" stop-opacity="0.25" />
          <stop offset="0.45" stop-color="black" stop-opacity="0" />
          <stop offset="1" stop-color="black" stop-opacity="0.7" />
        </radialGradient>
      </defs>
      <For each={planets}>
        {(planet) => (
          <circle
            class="orbit"
            classList={{ 'orbit-selected': props.selectedId === planet.id }}
            r={planet.displayOrbitRadiusSvgUnits}
          />
        )}
      </For>
      <g aria-label="Sun">
        <circle r="75" fill="url(#sun-glow)" />
        <circle r={sun.displayRadiusSvgUnits} fill={sun.color} />
        <text class="sun-label" y="40" text-anchor="middle">
          SUN
        </text>
      </g>
      <For each={planets}>
        {(planet) => (
          <PlanetMarker
            planet={planet}
            selected={props.selectedId === planet.id}
            onSelect={props.onSelect}
          />
        )}
      </For>
    </svg>
  )
}
