
# 🔐 OTP Expiry Adjustment Justification

## Context

Supabase issued a warning:  
**`Auth OTP Long Expiry — OTP expiry exceeds recommended threshold`**

This alert indicates that the One-Time Password (OTP) expiry time currently configured for the Supabase authentication system is longer than best practices suggest.

## ✅ Reason for Long Expiry

We have **intentionally extended the OTP expiry time** to prevent:

- Unintended disconnections from the **/admin** interface for internal managers
- Disruptions for **technical service providers** accessing the **/extranet-technique**

During testing, shorter OTP expiry times caused:
- Unstable sessions
- Failures during role-check middleware verification
- Unresponsive or blocked access to protected routes (despite valid credentials)

## 🔒 Security Safeguards in Place

Despite this extended expiry, security remains enforced through:

- Supabase's secure token infrastructure
- Explicit **role-based access control** in the frontend logic (`ProtectedRoute.tsx`, `usePermissionCheck.ts`)
- Controlled session validation via **Edge Functions**
- Active **Row Level Security (RLS)** on all protected tables
- All access scoped to verified `@pazproperty.pt` or known service providers

No elevated privilege is granted without context or server-side validation.

## ⚖️ Tradeoff Acknowledgement

We understand the security tradeoff of longer token validity. This adjustment:
- Improves UX
- Reduces friction in authentication
- Helps avoid state mismatches during slower network conditions or cold starts

## 🗓️ Next Review

This decision will be **re-evaluated in 6 months** or earlier if:
- Supabase releases enhanced session-handling mechanisms
- Session management becomes more consistent
- Edge Function performance stabilizes

A task has been logged in our internal roadmap to revisit this parameter by **November 2025**.
