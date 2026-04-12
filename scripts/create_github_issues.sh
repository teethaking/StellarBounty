#!/usr/bin/env bash
set -e

ISSUE_FILE="issues/stellar_bounty_300_issues.json"
if [[ ! -f "$ISSUE_FILE" ]]; then
  echo "Issue file not found: $ISSUE_FILE"
  exit 1
fi

labels=(
  "setup:ffcc00"
  "auth:006b75"
  "wallet:0052cc"
  "smart-contracts:5319e7"
  "backend:0e8a16"
  "frontend:d93f0b"
  "bounties:7b0099"
  "notifications:1d76db"
  "reputation:ff7f0f"
  "testing:0e8a16"
  "MVP:0e8a16"
)

echo "Ensuring labels exist..."
for entry in "${labels[@]}"; do
  IFS=":" read -r label color <<< "$entry"
  gh label create "$label" --color "$color" --description "StellarBounty backlog label for $label" 2>/dev/null || true
done

echo "Creating issues from $ISSUE_FILE"

jq -c '.[]' "$ISSUE_FILE" | while read -r issue; do
  title=$(printf "%s" "$issue" | jq -r '.title')
  body=$(printf "%s" "$issue" | jq -r '.description')
  labels=$(printf "%s" "$issue" | jq -r '.labels | join(",")')
  gh issue create --title "$title" --body "$body" --label "$labels"
  echo "Created: $title"
done
