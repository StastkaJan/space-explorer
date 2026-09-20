import { expect, test } from 'vitest'
import { planets } from './planets'

test('the eight planets have unique IDs and finite positive orbital periods', () => {
  expect(planets).toHaveLength(8)
  expect(new Set(planets.map((planet) => planet.id)).size).toBe(8)
  for (const planet of planets) {
    expect(Number.isFinite(planet.orbitalPeriodDays)).toBe(true)
    expect(planet.orbitalPeriodDays).toBeGreaterThan(0)
  }
})
