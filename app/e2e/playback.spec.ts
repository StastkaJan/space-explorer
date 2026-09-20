import { expect, test } from '@playwright/test'

test('selection, playback, scrubbing endpoints, explicit resume, and reset share one state', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.goto('/')
  const controls = page.getByRole('region', { name: 'Simulation controls' })
  const time = controls.locator('.simulation-time')
  const speed = controls.getByLabel('Speed (simulated days per real second)')
  const scrub = controls.getByRole('slider', { name: 'Scrub simulated day' })
  const earth = page.locator('[data-planet-id="earth"]')
  const initialPosition = await earth.getAttribute('transform')
  await page.locator('#planet-earth').click()
  await page.clock.runFor(1000)
  await speed.selectOption('365')
  await page.clock.runFor(1000)
  await controls.getByRole('button', { name: 'Pause', exact: true }).click()
  await scrub.fill('1234')
  await expect(time).toHaveText('Simulated day: 1,234')
  const scrubbedPosition = await earth.getAttribute('transform')
  await page.clock.runFor(3000)
  await expect(earth).toHaveAttribute('transform', scrubbedPosition!)
  await expect(speed).toHaveValue('365')
  await expect(
    page.getByRole('heading', { name: 'Earth', exact: true }),
  ).toBeVisible()
  await controls.getByRole('button', { name: 'Play', exact: true }).click()
  await page.clock.runFor(1000)
  await expect(time).not.toHaveText('Simulated day: 1,234')
  const beforeReturn = await time.textContent()
  await page.getByRole('button', { name: 'Back to solar system' }).click()
  await expect(time).toHaveText(beforeReturn!)
  await expect(speed).toHaveValue('365')
  await expect(
    controls.getByRole('button', { name: 'Pause', exact: true }),
  ).toBeVisible()
  await scrub.focus()
  await page.keyboard.press('End')
  await expect(scrub).toHaveValue('60000')
  await expect(
    controls.getByRole('button', { name: 'Play', exact: true }),
  ).toBeDisabled()
  await page.keyboard.press('Home')
  await expect(scrub).toHaveValue('0')
  await expect(
    controls.getByRole('button', { name: 'Play', exact: true }),
  ).toBeEnabled()
  await controls.getByRole('button', { name: 'Play', exact: true }).click()
  // A pointer gesture pauses before any new range value is emitted.
  await scrub.dispatchEvent('pointerdown')
  await expect(
    controls.getByRole('button', { name: 'Play', exact: true }),
  ).toBeVisible()
  await page.clock.runFor(1000)
  await expect(scrub).toHaveValue('0')
  await scrub.fill('2000')
  await page.locator('#planet-mars').click()
  await controls.getByRole('button', { name: 'Play', exact: true }).click()
  await page.clock.runFor(1000)
  await controls.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(time).toHaveText('Simulated day: 0')
  await expect(speed).toHaveValue('30')
  await expect(scrub).toHaveValue('0')
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'Meet the neighbors.' }),
  ).toBeVisible()
  await page.clock.runFor(2000)
  await expect(earth).toHaveAttribute('transform', initialPosition!)
  await expect(
    controls.getByRole('button', { name: 'Play', exact: true }),
  ).toBeVisible()
})

test('playback starts at the epoch, pauses by keyboard, and preserves time when changing speed', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.goto('/')
  const controls = page.getByRole('region', { name: 'Simulation controls' })
  const pause = controls.getByRole('button', { name: 'Pause', exact: true })
  const time = controls.locator('.simulation-time')
  const earth = page.locator('[data-planet-id="earth"]')
  await expect(time).toHaveText('Simulated day: 0')
  await expect(pause).toBeVisible()
  const initialPosition = await earth.getAttribute('transform')
  await page.clock.runFor(1000)
  await expect(earth).not.toHaveAttribute('transform', initialPosition!)
  for (
    let step = 0;
    step < 25 &&
    !(await pause.evaluate((element) => element === document.activeElement));
    step++
  ) {
    await page.keyboard.press('Tab')
  }
  await expect(pause).toBeFocused()
  await page.keyboard.press('Space')
  const stoppedTime = await time.textContent()
  const stoppedPosition = await earth.getAttribute('transform')
  await page.keyboard.press('Tab')
  const speed = controls.getByLabel('Speed (simulated days per real second)')
  await expect(speed).toBeFocused()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(speed).toHaveValue('1000')
  await page.clock.runFor(2000)
  await expect(time).toHaveText(stoppedTime!)
  await expect(earth).toHaveAttribute('transform', stoppedPosition!)
  await controls.getByRole('button', { name: 'Play', exact: true }).click()
  await page.clock.runFor(1000)
  await expect(time).not.toHaveText(stoppedTime!)
  await speed.selectOption('1')
  await expect(pause).toBeVisible()
})

test('reduced motion starts paused and explicit Play works at a narrow viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.goto('/')
  const controls = page.getByRole('region', { name: 'Simulation controls' })
  await expect(
    controls.getByRole('button', { name: 'Play', exact: true }),
  ).toBeVisible()
  await page.clock.runFor(5000)
  await expect(controls.locator('.simulation-time')).toHaveText(
    'Simulated day: 0',
  )
  await controls.getByRole('button', { name: 'Play', exact: true }).click()
  await page.clock.runFor(1000)
  await expect(controls.locator('.simulation-time')).not.toHaveText(
    'Simulated day: 0',
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await controls.screenshot({ path: 'test-results/playback-narrow.png' })
})
