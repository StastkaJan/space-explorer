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

  await page.getByRole('button', { name: 'Select Mars', exact: true }).click()
  await expect(
    details.getByRole('heading', { name: 'Mars', exact: true }),
  ).toBeVisible()
  await expect(list.getByRole('button', { name: /Mars/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('keyboard selects a planet and returns to the system view', async ({
  page,
}) => {
  await page.goto('/')
  const earth = page
    .getByRole('navigation', { name: 'Choose a planet' })
    .getByRole('button', { name: /Earth/ })

  // Follow the real tab order rather than focusing the target programmatically.
  for (
    let step = 0;
    step < 20 &&
    !(await earth.evaluate((element) => element === document.activeElement));
    step++
  ) {
    await page.keyboard.press('Tab')
  }
  await expect(earth).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Earth', exact: true }),
  ).toBeVisible()

  const back = page.getByRole('button', { name: /Back to solar system/ })
  for (
    let step = 0;
    step < 20 &&
    !(await back.evaluate((element) => element === document.activeElement));
    step++
  ) {
    await page.keyboard.press('Tab')
  }
  await expect(back).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Meet the neighbors.' }),
  ).toBeVisible()
  await expect(earth).toHaveAttribute('aria-pressed', 'false')
  await expect(earth).toBeFocused()
})
