import { expect, test } from '@playwright/test'

test('select a planet from the list and diagram and read its facts', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  const list = page.getByRole('navigation', { name: 'Choose a planet' })
  const details = page.getByRole('complementary', { name: 'Planet details' })

  await list.getByRole('button', { name: /Earth/ }).click()
  await expect(
    details.getByRole('heading', { name: 'Earth', exact: true }),
  ).toBeVisible()
  await expect(list.getByRole('button', { name: /Earth/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(details.getByRole('link').first()).toHaveAttribute(
    'href',
    /^https:\/\//,
  )

  await page.getByRole('button', { name: /Back to solar system/ }).click()
  await page.getByRole('button', { name: 'Select Mars', exact: true }).click()
  await expect(
    details.getByRole('heading', { name: 'Mars', exact: true }),
  ).toBeVisible()
  await expect(list.getByRole('button', { name: /Mars/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('keyboard selects all eight planets and restores focus after returning', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const list = page.getByRole('navigation', { name: 'Choose a planet' })
  const details = page.getByRole('complementary', { name: 'Planet details' })

  for (const label of [
    'Mercury',
    'Venus',
    'Earth',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
  ]) {
    await test.step(label, async () => {
      const planet = list.getByRole('button', { name: new RegExp(label) })
      // Follow the real tab order rather than focusing programmatically.
      for (
        let step = 0;
        step < 25 &&
        !(await planet.evaluate(
          (element) => element === document.activeElement,
        ));
        step++
      ) {
        await page.keyboard.press('Tab')
      }
      await expect(planet).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(
        details.getByRole('heading', { name: label, exact: true }),
      ).toBeVisible()
      await expect(planet).toHaveAttribute('aria-pressed', 'true')
      await expect(details.locator('dl')).toContainText('Earth days')
      await expect(details.getByRole('link').first()).toHaveAttribute(
        'href',
        /^https:\/\//,
      )

      const back = page.getByRole('button', { name: /Back to solar system/ })
      for (
        let step = 0;
        step < 25 &&
        !(await back.evaluate((element) => element === document.activeElement));
        step++
      ) {
        await page.keyboard.press('Tab')
      }
      await expect(back).toBeFocused()
      await page.keyboard.press('Space')
      await expect(
        page.getByRole('heading', { name: 'Meet the neighbors.' }),
      ).toBeVisible()
      await expect(planet).toHaveAttribute('aria-pressed', 'false')
      await expect(planet).toBeFocused()
    })
  }
})
