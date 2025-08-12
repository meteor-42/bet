#!/usr/bin/env bash
set -euo pipefail

# Build script for production deployment using bun

# Change to script directory
cd "$(dirname "$0")"

# Load production environment variables (excluding NODE_ENV)
set -a
if [[ -f .env.production ]]; then
  # Create temp file without NODE_ENV line
  grep -v '^NODE_ENV=' .env.production > .env.production.tmp || true
  # Load variables from temp file
  source ./.env.production.tmp || true
  # Clean up temp file
  rm -f .env.production.tmp
fi
set +a

# Force production environment
export NODE_ENV=production

# Verify bun is installed
if ! command -v bun >/dev/null 2>&1; then
  echo "Error: bun not found in PATH" >&2
  echo "Please install bun first - https://bun.sh/" >&2
  exit 127
fi

# Run build process
echo "build: starting..."
set +e
bun run build
status=$?
set -e

# Check build status
if [[ $status -ne 0 ]]; then
  echo "build: failed with exit code $status" >&2
  exit $status
fi

echo "build: completed successfully"