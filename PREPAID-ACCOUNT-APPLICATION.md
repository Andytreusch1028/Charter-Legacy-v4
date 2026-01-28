# Florida Prepaid Sunbiz E-File Account Application

## Application Package for Charter Legacy LLC

**Date:** January 27, 2026  
**Applicant:** Charter Legacy LLC  
**Purpose:** High-volume LLC and Corporation filing automation

---

## 📋 Required Documents

### 1. Prepaid Sunbiz E-File Account Application

**Download Forms:**

- Application Form: [http://dos.myflorida.com/sunbiz/forms/](http://dos.myflorida.com/sunbiz/forms/)
- Deposit Slip: Included with application

**Account Information to Provide:**

| Field           | Value                                              |
| --------------- | -------------------------------------------------- |
| Account Name    | Charter Legacy LLC                                 |
| Email Address   | [YOUR EMAIL HERE]                                  |
| Mailing Address | [YOUR BUSINESS ADDRESS]                            |
| Phone Number    | [YOUR PHONE]                                       |
| Fax Number      | [YOUR FAX]                                         |
| Contact Person  | [YOUR NAME]                                        |
| Password        | [Choose 4-12 characters, letters and numbers only] |

---

### 2. Initial Deposit Check

**Amount:** $2,000.00 (recommended starting balance)  
**Minimum:** $300.00

**Check Details:**

- **Payable to:** Florida Department of State
- **Memo line:** "Prepaid E-File Account - Charter Legacy LLC"
- **Currency:** U.S. currency only
- **Bank:** Must be drawn from U.S. bank
- **Type:** Business check (no personal checks, no third-party checks)

---

## 📮 Submission Instructions

### Mail To:

```
Division of Corporations
Attn: Shawn Logan
Public Access Accounts
P.O. Box 6327
Tallahassee, FL 32314
```

### Or Hand-Deliver To:

```
Division of Corporations
The Centre of Tallahassee
2415 N. Monroe Street, Suite 810
Tallahassee, Florida 32303
```

**Processing Time:** 3-5 business days  
**You Will Receive:** Account number and confirmation via email

---

## 💰 Account Management Strategy

### Initial Setup

- **Deposit:** $2,000
- **Covers:** ~16 LLC filings ($125 each)
- **Buffer:** Prevents "Insufficient Funds" rejections

### Ongoing Refills

- **Monitor:** Check balance daily via Sunbiz portal
- **Alert Threshold:** Refill when balance < $500
- **Refill Amount:** $2,000 (brings balance back to comfortable level)
- **Method:** Mail check or deliver in person

### Reconciliation

- **Frequency:** Daily export of transactions
- **Match:** Cross-reference with your Supabase `llcs` table
- **Audit:** Sovereign Ledger tracks all state fee payments

---

## ✅ Post-Approval Steps

Once you receive your account number:

1. **Store Credentials Securely**

   ```sql
   -- Store in Supabase Vault (encrypted)
   INSERT INTO secrets (service, account_number, account_pin)
   VALUES ('sunbiz_prepaid', '[YOUR_ACCOUNT_NUMBER]', '[YOUR_PIN]');
   ```

2. **Update Playwright Script**
   - Uncomment Phase C payment authorization code
   - Test with one filing

3. **Run Smoke Test**
   - Process test LLC to verify end-to-end workflow
   - Confirm tracking number received
   - Verify balance deduction ($125)

4. **Enable Production Automation**
   - Deploy Supabase Edge Function
   - Configure webhook triggers
   - Monitor via Control Tower dashboard

---

## 📊 Expected Usage

### Year 1 Projections

- **Month 1-3:** 10-20 filings/month
- **Month 4-6:** 50-100 filings/month
- **Month 7-12:** 100-200 filings/month

### Account Balance Management

- **Conservative:** Maintain $2,000 minimum
- **High Volume:** Maintain $5,000 minimum (40 filings buffer)
- **Refill Frequency:** Weekly during growth phase

---

## 🔐 Security Protocols

### Credential Protection

- ✅ Store in Supabase Vault (AES-256 encryption)
- ✅ Rotate PIN quarterly
- ✅ Zero-Knowledge Key pattern (< 500ms exposure)
- ✅ Service account access only (no human access to PIN)

### Audit Trail

- ✅ Every deduction logged with tracking number
- ✅ Cross-reference with LLC filings
- ✅ Monthly reconciliation report
- ✅ Immutable audit log (cryptographically signed)

---

## 📞 Sunbiz Contact Information

**General Inquiries:**

- Phone: (850) 245-6052
- Website: [http://dos.myflorida.com/sunbiz/](http://dos.myflorida.com/sunbiz/)

**Prepaid Account Questions:**

- Contact: Shawn Logan
- Email: [Check Sunbiz website for current email]
- Phone: (850) 245-6052 (ask for Public Access Accounts)

---

## 📝 Checklist Before Mailing

- [ ] Completed Application Form (all fields filled, legible)
- [ ] Completed Deposit Slip
- [ ] Business check for $2,000 made payable to "Florida Department of State"
- [ ] Check memo line includes "Prepaid E-File Account - Charter Legacy LLC"
- [ ] Contact information is accurate (email will receive account number)
- [ ] Password is 4-12 characters (letters and numbers only)
- [ ] All documents signed where required
- [ ] Mailed to correct address (P.O. Box 6327)
- [ ] Tracking confirmation if using certified mail (recommended)

---

## 🚀 Go-Live Timeline

| Milestone                     | Timeline | Status     |
| ----------------------------- | -------- | ---------- |
| Mail application + check      | Day 1    | ⏳ Pending |
| Sunbiz processing             | Day 2-6  | ⏳ Pending |
| Receive account number        | Day 7    | ⏳ Pending |
| Store credentials in Supabase | Day 8    | ⏳ Pending |
| Run test filing               | Day 9    | ⏳ Pending |
| Enable production automation  | Day 10   | ⏳ Pending |

**Total time to automation: ~10 days from today**

---

## 💡 Pro Tips

1. **Use Certified Mail** - Track your application delivery
2. **Call to Confirm Receipt** - After 5 business days, call to verify receipt
3. **Set Up Email Alerts** - Forward Sunbiz confirmation emails to your system
4. **Start Conservative** - Test with 5-10 filings before full automation
5. **Monitor Daily** - Check balance every morning during ramp-up

---

**Next Step:** Print and complete the application forms, then mail with check!
