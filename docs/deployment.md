# BENZO Deployment Plan

Initial production target: AWS EC2 in `ap-south-1` behind Nginx with HTTPS from Let's Encrypt.

## Runtime

- Web: Next.js standalone container.
- API: NestJS container.
- Database: PostgreSQL, initially private on EC2 or Docker volume.
- Cache and queue: Redis.
- Storage: Cloudflare R2.
- Video: Bunny Stream.
- Live classes: LiveKit.
- Email: Resend.
- Payments: Razorpay.

## Public Ports

- `22`: SSH.
- `80`: HTTP for redirect and certificate challenge.
- `443`: HTTPS.

Do not expose PostgreSQL, Redis, web app port, or API port publicly.

## Release Flow

1. CI passes on `main`.
2. CD connects to EC2 using GitHub Actions secrets.
3. New image or source release is deployed.
4. `prisma migrate deploy` runs.
5. Services are recreated with health checks.
6. `/api/v1/health` is checked.
7. Previous release is retained for rollback.

## Backups

Run daily PostgreSQL backups and upload encrypted artifacts to protected off-server storage such as Cloudflare R2. Restore must be tested before production launch.

