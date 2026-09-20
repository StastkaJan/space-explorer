import { expect, test } from '@playwright/test'

const labels = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
]

test('every close-up is centered and stable while the shared clock continues', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.goto('/')
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  const list = page.getByRole('navigation', { name: 'Choose a planet' })
  const diagram = page.locator('.solar-system')

  for (const label of labels) {
    await list.getByRole('button', { name: new RegExp(label) }).click()
    const marker = page.getByRole('button', {
      name: `Select ${label}`,
      exact: true,
    })
    await expect(
      page.getByRole('heading', { name: label, exact: true }),
    ).toBeVisible()
    const box = (await marker.boundingBox())!
    const frame = (await diagram.boundingBox())!
    expect(
      Math.abs(box.x + box.width / 2 - (frame.x + frame.width / 2)),
    ).toBeLessThan(1)
    expect(box.width).toBeLessThan(frame.width)
    expect(box.height).toBeLessThan(frame.height)
    expect(box.width).toBeGreaterThan(frame.width / 4)
    await expect(diagram.getByRole('button')).toHaveCount(1)
    const orbit = await marker.getAttribute('transform')
    await page.clock.runFor(1000)
    await expect(marker).not.toHaveAttribute('transform', orbit!)
    expect(await marker.boundingBox()).toEqual(box)
    await diagram.screenshot({
      path: `test-results/closeup-${label.toLowerCase()}.png`,
    })
  }
  await expect(
    page.getByRole('button', { name: 'Pause', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: /Back to solar system/ }).click()
  await expect(diagram.getByRole('button')).toHaveCount(8)
  await expect(list.getByRole('button', { name: /Neptune/ })).toBeFocused()
})

test('interrupted travel settles on the latest selection, reset, and motion preference', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.goto('/')
  const list = page.getByRole('navigation', { name: 'Choose a planet' })
  const diagram = page.locator('.solar-system')
  await page.getByRole('button', { name: 'Select Earth', exact: true }).click()
  const earth = page.locator('[data-planet-id="earth"]')
  await expect(earth).toHaveCSS('transition-duration', '0.65s')
  await expect
    .poll(() => earth.evaluate((element) => element.getAnimations().length))
    .toBeGreaterThan(0)
  await list.getByRole('button', { name: /Jupiter/ }).click()
  await page.getByRole('button', { name: /Reset/ }).click()
  await expect(diagram).not.toHaveClass(/camera-selected/)
  await expect(diagram.getByRole('button')).toHaveCount(8)
  await list.getByRole('button', { name: /Mercury/ }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const mercury = page.locator('[data-planet-id="mercury"]')
  await expect(mercury).toHaveCSS('transition-duration', '0s')
  await expect(mercury).toHaveCSS('transform', 'matrix(24, 0, 0, 24, 0, 0)')
  await expect(
    page.getByRole('heading', { name: 'Mercury', exact: true }),
  ).toBeVisible()
  await page.clock.runFor(2000)
  await expect(mercury).toHaveCSS('transform', 'matrix(24, 0, 0, 24, 0, 0)')
  await page.setViewportSize({ width: 320, height: 760 })
  await diagram.screenshot({ path: 'test-results/closeup-narrow.png' })
})
