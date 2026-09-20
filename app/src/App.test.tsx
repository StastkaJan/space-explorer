// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'solid-js/web'
import { createSignal } from 'solid-js'
import App, { selectedPlanet } from './App'
import { planets } from './data/planets'
import PlanetDetails from './features/planet/PlanetDetails'

let dispose: (() => void) | undefined
afterEach(() => {
  dispose?.()
  document.body.replaceChildren()
})

describe('planet selection', () => {
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
