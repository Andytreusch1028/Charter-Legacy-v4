# Charter Legacy Refund Policy (Unfiled Orders)

## The Philosophy

We do not trap customers. Our value is in the execution, not the "gotcha". If we haven't incurred a hard cost (State Filing Fee), the customer is entitled to a full refund, no questions asked.

This "High Integrity Exit" builds trust and reduces chargebacks.

## The Rule: "No Filing, No Fee"

- **Status: PAID_PENDING_INFO** (Setup Not Started) -> **100% Refund Window: Forever** (until filed).
- **Status: FILED_WITH_STATE** -> **Refund: $0** (State fees are sunk cost).

## Implementation UX

1. **Dashboard Card:**
   - Primary Action: `[Complete Setup]`
   - Secondary Action (Text Link): `Cancel Order`

2. **The Intercept Modal:**
   - Title: "Pause or Cancel?"
   - Copy: _"We haven't filed anything yet, so you can cancel for a full refund. Or, we can save your spot and you can finish later."_
   - Button A: `[Save Progress]` (Close Modal)
   - Button B: `[Cancel & Refund]` (Trigger Stripe Refund API)

## Technical Flow

1. User clicks `Cancel`.
2. API checks Order Status.
   - If `FILED`: Error ("Cannot cancel filed order").
   - If `PENDING`:
     - Call Stripe `refund` endpoint.
     - Update Order Status to `CANCELLED_REFUNDED`.
     - Send email: "Your refund is on the way."
