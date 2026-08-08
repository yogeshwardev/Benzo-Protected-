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
- Rate limiting on auth, checkout, coupons, referrals, withdrawals, and sensitive admin APIs.
- Audit logs for privileged and financial actions.
- Structured logs with request IDs and redaction.
- Production Swagger restricted or disabled.
- Security headers at Nginx and app layers.

