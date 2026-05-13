import { expect, test } from '@playwright/test'

test('runs the core recruiter journey', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Command center' })).toBeVisible()
  await page.getByRole('button', { name: /Apply advisor recommendation/i }).click()

  await page.getByRole('link', { name: /Scenario/i }).click()
  await expect(page.getByRole('heading', { name: 'Scenario builder' })).toBeVisible()
  await page.getByRole('button', { name: /Add scenario: Supplier delay/i }).click()

  await page.getByRole('link', { name: /Analytics/i }).click()
  await expect(page.getByRole('heading', { name: 'Analytics workbench' })).toBeVisible()
  await page.getByRole('button', { name: 'Run Monte Carlo' }).click()
  await expect(page.getByText('Median profit')).toBeVisible({ timeout: 10_000 })

  await page.getByRole('link', { name: /Postmortem/i }).click()
  await expect(page.getByRole('heading', { name: 'Generated recovery postmortem' })).toBeVisible()
  await expect(page.getByText(/Root cause/i)).toBeVisible()

  expect(errors).toEqual([])
})

test('renders without horizontal overflow on mobile', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})
