export interface Source {
  readonly sourceUrl: string
  readonly verifiedAt: string
}

export interface PlanetFact extends Source {
  readonly label: string
  readonly value: number
  readonly unit: string
}

export interface Planet {
  readonly id: string
  readonly label: string
  readonly color: string
  readonly displayRadiusSvgUnits: number
  readonly displayOrbitRadiusSvgUnits: number
  readonly startingAngleRadians: number
  readonly orbitalPeriodDays: number
  readonly orbitalPeriodSource: Source
  readonly description: string
  readonly descriptionSource: Source
  readonly facts: readonly PlanetFact[]
}

const metricSource: Source = {
  sourceUrl: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
  verifiedAt: '2026-09-20',
}

const overviewSource: Source = {
  sourceUrl: 'https://science.nasa.gov/solar-system/planets/',
  verifiedAt: '2026-09-20',
}

function facts(
  diameterKm: number,
  distanceMillionKm: number,
): readonly PlanetFact[] {
  return [
    {
      label: 'Equatorial diameter',
      value: diameterKm,
      unit: 'km',
      ...metricSource,
    },
    {
      label: 'Mean distance from Sun (semi-major axis)',
      value: distanceMillionKm,
      unit: 'million km',
      ...metricSource,
    },
  ]
}

// NASA's summary table uses tropical orbital periods in Earth days.
// Definitions: https://nssdc.gsfc.nasa.gov/planetary/factsheet/planetfact_notes.html
// SVG dimensions and starting angles are artistic choices, not an ephemeris.
export const planets: readonly Planet[] = [
  {
    id: 'mercury',
    label: 'Mercury',
    color: '#b6aaa0',
    displayRadiusSvgUnits: 5,
    displayOrbitRadiusSvgUnits: 55,
    startingAngleRadians: 0.4,
    orbitalPeriodDays: 88,
    orbitalPeriodSource: metricSource,
    description:
      'The smallest planet, and the closest to the Sun. Mercury has a solid surface.',
    descriptionSource: overviewSource,
    facts: facts(4879, 57.9),
  },
  {
    id: 'venus',
    label: 'Venus',
    color: '#e3bb7b',
    displayRadiusSvgUnits: 8,
    displayOrbitRadiusSvgUnits: 85,
    startingAngleRadians: 2.2,
    orbitalPeriodDays: 224.7,
    orbitalPeriodSource: metricSource,
    description:
      'Second from the Sun, Venus is one of the four inner planets with solid surfaces.',
    descriptionSource: overviewSource,
    facts: facts(12104, 108.2),
  },
  {
    id: 'earth',
    label: 'Earth',
    color: '#68b6ee',
    displayRadiusSvgUnits: 8,
    displayOrbitRadiusSvgUnits: 115,
    startingAngleRadians: 4.8,
    orbitalPeriodDays: 365.2,
    orbitalPeriodSource: metricSource,
    description:
      'Our home is the third planet from the Sun and the fifth largest planet.',
    descriptionSource: overviewSource,
    facts: facts(12756, 149.6),
  },
  {
    id: 'mars',
    label: 'Mars',
    color: '#ed8566',
    displayRadiusSvgUnits: 6,
    displayOrbitRadiusSvgUnits: 145,
    startingAngleRadians: 3.5,
    orbitalPeriodDays: 687,
    orbitalPeriodSource: metricSource,
    description:
      'Mars is the fourth planet from the Sun, a small world with a solid surface.',
    descriptionSource: overviewSource,
    facts: facts(6792, 228),
  },
  {
    id: 'jupiter',
    label: 'Jupiter',
    color: '#d8ac87',
    displayRadiusSvgUnits: 16,
    displayOrbitRadiusSvgUnits: 190,
    startingAngleRadians: 5.8,
    orbitalPeriodDays: 4331,
    orbitalPeriodSource: metricSource,
    description:
      'The largest planet in our solar system, Jupiter is a gas giant.',
    descriptionSource: overviewSource,
    facts: facts(142984, 778.5),
  },
  {
    id: 'saturn',
    label: 'Saturn',
    color: '#e6cf91',
    displayRadiusSvgUnits: 13,
    displayOrbitRadiusSvgUnits: 235,
    startingAngleRadians: 2.6,
    orbitalPeriodDays: 10747,
    orbitalPeriodSource: metricSource,
    description:
      'Saturn is a gas giant and the second largest planet in our solar system.',
    descriptionSource: overviewSource,
    facts: facts(120536, 1432),
  },
  {
    id: 'uranus',
    label: 'Uranus',
    color: '#8cddd9',
    displayRadiusSvgUnits: 10,
    displayOrbitRadiusSvgUnits: 275,
    startingAngleRadians: 0.9,
    orbitalPeriodDays: 30589,
    orbitalPeriodSource: metricSource,
    description:
      'Uranus is an ice giant, seventh from the Sun and third largest among the planets.',
    descriptionSource: overviewSource,
    facts: facts(51118, 2867),
  },
  {
    id: 'neptune',
    label: 'Neptune',
    color: '#758ff0',
    displayRadiusSvgUnits: 10,
    displayOrbitRadiusSvgUnits: 315,
    startingAngleRadians: 4,
    orbitalPeriodDays: 59800,
    orbitalPeriodSource: metricSource,
    description:
      'An ice giant, Neptune is the most distant of the eight planets from the Sun.',
    descriptionSource: overviewSource,
    facts: facts(49528, 4515),
  },
]

export const sun = {
  label: 'Sun',
  color: '#ffd27d',
  displayRadiusSvgUnits: 23,
} as const
