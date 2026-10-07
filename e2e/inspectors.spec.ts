import { expect, test } from '@playwright/test'

test('keeps partial number input while typing and syncs external changes', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-kind="shape"]').first().click()
  const x = page.getByLabel('X', { exact: true })

  await x.fill('')
  await expect(x).toHaveValue('')
  await x.fill('42')
  await expect(x).toHaveValue('42')

  await x.blur()
  await page.keyboard.press('ArrowLeft')
  await expect(x).toHaveValue('41')
})

test('clamps number input to its range', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-kind="shape"]').first().click()
  const rotation = page.getByLabel('Rotation')

  await rotation.fill('720')
  await rotation.blur()
  await expect(rotation).toHaveValue('360')
})

test('shows a mixed accessibility state and applies it to every selected seat', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('s')
  const seat = (title: string) =>
    page.locator('[data-kind="rows"]').first().locator(`title:text-is("${title}")`).locator('..')

  await seat('Row F, Seat 1').click()
  await seat('Row F, Seat 3').click({ modifiers: ['Shift'] })
  await expect(page.getByText('2 seats selected')).toBeVisible()

  const accessible = page.getByLabel('♿ Wheelchair accessible')
  await expect(accessible).not.toBeChecked()
  expect(await accessible.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true)

  await accessible.check()
  expect(await accessible.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(false)
  await expect(accessible).toBeChecked()
})
