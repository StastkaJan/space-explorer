import { For, Show } from 'solid-js'
import type { Planet, Source } from '../../data/planets'

function Provenance(props: { source: Source }) {
  return (
    <a class="fact-source" href={props.source.sourceUrl}>
      NASA · verified {props.source.verifiedAt}
    </a>
  )
}

export default function PlanetDetails(props: {
  planet: Planet | undefined
  onReturn: () => void
}) {
  return (
    <aside class="detail-panel" aria-label="Planet details">
      <Show
        when={props.planet}
        fallback={
          <div class="system-introduction">
            <p class="eyebrow">THE BIG PICTURE</p>
            <div class="decorative-orbits" aria-hidden="true">
              <span>✳</span>
            </div>
            <h2>Meet the neighbors.</h2>
            <p>
              Follow an orbit. Find a familiar blue dot. Get to know the worlds
              around us.
            </p>
            <p class="selection-hint">
              Select a planet in the diagram or the list below to take a closer
              look.
            </p>
          </div>
        }
      >
        {(planet) => (
          <>
            <button
              class="return-button"
              type="button"
              onClick={props.onReturn}
            >
              ← Back to solar system
            </button>
            <div
              class="planet-portrait"
              style={{ '--planet-color': planet().color }}
              aria-hidden="true"
            >
              <span />
            </div>
            <p class="eyebrow">PLANET FIELD NOTES</p>
            <h2>{planet().label}</h2>
            <p class="planet-description">{planet().description}</p>
            <Provenance source={planet().descriptionSource} />
            <dl class="planet-facts">
              <For each={planet().facts}>
                {(fact) => (
                  <div>
                    <dt>{fact.label}</dt>
                    <dd>
                      {fact.value.toLocaleString('en-US')}{' '}
                      <span>{fact.unit}</span>
                    </dd>
                    <Provenance source={fact} />
                  </div>
                )}
              </For>
              <div>
                <dt>Orbital period</dt>
                <dd>
                  {planet().orbitalPeriodDays.toLocaleString('en-US')}{' '}
                  <span>Earth days</span>
                </dd>
                <Provenance source={planet().orbitalPeriodSource} />
              </div>
            </dl>
          </>
        )}
      </Show>
    </aside>
  )
}
