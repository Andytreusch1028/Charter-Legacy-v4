# Sunbiz Automation - PBP Integration (v5.6)

## Summary of Addition

This section documents the institutional automation strategy for Florida Division of Corporations (Sunbiz.gov) filing integration. It should be added to `charter-legacy.pbp.yaml` after the `@UPL_GUARDRAILS` section and before the `@END` marker.

---

## @SUNBIZ_AUTOMATION Section

```yaml
@SUNBIZ_AUTOMATION {
  // Institutional Automation for Florida Division of Corporations (Sunbiz.gov)
  // Strategy: Three-Phase Pipeline (Intent Calibration → Execution → Finance)
  // Implementation: Playwright + Supabase + Prepaid E-File Account
  // Version: 5.6 (Institutional Filing Engine)

  philosophy: "Treat Sunbiz.gov as a Statutory State Machine, not a website";
  compliance_mode: "Uses official Prepaid E-File Account program - fully authorized";

  // ============================================
  // PHASE A: Intent <|Calibration (The Forge)
  // ============================================
  phase_a_calibration: {
    purpose: "Transform natural language into Statutory XML before touching government portal";
    timing: "Occurs during LLC wizard completion, BEFORE payment";

    steps: {
      step_1_parse: "Extract: Entity Name, Principal Address, Management Type, Statutory Purpose",
      step_2_validate: "Regex enforcement for FL-605.0113 (no P.O. Boxes for Principal/RA addresses)",
      step_3_sanitize: "Force 'LLC' or 'PLLC' suffix based on product_type",
      step_4_precheck: "Run name availability query 2 seconds before submission (index drift protection)"
    };

    validation_rules: {
      po_box_regex: "/(P\\.?O\\.?\\s*Box|PMB|Post Office Box)/i",
      principal_address: "REJECT if matches po_box_regex",
      registered_agent: "REJECT if matches po_box_regex",
      name_suffix: {
        standard_llc: "Must end with 'LLC' or 'L.L.C.'",
        medical_pllc: "Must end with 'PLLC' or 'P.L.L.C.' per FL-621.02",
        contractor_llc: "Must end with 'LLC' or 'L.L.C.'"
      }
    };

    output: "Clean, statutory-compliant data object ready for Phase B injection";
  };

  // ============================================
  // PHASE B: Headless Execution (The Robot Scrivener)
  // ============================================
  phase_b_execution: {
    purpose: "Autonomous form completion via browser automation";
    technology: "Playwright (Node.js)";
    compute: "Supabase Edge Functions (Deno runtime)";
    timing: "Triggered immediately after customer payment confirmation";

    workflow: {
      step_1_initialize: {
        action: "Launch headless Chromium browser instance",
        config: {
          headless: true,
          viewport: "{width: 1920, height: 1080}",
          user_agent: "'Charter Legacy Filing Bot v5.6'"
        }
      };

      step_2_navigate: {
        action: "Direct endpoint targeting (bypass homepage)",
        url: "https://efile.sunbiz.org/corp_ss_llc_menu.html",
        wait_until: "networkidle"
      };

      step_3_inject: {
        action: "Fill form fields using robust selectors",
        selector_strategy: "text-based selectors (resilient to ID changes)",
        example: "await page.fill('input[aria-label=\"Entity Name\"]', llcData.name)",
        mandatory_fields: [
          "entity_name",
          "principal_address",
          "mailing_address",
          "registered_agent_name",
          "registered_agent_address",
          "organizer_name",
          "organizer_signature"
        ]
      };

      step_4_verify: {
        action: "Pre-submission screenshot + field value readback",
        screenshot_path: "vault/{llc_id}/pre-submission-{timestamp}.png",
        verification: "Read back all filled values, assert match with source data"
      };

      step_5_submit: {
        action: "Click submit button with retry logic",
        selector: "button:has-text('Submit')",
        retry: "3 attempts with 2-second delay"
      };

      step_6_confirm: {
        action: "Capture Sunbiz Tracking Number from confirmation page",
        selector: ".confirmation-number, #tracking-num",
        storage: "Update Supabase llcs table: tracking_number, filing_status='TRANSMITTED'"
      };
    };

    error_handling: {
      exponential_backoff: {
        trigger: "Sunbiz returns 503 (Maintenance Window)",
        strategy: "Wait 1s, 2s, 4s, 8s, 16s before retry",
        max_attempts: 5,
        fallback: "Mark filing as PENDING_MANUAL, alert Control Tower"
      };

      selector_failure: {
        trigger: "Primary selector not found",
        strategy: "Try fallback selectors, then screenshot + alert",
        fallback_selectors: ["by text", "by placeholder", "by name attribute"]
      };

      naming_conflict: {
        trigger: "'Not Distinguishable' error from Sunbiz",
        strategy: "Return error to user with suggested alternatives",
        message: "The name '{name}' is too similar to an existing entity. Please choose a more distinctive name."
      };
    };

    audit_trail: {
      screenshots: "Capture at: form_loaded, pre_submission, post_submission, error_state",
      logs: "Store in vault: {llc_id}/filing-log-{timestamp}.json",
      immutable: "All audit entries cryptographically signed"
    };
  };

  // ============================================
  // PHASE C: Financial Finality (Prepaid Account)
  // ============================================
  phase_c_finance: {
    purpose: "Authorize state filing fee payment via Prepaid E-File Account";
    method: "Sunbiz Prepaid E-File Account (official high-volume filer program)";

    prepaid_account: {
      account_type: "Sunbiz Prepaid E-File Account",
      minimum_balance: "$300",
      application_process: {
        step_1: "Complete 'Prepaid Sunbiz E-File Account Application' form",
        step_2: "Submit $300+ check to FL Division of Corporations",
        step_3: "Receive account number + PIN via email (3-5 business days)",
        address: "Division of Corporations, Attn: Shawn Logan, Public Access Accounts, P.O. Box 6327, Tallahassee, FL 32314"
      };

      account_management: {
        balance_monitoring: "Check balance daily via Sunbiz portal",
        auto_refill: "Alert when balance < $500, refill to $2000",
        reconciliation: "Daily export of transactions → match to llcs table"
      };
    };

    payment_execution: {
      step_1_credentials: {
        action: "Retrieve Prepaid Account credentials from Supabase Vault",
        fields: ["account_number", "account_pin"],
        exposure_window: "< 500ms (Zero-Knowledge Key pattern)"
      };

      step_2_select_payment: {
        action: "Select 'Pay with Prepaid Account' radio button",
        advantage: "Bypasses credit card gate, instant processing"
      };

      step_3_authorize: {
        action: "Enter account number + PIN",
        verification: "Check for 'Payment Approved' confirmation",
        fee_deduction: "$125 automatically deducted"
      };

      step_4_confirm: {
        action: "Capture payment confirmation screenshot",
        storage: "Vault as TIER_2_BUSINESS document",
        update_ledger: "Record $125 state fee payment in sovereign_ledger"
      };
    };

    insufficient_funds_protection: {
      prevention: "Bank linkage worker monitors balance, auto-refills when < $500",
      alert: "If balance insufficient, mark filing PENDING_FUNDING, alert Control Tower",
      recovery: "Manual deposit → resume automated filing within 24 hours"
    };
  };

  // ============================================
  // ONGOING MAINTENANCE & MONITORING
  // ============================================
  maintenance: {
    selector_versioning: {
      location: "sunbiz-selectors.json (version controlled)",
      updates: "Manual review when Sunbiz UI changes detected",
      detection: "Daily smoke test files test LLC, alerts on selector failure",
      fallback: "AI Vision (GPT-4V) reads form if critical selector missing"
    };

    statutory_sweep: {
      frequency: "Weekly check of Sunbiz 'News & Alerts' page",
      monitoring: ["Fee changes", "Maintenance windows", "Form updates"],
      action: "Update fee constants, schedule downtime windows"
    };

    telemetry: {
      metrics: [
        "Filing success rate (target: > 98%)",
        "Average completion time (target: < 3 minutes)",
        "Rejection rate by error type",
        "Prepaid account balance"
      ],
      alerting: {
        critical: "Success rate < 95% → immediate alert",
        warning: "Prepaid balance < $500 → refill notification",
        info: "Weekly summary of filings processed"
      }
    };

    human_in_the_loop: {
      trigger: [
        "High-tier filings (Medical PLLC, Contractor LLC) - Staff confirmation required",
        "Automation failure after 5 retries - Manual override",
        "Unusual rejection reason - Human review"
      ],
      control_tower: "Staff dashboard shows PENDING_MANUAL filings, one-click manual submit"
    };
  };

  // ============================================
  // SECURITY & COMPLIANCE
  // ============================================
  security: {
    credential_storage: {
      location: "Supabase Vault (encrypted secrets)",
      encryption: "AES-256-GCM",
      access_control: "Edge Function service accounts only",
      rotation: "Change Prepaid Account PIN quarterly"
    };

    audit_logging: {
      events: ["Filing initiated", "Form submitted", "Payment authorized", "Tracking number received"],
      immutability: "Cryptographically signed entries (SHA-256)",
      retention: "Lifetime + 20 years per @DATA VaultArtifact"
    };

    idempotency: {
      mechanism: "Check for existing tracking_number before re-attempting submission",
      prevention: "Prevents double-filings if Edge Function crashes mid-process",
      task_id: "Unique UUID per filing task, stored in Supabase queue"
    };
  };

  // ============================================
  // SUCCESS METRICS & BENCHMARKS
  // ============================================
  benchmarks: {
    speed: {
      intent_calibration: "< 500ms",
      playwright_execution: "< 180 seconds (3 minutes)",
      total_time: "< 5 minutes from payment to confirmation"
    };

    accuracy: {
      first_attempt_success: "> 98%",
      name_availability_prediction: "> 95%",
      zero_duplicate_filings: "100%"
    };

    cost: {
      compute_per_filing: "~$0.02 (Supabase Edge Function execution)",
      state_fee: "$125 (passed through to Prepaid Account)",
      total_automation_cost: "$0.02 per filing"
    };

    comparison_to_manual: {
      staff_time_saved: "15-20 minutes per filing",
      cost_savings: "$15-30 per filing (at $60/hr wage)",
      scalability: "Unlimited (vs staff capacity bottleneck)"
    };
  };
}
```

---

## Integration Instructions

1. Open `C:\Charter-Legacy v4\AIL\charter-legacy.pbp.yaml`
2. Locate line 779 (`@UPL_GUARDRAILS` closing brace)
3. Insert the above `@SUNBIZ_AUTOMATION` section after line 779
4. Save file
5. Update version from 5.5 → 5.6 on line 4

---

## Changes from Original PBP

**Line 491** (OnArticlesComplete trigger):

- **OLD:** `"Submit to Sunbiz API"`
- **NEW:** `"Submit to Sunbiz via Playwright automation (Phase B)"`

This reflects the institutional automation strategy using browser automation + Prepaid Account instead of a non-existent API.
