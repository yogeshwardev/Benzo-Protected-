# BENZO Self-Hosted LiveKit

## 1. Architecture

BENZO uses LiveKit as self-hosted WebRTC infrastructure:

Users -> `benzo.co.in` -> Next.js web -> NestJS API -> `wss://live.benzo.co.in` -> LiveKit media room.

The browser never receives `LIVEKIT_API_SECRET`. It receives only `LIVEKIT_URL` and a short-lived participant token from the NestJS API after BENZO authorization.

## 2. Docker Setup

Production uses `docker-compose.prod.yml` with:

- `web`: Next.js.
- `api`: NestJS.
- `postgres`: private database.
- `redis`: private Redis, also used by LiveKit.
- `livekit`: official `livekit/livekit-server` image.
- `nginx`: HTTPS/WSS reverse proxy for `benzo.co.in` and `live.benzo.co.in`.

LiveKit signaling/API port `7880` is exposed only inside Docker and proxied by Nginx. WebRTC media ports are exposed directly.

## 3. Environment Variables

Production `.env` must include:

```bash
LIVEKIT_URL=wss://live.benzo.co.in
LIVEKIT_API_KEY=<random-api-key>
LIVEKIT_API_SECRET=<long-random-secret>
LIVEKIT_TOKEN_TTL=2h
LIVEKIT_WEBHOOK_URL=https://benzo.co.in/api/v1/livekit/webhook
LIVEKIT_LOG_LEVEL=info
LIVEKIT_RTC_PORT_START=50000
LIVEKIT_RTC_PORT_END=50100
```

Frontend code must not use `LIVEKIT_API_SECRET`.

## 4. API Key Generation

Generate secrets on the EC2 host:

```bash
openssl rand -hex 16
openssl rand -hex 32
```

Use the first value as `LIVEKIT_API_KEY` and the second as `LIVEKIT_API_SECRET`.

## 5. LiveKit Config

`docker-compose.prod.yml` injects LiveKit YAML through `LIVEKIT_CONFIG`. It configures:

- `port: 7880` for HTTP/WebSocket signaling.
- `rtc.tcp_port: 7881` for ICE TCP fallback.
- `rtc.port_range_start/end` for UDP media.
- `rtc.use_external_ip: true` for EC2 public IP discovery.
- Redis at `redis:6379`.
- signed webhooks to BENZO API.

## 6. DNS

Create:

```text
live.benzo.co.in A <EC2 public or Elastic IP>
```

Keep existing `benzo.co.in` records unchanged.

## 7. AWS Security Group Ports

Allow inbound:

```text
22/tcp      admin SSH
80/tcp      HTTP and Let's Encrypt challenge
443/tcp     HTTPS for benzo.co.in and WSS for live.benzo.co.in
7881/tcp    LiveKit ICE TCP fallback
50000-50100/udp LiveKit WebRTC media
```

Do not expose:

```text
5432/tcp PostgreSQL
6379/tcp Redis
7880/tcp LiveKit signaling directly
```

## 8. Nginx

`docker/nginx/benzo.conf` contains a dedicated `live.benzo.co.in` HTTPS server block. It proxies only HTTP/WebSocket signaling to `livekit:7880` with upgrade headers and long timeouts.

Do not proxy UDP media through Nginx. Media ports must be reachable directly on the EC2 host.

## 9. SSL

Issue certificates:

```bash
docker compose -f docker-compose.prod.yml stop nginx
docker run --rm -p 80:80 \
  -v benzo_letsencrypt:/etc/letsencrypt \
  -v benzo_certbot_www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d benzo.co.in -d www.benzo.co.in
docker run --rm -p 80:80 \
  -v benzo_letsencrypt:/etc/letsencrypt \
  -v benzo_certbot_www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d live.benzo.co.in
docker compose -f docker-compose.prod.yml up -d nginx
```

Renewal:

```bash
docker run --rm \
  -v benzo_letsencrypt:/etc/letsencrypt \
  -v benzo_certbot_www:/var/www/certbot \
  certbot/certbot renew
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## 10. TURN

This first self-hosted setup uses direct UDP media plus LiveKit ICE TCP fallback. TURN is not enabled by default.

Enable TURN if students report failures on restrictive corporate, hostel, or mobile-carrier networks. Prefer LiveKit embedded TURN with a separate TURN domain and certificate, or deploy coturn with long-term credentials. Never run an open relay.

## 11. Backend Token Flow

Student flow:

Student clicks Join -> API verifies JWT -> active account -> active enrollment -> class/course match -> join window -> scoped token.

Instructor flow:

Instructor clicks Join -> API verifies JWT -> active account -> active course assignment -> 15-minute early window -> instructor token.

Room names are server-controlled:

```text
course-{courseId}-class-{liveClassId}-{startsAtMillis}
```

## 12. Attendance Events

LiveKit sends signed webhooks to:

```text
POST /api/v1/livekit/webhook
```

The API verifies the LiveKit JWT signature and raw-body hash, then tracks:

- `participant_joined`: opens an attendance session.
- `participant_left`: closes the latest open session.
- `room_finished`: calculates summaries.

Summaries are clipped to official `startsAt` and `endsAt`, so instructor early entry does not count. `>=80%` is `PRESENT`, `>0 and <80%` is `PARTIAL`, and `0` is `ABSENT`.

## 13. Recording

LiveKit recording requires LiveKit Egress plus storage. This repository has recording models and status APIs, but this change does not deploy Egress. Live classes work without recording.

Add recording later with:

- `livekit-egress` service.
- S3/R2 output config.
- room-composite recording start/stop logic.
- webhook handling for `egress_started`, `egress_updated`, and `egress_ended`.

## 14. Local Development

Start local infra:

```bash
docker compose up -d postgres redis livekit
```

Local LiveKit runs with `--dev`, using `7880/tcp` for signaling, `7881/tcp` for ICE TCP, and `7882/udp` for default dev UDP media. The production compose file uses the configured `50000-50100/udp` range.

Use:

```bash
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

Run BENZO:

```bash
pnpm dev
```

## 15. Production Deployment

Manual deployment:

```bash
git pull
docker compose -f docker-compose.prod.yml build api web
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy --schema prisma/schema.prisma
curl --fail https://benzo.co.in/api/v1/health/ready
curl --fail https://live.benzo.co.in
```

GitHub Actions deploys on `main` using `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, and `EC2_APP_DIR` secrets.

## 16. Troubleshooting

- WSS fails: check DNS, certificate, Nginx `live.benzo.co.in` block, and `LIVEKIT_URL`.
- Users connect but no media: check UDP `50000-50100` security group and host firewall.
- Some networks cannot connect: configure TURN.
- Attendance missing: check `LIVEKIT_WEBHOOK_URL`, API logs, and webhook signature config.
- Health says `livekit: unreachable`: verify LiveKit container is healthy and Nginx can reach `livekit:7880`.

Self-hosting removes LiveKit Cloud participant-minute billing. AWS compute and bandwidth still cost money.
