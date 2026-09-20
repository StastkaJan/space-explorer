import { expect, test } from 'vitest'
import { planets } from '../../data/planets'
import { positionAtTime } from './orbit'

const orbit = {
  displayOrbitRadiusSvgUnits: 100,
  startingAngleRadians: 0,
  orbitalPeriodDays: 400,
}

test.each([
  [0, 100, 0],
  [100, 0, 100],
  [400, 100, 0],
])('day %s gives the expected circular position', (days, x, y) => {
  const position = positionAtTime(orbit, days)
  expect(position.x).toBeCloseTo(x, 10)
  expect(position.y).toBeCloseTo(y, 10)
})

test.each([
  [0, 0, 100],
  [100, -100, 0],
  [400, 0, 100],
])('nonzero starting angle is preserved at day %s', (days, x, y) => {
  const position = positionAtTime(
    { ...orbit, startingAngleRadians: Math.PI / 2 },
    days,
  )
  expect(position.x).toBeCloseTo(x, 10)
  expect(position.y).toBeCloseTo(y, 10)
})

test('a shorter period advances farther at the same simulated time', () => {
  const slower = positionAtTime(orbit, 100)
  const faster = positionAtTime({ ...orbit, orbitalPeriodDays: 200 }, 100)
  expect(slower.x).toBeCloseTo(0, 10)
  expect(slower.y).toBeCloseTo(100, 10)
  expect(faster.x).toBeCloseTo(-100, 10)
  expect(faster.y).toBeCloseTo(0, 10)
})

// Intended scrub range: 0–60000 simulated days (shared controls land in SE-07).
test.each([0, 60000])('all planet coordinates are finite at day %s', (days) => {
  for (const planet of planets) {
    const position = positionAtTime(planet, days)
    expect(Number.isFinite(position.x)).toBe(true)
    expect(Number.isFinite(position.y)).toBe(true)
    expect(Math.hypot(position.x, position.y)).toBeCloseTo(
      planet.displayOrbitRadiusSvgUnits,
      10,
    )
  }
})
