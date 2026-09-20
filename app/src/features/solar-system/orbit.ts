import type { Planet } from '../../data/planets'

// Coordinates are relative to the Sun; positive angles follow SVG's downward y-axis.
export function positionAtTime(
  planet: Pick<
    Planet,
    'displayOrbitRadiusSvgUnits' | 'startingAngleRadians' | 'orbitalPeriodDays'
  >,
  simulatedDays: number,
): { x: number; y: number } {
  const angle =
    planet.startingAngleRadians +
    (2 * Math.PI * simulatedDays) / planet.orbitalPeriodDays

  return {
    x: planet.displayOrbitRadiusSvgUnits * Math.cos(angle),
    y: planet.displayOrbitRadiusSvgUnits * Math.sin(angle),
  }
}
