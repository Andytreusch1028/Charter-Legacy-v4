import { test, expect } from '@playwright/test';

// Use the authenticated state created in global.setup.js
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('FulfillmentPortal Orchestrator Refactor Baseline', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to the portal dashboard
        await page.goto('http://localhost:5173/admin/fulfillment');
    });

    test('should render the core sidebar modules and footer', async ({ page }) => {
        // Wait for the main shell to load (bypassing auth)
        await page.waitForSelector('text="Workhorse."');

        // Assert all sidebar module buttons exist
        await expect(page.locator('button', { hasText: 'RA Sentry' })).toBeVisible();
        await expect(page.locator('button', { hasText: 'Inquiry Threads' })).toBeVisible();
        await expect(page.locator('button', { hasText: 'Formation Factory' })).toBeVisible();
        await expect(page.locator('button', { hasText: 'Node Admin' })).toBeVisible();
        await expect(page.locator('button', { hasText: 'Shield Command' })).toBeVisible();

        // Check the profile widget
        await expect(page.locator('text="admin"')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Settings' })).toBeVisible();
        await expect(page.locator('button', { hasText: 'Exit Session' })).toBeVisible();

        // Check the bottom security footer
        await expect(page.locator('text=AES-256-GCM Encryption Active')).toBeVisible();
        await expect(page.locator('text=CONNECTED')).toBeVisible();
    });
});
