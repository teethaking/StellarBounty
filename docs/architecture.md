# Architecture

StellarBounty is designed as a monorepo with a separation of concerns between Web UI, backend APIs, smart contracts, and shared packages.

## Layers

- Frontend: Next.js App Router with dashboard, bounty explorer, and wallet flow.
- Backend: NestJS REST API for user management, bounty lifecycle, submissions, and payouts.
- Contracts: Soroban smart contracts for escrow funding, release, and dispute resolution.
- Shared packages: UI primitives, common types, utilities, and Stellar SDK wrappers.

## Data flow

1. Project creates bounty in frontend.
2. Backend stores bounty metadata and generates contract funding request.
3. Contributor connects Freighter and submits work.
4. Maintainer approves submission in backend.
5. Backend executes Soroban payout transaction.
