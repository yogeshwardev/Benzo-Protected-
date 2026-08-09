# BENZO Security Baseline

## Non-Negotiables

- Authorization is enforced by backend guards.
- Razorpay, LiveKit, R2, Resend, JWT, and database secrets never reach the browser.
- Financial writes happen inside database transactions.
- Webhook processing is idempotent.
- Wallet balance is derived from ledger transactions.
- Bank data is masked and never logged in full.
- File uploads validate size, MIME type, extension, and access rights.

## Initial Controls

- Argon2 password hashing.
- Access token plus rotating refresh token strategy.
- In-process rate limiting on auth, checkout, payment verification, withdrawals, and sensitive admin APIs.
- Audit logs for privileged and financial actions.
- Backend DTO validation with whitelisting and non-whitelisted field rejection.
- Public certificate verification that refuses revoked certificates.
- Course-scoped chat and announcement authorization.
- Security headers at Nginx and app layers.

## Remaining Hardening

- Move rate limiting to Redis before running multiple API replicas.
- Add structured request logging with request IDs and redaction.
- Keep production Swagger disabled or access-restricted if API docs are exposed.
- Add browser E2E and backend integration tests for critical business journeys.
