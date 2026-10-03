import { test, expect, Page } from '@playwright/test'

// Same port as the dev server (PORT in .env, loaded by playwright.config.ts).
const BASE_URL = `http://localhost:${process.env.PORT || 3555}`

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}`)

    await expect(page).toHaveTitle(/Payload Blank Template/)

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Welcome to your new project.')
  })
})
