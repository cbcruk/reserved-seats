import { expect, test, type Page } from '@playwright/test'

async function selectStage(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator('[data-kind="shape"]').first().click()
  await expect(page.getByLabel('Name')).toHaveValue('Stage')
}

test('nudges, rotates, undoes and redoes the selected element', async ({ page }) => {
  await selectStage(page)
  const x = page.getByLabel('X', { exact: true })
  const rotation = page.getByLabel('Rotation')

  await page.keyboard.press('ArrowRight')
  await expect(x).toHaveValue('501')
  await page.keyboard.press('Shift+ArrowRight')
  await expect(x).toHaveValue('511')
  await page.keyboard.press(']')
  await expect(rotation).toHaveValue('15')

  await page.keyboard.press('ControlOrMeta+z')
  await expect(rotation).toHaveValue('0')
  await page.keyboard.press('ControlOrMeta+z')
  await expect(x).toHaveValue('501')
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect(x).toHaveValue('511')
})

test('duplicates and deletes the selection', async ({ page }) => {
  await selectStage(page)
  const shapes = page.locator('[data-kind="shape"]')
  await expect(shapes).toHaveCount(2)

  await page.keyboard.press('ControlOrMeta+d')
  await expect(shapes).toHaveCount(3)
  await expect(page.getByLabel('Name')).toHaveValue('Shape 3')

  await page.keyboard.press('Delete')
  await expect(shapes).toHaveCount(2)
  await expect(page.getByText('Seat selection')).toHaveCount(0)
})

test('switches tools and selects everything', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('s')
  await expect(page.getByRole('button', { name: 'Seats', pressed: true })).toBeVisible()
  await page.keyboard.press('v')
  await expect(page.getByRole('button', { name: 'Selection', pressed: true })).toBeVisible()

  await page.keyboard.press('ControlOrMeta+a')
  await expect(page.getByText('12 elements selected')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByText('12 elements selected')).toHaveCount(0)
})

test('ignores shortcuts while typing in a field', async ({ page }) => {
  await selectStage(page)
  await page.getByLabel('Name').press('ArrowRight')
  await page.getByLabel('Name').press('Delete')
  await expect(page.getByLabel('X', { exact: true })).toHaveValue('500')
  await expect(page.locator('[data-kind="shape"]')).toHaveCount(2)
})

test('keeps edits after a reload', async ({ page }) => {
  await selectStage(page)
  await page.keyboard.press('Shift+ArrowDown')
  await page.reload()
  await page.locator('[data-kind="shape"]').first().click()
  await expect(page.getByLabel('Y', { exact: true })).toHaveValue('80')
})
