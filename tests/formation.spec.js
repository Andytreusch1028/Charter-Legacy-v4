import { test, expect } from '@playwright/test';

// Use the authenticated state created in global.setup.js
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('FormationFactory Dashboard Refactor Baseline', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to the dashboard
        await page.goto('http://localhost:5173/admin/fulfillment');
        
        // Wait for and click the 'Formation Factory' sidebar button
        await page.locator('button:has-text("Formation Factory")').click();

        // Wait for the specific Sub-Nav to appear to confirm component loaded
        await page.waitForSelector('text="Formation Queue"');
    });

    test('should render the core dashboard elements', async ({ page }) => {
        // Assert view tabs exist
        await expect(page.getByRole('button', { name: 'Formation Queue' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Factory Stats' })).toBeVisible();

        // Assert search bar exists
        await expect(page.getByPlaceholder('Search entities…')).toBeVisible();

        // Check for injected cards
        await expect(page.getByRole('heading', { name: 'Charter Legacy AR Demo LLC' })).toBeVisible();
        
        // Use getByRole for reliable auto-waiting
        await expect(page.getByRole('button', { name: 'File Annual Report (Auto)' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'File Formation (Auto)' })).toBeVisible();
    });
});
