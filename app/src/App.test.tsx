// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'solid-js/web'
import { createSignal, untrack } from 'solid-js'
import App, { selectedPlanet } from './App'
import { planets } from './data/planets'
import PlanetDetails from './features/planet/PlanetDetails'
import SolarSystem from './features/solar-system/SolarSystem'
import { positionAtTime } from './features/solar-system/orbit'

let dispose: (() => void) | undefined
afterEach(() => {
  dispose?.()
  document.body.replaceChildren()
})

describe('planet selection', () => {
  it('derives all positions from shared time while selection and details remain valid', () => {
    const [days, setDays] = createSignal(0)
    const [id, setId] = createSignal<string>()
    dispose = render(
      () => (
        <>
          <SolarSystem
            simulatedDays={days()}
            selectedId={id()}
            onSelect={setId}
          />
          <PlanetDetails
            planet={selectedPlanet(id())}
            onReturn={() => setId(undefined)}
          />
        </>
      ),
      document.body,
    )
    for (const time of [91, 365]) {
      setDays(time)
      for (const planet of planets) {
        const marker = document.querySelector(
          `[data-planet-id="${planet.id}"]`,
        )!
        const position = positionAtTime(planet, time)
        expect(marker.getAttribute('transform')).toBe(
          `translate(${position.x} ${position.y})`,
        )
        marker.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(marker.getAttribute('aria-pressed')).toBe('true')
        expect(document.querySelector('h2')?.textContent).toBe(planet.label)
        expect(untrack(days)).toBe(time)
      }
    }
    setDays(730)
    expect(document.querySelector('h2')?.textContent).toBe('Neptune')
    expect(
      document
        .querySelector('[data-planet-id="neptune"]')
        ?.getAttribute('aria-pressed'),
    ).toBe('true')
  })
  it('keeps list, markers, facts, and return action in sync for every planet', () => {
    dispose = render(() => <App />, document.body)
    const panel = document.querySelector('aside')!
    expect(panel.textContent).toContain('Meet the neighbors.')
    for (const planet of planets) {
      const button = [...document.querySelectorAll('nav button')].find((item) =>
        item.textContent?.includes(planet.label),
      ) as HTMLButtonElement
      button.click()
      expect(panel.querySelector('h2')?.textContent).toBe(planet.label)
      expect(button.getAttribute('aria-pressed')).toBe('true')
      expect(
        document
          .querySelector(`[data-planet-id="${planet.id}"]`)
          ?.getAttribute('aria-pressed'),
      ).toBe('true')
      expect(panel.querySelector('a')?.href).toBe(
        planet.descriptionSource.sourceUrl,
      )
      expect(panel.textContent).toContain('Earth days')
    }
    ;(panel.querySelector('button') as HTMLButtonElement).click()
    expect(panel.textContent).toContain('Meet the neighbors.')
    expect(document.querySelector('[aria-pressed="true"]')).toBeNull()
    expect(document.activeElement?.id).toBe('planet-neptune')
    document
      .querySelector('[data-planet-id="earth"]')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      )
    expect(panel.querySelector('h2')?.textContent).toBe('Earth')
    document
      .querySelector('[data-planet-id="mars"]')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(panel.querySelector('h2')?.textContent).toBe('Mars')
  })
  it('clears stale details for missing and unknown IDs', () => {
    const [id, setId] = createSignal<string | undefined>('earth')
    dispose = render(
      () => (
        <PlanetDetails
          planet={selectedPlanet(id())}
          onReturn={() => setId(undefined)}
        />
      ),
      document.body,
    )
    expect(document.querySelector('h2')?.textContent).toBe('Earth')
    for (const invalid of ['pluto', '', undefined]) {
      setId(invalid)
      expect(selectedPlanet(invalid)).toBeUndefined()
      expect(document.querySelector('h2')?.textContent).toBe(
        'Meet the neighbors.',
      )
      expect(document.querySelector('dl')).toBeNull()
    }
  })
})
