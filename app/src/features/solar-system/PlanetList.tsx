import { For } from 'solid-js'
import { planets } from '../../data/planets'

export default function PlanetList(props: {
  selectedId: string | undefined
  onSelect: (id: string) => void
}) {
  return (
    <nav class="planet-navigation" aria-label="Choose a planet">
      <p class="eyebrow">
        PICK A WORLD <span aria-hidden="true">↗</span>
      </p>
      <div class="planet-list">
        <For each={planets}>
          {(planet, index) => (
            <button
              id={`planet-${planet.id}`}
              type="button"
              aria-pressed={props.selectedId === planet.id}
              onClick={() => props.onSelect(planet.id)}
            >
              <span class="planet-number">0{index() + 1}</span>
              <span
                class="planet-swatch"
                style={{ '--planet-color': planet.color }}
                aria-hidden="true"
              />
              <span>{planet.label}</span>
            </button>
          )}
        </For>
      </div>
    </nav>
  )
}
