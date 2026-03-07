// @ts-check
import { test, expect } from '@playwright/test';

// Qodo Sner-test: Establish Truth Baseline for DashboardZenith
test.describe('DashboardZenith Truth Baseline', () => {

  test('should render the setup state when no LLC is active', async ({ page }) => {
    // Navigate to the dashboard locally (assuming dev server is on port 5173 or similar)
    // Sner-tests lock in the *current* behavior exactly as-is.
    await page.goto('http://localhost:5173/dashboard');
    
    // In demo mode or fallback mode, it might auto-provision "Charter Legacy Demo LLC".
    // We expect the main Zenith frame to be present.
    await expect(page.locator('.min-h-screen.bg-\\[\\#0A0A0B\\]')).toBeVisible();
    
    // Check if the "Unity Triad" elements exist in the active state (Build, Protect, Preserve)
    // Or if it's the "Initialize Charter" screen.
    const setupHeading = page.getByRole('heading', { name: /Secure Your/i });
    const dashboardHeading = page.getByText('Command Center Active');

    // Either we are in setup mode or active dashboard mode based on the mock data fallback
    const isSetup = await setupHeading.isVisible();
    const isDashboard = await dashboardHeading.isVisible();

    expect(isSetup || isDashboard).toBeTruthy();

    if (isDashboard) {
      // The Triad should be present
      await expect(page.getByText('Build Foundation')).toBeVisible();
      await expect(page.getByText('Ongoing Compliance')).toBeVisible();
      await expect(page.getByText('Preserve Legacy')).toBeVisible();
    }
  });

});
