# 📹 Technical Handover: The "Source Code" of the Legacy Protocol

**Format:** Screen-share walk-through
**Audience:** The next Lead Developer / Successor

---

## 0:00 - Introduction (The "Why")

**[Visual: Camera on Andy/Speaker, then transition to "Charter Legacy" landing page]**

"Hi. If you are watching this, it means the transition has happened. My name is Andy Treusch, the architect behind this system. You are now the custodian of the 'Digital Soul' of this business.

"This isn't just a React app. It's a promise I made to my family and my clients. I want to walk you through how the machine works, where the bodies are buried (metaphorically), and how to keep the lights on."

## 1:30 - The Stack & Infrastructure

**[Visual: VS Code showing `package.json` and Sidebar]**

"Let's start with the engine.

- **Core:** It's vanilla JS/HTML for the client-side (Zero Dependencies is the goal for longevity) but integrated with Supabase for the backend.
- **Hosting:** We run on [Host/Service].
- **The 'Vault':** This is the critical part. Navigate to `scripts/ra-portal.js`. This logic handles the 'OFFICIAL' vs 'INTERNAL' classification.
- **Zero-Knowledge:** Look at `SECURITY_PROTOCOL.md`. Read it twice. We do _not_ hold the keys to the private letters. Do not try to be 'helpful' and build a password reset for that. You will break the trust model."

## 3:45 - The "Dead Man's Switch" Logic

**[Visual: Diagram of the Trigger Flow or Code]**

"Here is the heartbeat. The system checks for 'Life Signs' (login activity, email clicks) every 30 days.

- If missed -> **Warning Email** (Day 7).
- If missed -> **Second Warning** (Day 14).
- If missed -> **TRIGGER EXECUTION** (Day 30).

"The trigger code lives in `functions/legacy-trigger`. If this script fails, the legacy fails. Please set up a separate uptime monitor just for this endpoint."

## 5:20 - Sunbiz Legal Doc Transition (The Business)

**[Visual: The 'Successor Command Center' UI]**

"For my business clients, they need continuity.

- Identify the 'Active Client Registry' in the database.
- The system allows you to export a 'State Filing Snapshot'.
- Your job is to ensure no deadline is missed during the transition. The 'Successor UI' gives you a prioritized list of these dates."

## 6:50 - The "Grandchildren's Guide" (The Heart)

**[Visual: The Photo Storybook UI]**

"Finally, the personal side. This module uses the 'Story Engine'. It links photos to text. It's simple code, but valuable data.

- Ensure the S3 (or storage) buckets for these photos are paid up for 10+ years.
- Do not compress these images. They are the master archives for my grandkids."

## 7:45 - Closing

**[Visual: Camera]**

"The code is clean, modular, and indented. Keep it that way.
"Good luck. Take care of them."
**[Fade to Black]**
