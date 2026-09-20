import type { Planet } from '../../data/planets'
import { createMemo } from 'solid-js'
import { positionAtTime } from './orbit'

export default function PlanetMarker(props: {
  planet: Planet
  simulatedDays: number
  selected: boolean
  hidden: boolean
  onSelect: (id: string) => void
}) {
  const position = createMemo(() =>
    positionAtTime(props.planet, props.simulatedDays),
  )
  return (
    <g
      class="planet-marker"
      role="button"
      tabindex={props.hidden ? -1 : 0}
      aria-hidden={props.hidden}
      aria-label={`Select ${props.planet.label}`}
      aria-pressed={props.selected}
      data-planet-id={props.planet.id}
      transform={`translate(${position().x} ${position().y})`}
      style={{
        '--closeup-scale': 120 / props.planet.displayRadiusSvgUnits,
        '--planet-radius': `${props.planet.displayRadiusSvgUnits}px`,
      }}
      onClick={() => props.onSelect(props.planet.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          props.onSelect(props.planet.id)
        }
      }}
    >
      <circle
        class="marker-target"
        r={Math.max(18, props.planet.displayRadiusSvgUnits + 6)}
      />
      <circle
        r={props.planet.displayRadiusSvgUnits}
        fill={props.planet.color}
      />
      <circle
        r={props.planet.displayRadiusSvgUnits}
        fill="url(#planet-shade)"
      />
      <text
        y={
          props.planet.displayRadiusSvgUnits +
          (props.selected
            ? (48 * props.planet.displayRadiusSvgUnits) / 120
            : 17)
        }
        text-anchor="middle"
      >
        {props.planet.label}
      </text>
    </g>
  )
}
