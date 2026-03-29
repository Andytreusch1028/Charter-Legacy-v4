import { test, expect } from '@playwright/test';

test('verify staff console security and auditing', async ({ page }) => {
  // Set larger viewport to avoid responsive layout issues
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // 1. Navigate to Staff Console
  await page.goto('http://localhost:5173/staff');
  
  // 2. Go to Client Directory
  await page.click('button:has-text("Client Directory")');
  
  // Wait for loading to finish
  await expect(page.locator('text=Syncing Client Nodes...')).not.toBeVisible({ timeout: 10000 });
  
  // 3. Find any client (search for 'a')
  const searchInput = page.locator('input[placeholder="Search by name or email..."]');
  await searchInput.waitFor({ state: 'visible' });
  await searchInput.fill('a');
  
  // 4. Open Vault
  const vaultButton = page.locator('button:has-text("Vault")').first();
  await vaultButton.waitFor({ state: 'visible' });
  await vaultButton.click();
  
  // 5. Try to Decrypt (should fail/show Identity Check)
  await expect(page.locator('text=Identity Check Required')).toBeVisible();
  
  // 6. Verify Identity
  await page.click('button:has-text("Verify Identity")');
  await expect(page.locator('text=Staff Identity Confirmed via Protocol Alpha')).toBeVisible();
  
  // 7. Enter Passphrase and Decrypt
  await page.fill('input[placeholder="Vault Access Key..."]', 'charter-2026');
  await page.click('button:has-text("Decrypt Artifacts")');
  
  // 8. Wait for decryption and success message
  await expect(page.locator('text=Artifact Decrypted Successfully')).toBeVisible();
  
  // 9. Close Vault
  await page.click('button:has(svg):has-text(""):visible'); // Be lenient with the close button
  // Or better:
  await page.keyboard.press('Escape'); 
  
  // 10. Open Audit Trails
  await page.click('button:has-text("Audit"):first-child');
  
  // 11. Verify the "Zero-Knowledge Decryption" log entry
  await expect(page.locator('text=Zero-Knowledge Decryption')).toBeVisible();
  await expect(page.locator('text=Success')).toBeVisible();
  
  console.log("Verification Complete: All security and auditing features are functional.");
});
