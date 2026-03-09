import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Smoke', () => {
  test('app loads base page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    // Be lenient: just ensure we have some content in the body
    const content = await page.locator('body').innerText();
    expect(content.length).toBeGreaterThan(0);
  });
});
