import { test, expect } from '@playwright/test';

test('verify staff console security and auditing', async ({ page }) => {
  // 1. Navigate to Staff Console
  await page.goto('http://localhost:5173/admin/staff');
  
  // 2. Go to Client Directory
  await page.click('button:has-text("Client Directory")');
  
  // 3. Find Alex Founder
  await page.fill('input[placeholder="Search by email or LLC name..."]', 'alex.founder');
  
  // 4. Open Vault
  await page.click('button:has-text("View Vault")');
  
  // 5. Try to Decrypt (should fail/show alert)
  await page.click('button:has-text("Decrypt"):first-child');
  await expect(page.locator('text=Error: Staff Identity Verification Required')).toBeVisible();
  
  // 6. Verify Identity
  await page.click('button:has-text("Verify Identity")');
  await expect(page.locator('text=Staff Identity Confirmed via Protocol Alpha')).toBeVisible();
  
  // 7. Enter Passphrase and Decrypt
  await page.fill('input[placeholder="Vault Access Key..."]', 'charter-2026');
  await page.click('button:has-text("Decrypt"):first-child');
  
  // 8. Wait for decryption and success message
  await expect(page.locator('text=Artifact Decrypted Successfully')).toBeVisible();
  
  // 9. Close Vault
  await page.click('button:has(svg:has-class("lucide-x")):visible');
  
  // 10. Open Audit Trails
  await page.click('button:has-text("Audit Trails")');
  
  // 11. Verify the "Zero-Knowledge Decryption" log entry
  await expect(page.locator('text=Zero-Knowledge Decryption')).toBeVisible();
  await expect(page.locator('text=Success')).toBeVisible();
  
  console.log("Verification Complete: All security and auditing features are functional.");
});
