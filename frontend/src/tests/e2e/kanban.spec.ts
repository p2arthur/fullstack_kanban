import { test, expect } from '@playwright/test'

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads with 5 columns and dummy data', async ({ page }) => {
    const titles = page.getByTestId('column-title')
    await expect(titles).toHaveCount(5)
    const cards = page.getByTestId('card')
    await expect(cards).toHaveCount(13)
  })

  test('adds a card to a column', async ({ page }) => {
    await page.getByTestId('add-card-button').first().click()
    await page.getByTestId('card-title-input').fill('New Test Card')
    await page.getByTestId('card-details-input').fill('Some details')
    await page.getByTestId('add-card-submit').click()

    const cards = page.getByTestId('card')
    await expect(cards).toHaveCount(14)
    await expect(page.getByText('New Test Card')).toBeVisible()
  })

  test('cancels adding a card', async ({ page }) => {
    await page.getByTestId('add-card-button').first().click()
    await page.getByTestId('card-title-input').fill('Will be cancelled')
    await page.getByTestId('add-card-cancel').click()

    await expect(page.getByTestId('add-card-form')).toHaveCount(0)
    await expect(page.getByText('Will be cancelled')).toHaveCount(0)
  })

  test('deletes a card', async ({ page }) => {
    const firstCard = page.getByTestId('card').first()
    await firstCard.hover()
    await firstCard.getByTestId('delete-card').click()
    await expect(page.getByTestId('card')).toHaveCount(12)
  })

  test('renames a column', async ({ page }) => {
    const firstTitle = page.getByTestId('column-title').first()
    await firstTitle.click()

    const input = page.getByTestId('column-title-input')
    await input.fill('Sprint 1')
    await input.press('Enter')

    await expect(page.getByTestId('column-title').first()).toHaveText('Sprint 1')
  })

  test('escaping column rename restores original title', async ({ page }) => {
    const firstTitle = page.getByTestId('column-title').first()
    const originalText = await firstTitle.textContent()
    await firstTitle.click()

    const input = page.getByTestId('column-title-input')
    await input.fill('Temporary Name')
    await input.press('Escape')

    await expect(page.getByTestId('column-title').first()).toHaveText(originalText ?? '')
  })

  test('drag card from first column to second column', async ({ page }) => {
    // Get first card in column 1 and drop zone of column 2
    const firstCard = page.getByTestId('card').first()
    const secondColumnCards = page.getByTestId('column-cards').nth(1)

    const cardBox = await firstCard.boundingBox()
    const targetBox = await secondColumnCards.boundingBox()

    if (!cardBox || !targetBox) throw new Error('Could not get bounding boxes')

    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(100)
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 20, { steps: 10 })
    await page.waitForTimeout(100)
    await page.mouse.up()

    // Column 1 should now have 2 cards, column 2 should have 4
    const col1Cards = page.getByTestId('column-cards').nth(0).getByTestId('card')
    const col2Cards = page.getByTestId('column-cards').nth(1).getByTestId('card')
    await expect(col1Cards).toHaveCount(2)
    await expect(col2Cards).toHaveCount(4)
  })
})
