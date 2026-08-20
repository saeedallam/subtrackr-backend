# SubTrackr Backend

A portfolio-grade subscription tracking backend built with NestJS, TypeScript, MongoDB, Prisma, Redis, and BullMQ.

## Features

- JWT authentication with refresh-token-ready structure
- User profiles and role support
- Subscription plans and subscription lifecycle management
- Renewal period tracking and cancellation
- Redis-backed BullMQ notification processing
- User notifications
- Subscription analytics endpoint
- Prisma MongoDB data model with targeted indexes
- Swagger/OpenAPI documentation
- Docker Compose for MongoDB, Redis, and the API
- Validation, centralized configuration, and clean module boundaries

## Stack

- Node.js / TypeScript
- NestJS
- MongoDB
- Prisma ORM
- Redis
- BullMQ
- JWT
- Swagger
- Docker
- Jest

## Local setup

```bash
cp .env.example .env
npm install
npx prisma generate
npm run prisma:push
npm run prisma:seed
npm run start:dev
```

Swagger: `http://localhost:3001/docs`

With Docker:

```bash
docker compose up --build
```

## Demo credentials

Seed creates:

- `demo@subtrackr.local` / `Password123!`
- `admin@subtrackr.local` / `Password123!`

Change/remove demo credentials before production use.

## Example endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/plans`
- `POST /api/subscriptions`
- `GET /api/subscriptions`
- `POST /api/subscriptions/:id/cancel`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `GET /api/analytics/subscriptions`

## Engineering notes

The queue processes subscription lifecycle notifications asynchronously. The project intentionally does not claim a specific notification throughput or delivery percentage; those should only be added to a résumé after reproducible load testing.

## Future improvements

- Payment provider integration (e.g. Stripe)
- Webhook reconciliation
- Renewal scheduler with idempotency keys
- Per-subscription usage tracking and quotas
- Email/SMS notification adapters
- Admin dashboards
- Observability with metrics and tracing
- E2E and load tests against real services
