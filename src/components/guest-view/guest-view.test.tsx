import { expect, it } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { bySvgTitle, renderWithSeating } from '../../test/render-app'
import { GuestView } from './guest-view'

it('books a seat and a standing ticket, then shows the seat as sold', async () => {
  await renderWithSeating(<GuestView />)

  await userEvent.click(bySvgTitle('Center · Row C, Seat 3 · VIP'))
  await expect.element(page.getByText('Center · Row C, Seat 3')).toBeVisible()

  await userEvent.click(document.querySelector('[data-kind="area"]')!)
  await expect.element(page.getByText('Standing (General admission)')).toBeVisible()
  await expect.element(page.getByText('2 / 10')).toBeVisible()

  await userEvent.click(page.getByRole('button', { name: 'Checkout' }))
  await expect.element(page.getByText('Booking confirmed')).toBeVisible()
  await expect.element(page.getByText('₩160,000')).toBeVisible()

  expect(bySvgTitle('Center · Row C, Seat 3 · Sold')).toBeDefined()
  const saved = JSON.parse(localStorage.getItem('reserved-seats:v1')!)
  expect(saved.sales.areaSold.ga).toBe(38)
})
