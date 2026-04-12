#!/usr/bin/env bash
set -e

echo "Bootstrapping StellarBounty monorepo..."
cd "$(dirname "$0")/../.."
npm install
npm run build

echo "Bootstrap complete. Run npm run dev to start the apps."
