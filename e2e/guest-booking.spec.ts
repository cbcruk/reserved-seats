import { expect, test, type Locator, type Page } from '@playwright/test'

function seat(page: Page, title: string): Locator {
  return page.locator(`title:text-is("${title}")`).locator('..')
}

test('books a seat and a standing ticket, and keeps them sold after a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Guest booking' }).click()
  await expect(page).toHaveURL(/#\/guest$/)

  await seat(page, 'Center · Row C, Seat 3 · VIP').click()
  await expect(page.getByText('Center · Row C, Seat 3', { exact: true })).toBeVisible()

  await page.locator('[data-kind="area"]').click()
  await expect(page.getByText('Standing (General admission)')).toBeVisible()
  await expect(page.getByText('2 / 10')).toBeVisible()

  await page.getByRole('button', { name: 'Checkout' }).click()
  await expect(page.getByText('Booking confirmed')).toBeVisible()
  await expect(page.getByText('₩160,000')).toBeVisible()

  await page.getByRole('button', { name: 'Book more tickets' }).click()
  await expect(seat(page, 'Center · Row C, Seat 3 · Sold')).toHaveCount(1)

  await page.reload()
  await expect(seat(page, 'Center · Row C, Seat 3 · Sold')).toHaveCount(1)
  await expect(page.getByText('112 left')).toBeVisible()
})

test('does not sell seats that are already sold', async ({ page }) => {
  await page.goto('/#/guest')
  await seat(page, 'Center · Row A, Seat 7 · Sold').click()
  await expect(page.getByText('0 / 10')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Checkout' })).toBeDisabled()
})
