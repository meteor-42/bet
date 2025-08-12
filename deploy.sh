#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Load only production env file
set -a
if [ -f .env.production ]; then
  grep -v '^NODE_ENV=' .env.production > .env.production.tmp || true
  . ./.env.production.tmp || true
  rm -f .env.production.tmp
fi
set +a

export NODE_ENV=production

if ! command -v bun >/dev/null 2>&1; then
  echo "bun not found in PATH" >&2
  exit 127
fi

echo "build: start"
set +e
bun run build
status=$?
set -e
if [ $status -ne 0 ]; then
  echo "build: failed" >&2
  exit $status
fi
echo "build: ok
