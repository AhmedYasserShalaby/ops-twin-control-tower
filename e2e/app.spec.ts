import { expect, test, type Page } from '@playwright/test'

async function openNavLink(page: Page, name: RegExp) {
  const link = page.getByRole('link', { name })
  if (!(await link.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: /Toggle menu/i }).click()
  }
  await link.click()
}

test('runs the core product journey', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Command center' })).toBeVisible()
  await page.getByRole('button', { name: /Apply recommended action/i }).click()

  await openNavLink(page, /Scenario/i)
  await expect(page.getByRole('heading', { name: 'Scenario builder' })).toBeVisible()
  await page.getByRole('button', { name: /Add scenario: Supplier delay/i }).click()

  await openNavLink(page, /Analytics/i)
  await expect(page.getByRole('heading', { name: 'Analytics workbench' })).toBeVisible()
  await page.getByRole('button', { name: 'Run Monte Carlo' }).click()
  await expect(page.getByText('Median profit')).toBeVisible({ timeout: 10_000 })

  await openNavLink(page, /Postmortem/i)
  await expect(page.getByRole('heading', { name: 'Recovery postmortem', exact: true })).toBeVisible()
  await expect(page.getByText(/Root cause/i)).toBeVisible()

  expect(errors).toEqual([])
})

test('renders without horizontal overflow on mobile', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})
