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
6. `/api/v1/health` and `/api/v1/health/ready` are checked.
7. Previous release is retained for rollback.

## Container Deployment

Build and start the production stack from the repository root:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Run database migrations before exposing a new release:

```bash
docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy --schema prisma/schema.prisma
```

The Compose stack keeps PostgreSQL, Redis, Next.js, and NestJS on a private Docker network. Only Nginx binds ports `80` and `443`.

## Backups

Run daily PostgreSQL backups and upload encrypted artifacts to protected off-server storage such as Cloudflare R2. Restore must be tested before production launch.

```bash
DATABASE_URL="postgresql://..." BACKUP_DIR=/var/backups/benzo ./scripts/backup-postgres.sh
```

Keep database credentials, Razorpay keys, LiveKit keys, R2 keys, Resend keys, and JWT secrets in EC2/GitHub secret stores only. Never commit real `.env` files.
