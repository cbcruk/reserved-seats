import { expect, test, type Locator, type Page } from '@playwright/test'

async function center(locator: Locator): Promise<{ x: number; y: number }> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Element is not visible')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

async function zoomPercent(page: Page): Promise<number> {
  const text = await page.getByText(/^\d+%$/).textContent()
  return Number(text?.replace('%', ''))
}

test('drags an element to move it', async ({ page }) => {
  await page.goto('/')
  const stage = page.locator('[data-kind="shape"]').first()
  const from = await center(stage)

  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + 60, from.y + 30, { steps: 5 })
  await page.mouse.up()

  const zoom = (await zoomPercent(page)) / 100
  const x = Number(await page.getByLabel('X', { exact: true }).inputValue())
  expect(x).toBeGreaterThan(500 + 60 / zoom - 3)
  expect(x).toBeLessThan(500 + 60 / zoom + 3)

  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.getByLabel('X', { exact: true })).toHaveValue('500')
})

test('selects elements with a marquee', async ({ page }) => {
  await page.goto('/')
  const t1 = await center(page.locator('[data-kind="round-table"]').nth(0))
  const t4 = await center(page.locator('[data-kind="round-table"]').nth(3))

  await page.mouse.move(t1.x - 50, t1.y - 50)
  await page.mouse.down()
  await page.mouse.move(t4.x + 50, t4.y + 50, { steps: 5 })
  await page.mouse.up()

  await expect(page.getByText('4 elements selected')).toBeVisible()
})

test('pans with space + drag without moving elements', async ({ page }) => {
  await page.goto('/')
  const stage = page.locator('[data-kind="shape"]').first()
  const bar = page.locator('[data-kind="shape"]').nth(1)
  const stageBefore = await center(stage)
  const barBefore = await center(bar)

  await page.keyboard.down('Space')
  await page.mouse.move(stageBefore.x, stageBefore.y)
  await page.mouse.down()
  await page.mouse.move(stageBefore.x + 80, stageBefore.y + 40, { steps: 5 })
  await page.mouse.up()
  await page.keyboard.up('Space')

  const barAfter = await center(bar)
  expect(barAfter.x - barBefore.x).toBeCloseTo(80, 0)
  expect(barAfter.y - barBefore.y).toBeCloseTo(40, 0)
  await expect(page.getByLabel('Name')).not.toHaveValue('Stage')
})

test('zooms with the controls and the wheel, then fits again', async ({ page }) => {
  await page.goto('/')
  const fitted = await zoomPercent(page)

  await page.getByRole('button', { name: 'Zoom in' }).click()
  expect(await zoomPercent(page)).toBe(Math.round(fitted * 1.25))

  const stage = await center(page.locator('[data-kind="shape"]').first())
  await page.mouse.move(stage.x, stage.y)
  await page.keyboard.down('Control')
  await page.mouse.wheel(0, -100)
  await page.keyboard.up('Control')
  await expect.poll(() => zoomPercent(page)).toBeGreaterThan(Math.round(fitted * 1.25))

  await page.getByRole('button', { name: 'Fit' }).click()
  await expect.poll(() => zoomPercent(page)).toBe(fitted)
})

test('keeps fitting the venue when the window resizes until the user zooms', async ({ page }) => {
  await page.goto('/')
  const fitted = await zoomPercent(page)

  await page.setViewportSize({ width: 1600, height: 1000 })
  await expect.poll(() => zoomPercent(page)).toBeGreaterThan(fitted)

  await page.getByRole('button', { name: 'Zoom out' }).click()
  const zoomed = await zoomPercent(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect.poll(() => zoomPercent(page)).toBe(zoomed)
})
