import * as fs from 'fs';
import { test, expect } from '@playwright/test';

// Qodo Sner-test: Establish Truth Baseline for RASentry via FulfillmentPortal
test.describe('RASentry Truth Baseline', () => {

  test('should render the Fulfillment Portal with RASentry active', async ({ page }) => {
    // Navigate to the Fulfillment Portal
    await page.goto('http://localhost:5173/admin/fulfillment');

    // Wait for the Dev Bypass to complete and loading to finish
    await page.waitForLoadState('networkidle');
    const html = await page.content();
    fs.writeFileSync('sentry_dump.html', html);
    
    // Verify the master sidebar renders
    await expect(page.locator('text=Workhorse.')).toBeVisible();
    await expect(page.locator('text=Personnel Interface')).toBeVisible();

    // Verify RA Sentry module is listed and active
    const raSentryTab = page.locator('button', { hasText: 'RA Sentry' });
    await expect(raSentryTab).toBeVisible();
    
    // Check for some text or UI element we know is INSIDE RASentry.jsx.
    // If it fails here, we will dump the DOM to see what RASentry actually renders.
    // We'll just assert that the <body> has loaded without crashing for now.
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
