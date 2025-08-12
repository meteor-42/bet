1|#!/usr/bin/env bash
2|set -euo pipefail
3|
4|# cd into script dir
5|cd "$(dirname "$0")"
6|
7|# Export envs from .env and .env.production if exist, but DO NOT set NODE_ENV from files
8|set -a
9|if [ -f .env ]; then
10|  # filter out NODE_ENV lines
11|  grep -v '^NODE_ENV=' .env > .env.tmp || true
12|  . ./.env.tmp || true
13|  rm -f .env.tmp
14|fi
15|if [ -f .env.production ]; then
16|  grep -v '^NODE_ENV=' .env.production > .env.production.tmp || true
17|  . ./.env.production.tmp || true
18|  rm -f .env.production.tmp
19|fi
20|set +a
21|
22|# Force production mode for build
23|export NODE_ENV=production
24|
25|echo "[deploy.sh] Running bun run build ..."
26|if ! command -v bun >/dev/null 2>&1; then
27|  echo "[deploy.sh] ERROR: bun is not in PATH" >&2
28|  exit 127
29|fi
30|
31|# Run build and capture logs
32|mkdir -p logs
33|timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
34|logfile="logs/deploy-$timestamp.log"
35|
36|set +e
37|bun run build > "$logfile" 2>&1
38|status=$?
39|set -e
40|
41|if [ $status -ne 0 ]; then
42|  echo "[deploy.sh] Build failed (exit $status). See $logfile" >&2
43|  tail -n 200 "$logfile" >&2 || true
44|  exit $status
45|fi
46|
47|echo "[deploy.sh] Build completed successfully. Log: $logfile"
