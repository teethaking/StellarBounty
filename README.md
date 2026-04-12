# StellarBounty

StellarBounty is a decentralized bounty and task marketplace built for the Stellar ecosystem.

## Monorepo structure

- `apps/frontend` — Next.js marketplace UI and dashboards
- `apps/backend` — NestJS API server for bounties, users, submissions
- `apps/contracts` — Soroban smart contract workspace for escrow and payouts
- `packages/ui` — shared React UI components
- `packages/types` — shared TypeScript models and GraphQL types
- `packages/utils` — common utilities and helpers
- `packages/sdk` — Stellar transaction helpers, Freighter integration
- `docs` — architecture, API specs, workflow docs
- `infra` — container, CI, and deployment support

## Getting started

1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. Use `gh` to create issue backlog with `scripts/create_github_issues.sh`
