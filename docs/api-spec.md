# API Specification

## Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

## Bounties
- `GET /api/bounties`
- `GET /api/bounties/:id`
- `POST /api/bounties`
- `PATCH /api/bounties/:id`
- `DELETE /api/bounties/:id`

## Submissions
- `GET /api/bounties/:id/submissions`
- `POST /api/bounties/:id/submissions`
- `PATCH /api/submissions/:id/approve`
- `PATCH /api/submissions/:id/reject`

## Payments
- `POST /api/payments/fund`
- `POST /api/payments/release`
- `GET /api/payments/status`
