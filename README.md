# SubTrackr Backend

A modular RESTful backend for subscription tracking built with **NestJS, TypeScript, MongoDB, Prisma, Redis, and BullMQ**.

The project focuses on authentication, subscription lifecycle management, renewal processing, asynchronous notifications, usage tracking, and subscription analytics.

## Features

### Authentication

* User registration and login
* Password hashing with bcrypt
* JWT access and refresh tokens
* Refresh-token persistence and rotation
* Refresh-token revocation on logout
* Active-user validation
* Configurable JWT expiration

### Subscription Management

* Create subscriptions from active plans
* Monthly and yearly billing intervals
* Subscription period tracking
* Subscription cancellation
* Auto-renew support
* Automatic renewal processing
* Expired subscription handling
* User subscription listing

### Renewal Processing

A scheduled renewal worker periodically checks subscriptions whose billing period has ended.

The renewal workflow includes:

* Scheduled renewal checks
* Conditional updates to reduce duplicate renewals
* Renewal notification jobs
* Automatic expiration for non-renewing subscriptions

### Notifications

BullMQ is used for asynchronous notification processing.

The notification workflow includes:

* Background jobs
* Retry handling
* Exponential backoff
* Failed-job handling
* Worker logging
* Subscription lifecycle notifications

### Usage Tracking

Usage events can be recorded against users and subscriptions.

Each event can include:

* Event name
* Quantity
* Timestamp
* Optional metadata

### Analytics

The backend provides subscription analytics including:

* Total subscriptions
* Active subscriptions
* Estimated current-period revenue
* Currency information

## Security

* JWT authentication
* Protected routes
* Role support
* Password hashing
* Configurable JWT secrets
* Refresh-token persistence
* Refresh-token revocation
* Input validation

## Architecture

```text
src/
├── auth/
├── analytics/
├── common/
├── notifications/
├── plans/
├── subscriptions/
└── users/
```

The application follows a modular NestJS architecture with domain-specific services and controllers.

## Tech Stack

* Node.js
* TypeScript
* NestJS
* MongoDB
* Prisma ORM
* Redis
* BullMQ
* JWT
* Swagger / OpenAPI
* Jest
* Docker
* GitHub Actions

## Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
DATABASE_URL="mongodb://localhost:27017/subtrackr"

JWT_ACCESS_SECRET="replace-with-a-long-random-access-secret"
JWT_REFRESH_SECRET="replace-with-a-long-random-refresh-secret"

JWT_ACCESS_TTL="15m"
JWT_REFRESH_TTL="7d"

REDIS_URL="redis://localhost:6379"
PORT=3000
```

Never commit `.env`.

## Installation

```bash
npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

## Running the Application

Development:

```bash
npm run start:dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm run start:prod
```

## API Documentation

When the application is running, Swagger documentation is available at:

```text
http://localhost:3000/docs
```

## Testing

The project includes basic automated tests covering service initialization and project validation.

Run tests with:

```bash
npm test
```

## Code Quality

Run ESLint:

```bash
npm run lint
```

Build the project:

```bash
npm run build
```

## Database

Prisma is used with MongoDB.

The schema includes:

* Users
* Refresh tokens
* Plans
* Subscriptions
* Notifications
* Usage events

The schema uses unique constraints and indexes for common subscription and user access patterns.

## Project Status

This is a backend portfolio project demonstrating practical backend engineering patterns including:

* Authentication
* Refresh-token lifecycle management
* Subscription lifecycle management
* Scheduled jobs
* Background processing
* Retry strategies
* Idempotent-style conditional updates
* Usage tracking
* Analytics
* Modular NestJS architecture

Production-scale metrics and throughput numbers are intentionally not claimed unless they are measured through reproducible benchmarks.

## Future Improvements

* Payment provider integration
* Webhook processing
* Payment reconciliation
* Email/SMS notification adapters
* Advanced usage analytics
* Observability and metrics
* Expanded end-to-end test coverage
* Production deployment configuration
