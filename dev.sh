#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_PATH="$SCRIPT_DIR/dev.config.json"

# start vite dev server
(
  cd "$SCRIPT_DIR/frontend"
  pnpm run dev -- --host
) &

# start go backend
(
  cd "$SCRIPT_DIR/backend"
  APP_VERSION="1.1.1" CONFIG_PATH="$CONFIG_PATH" COLLECTOR_INSTANCE_ID_FILE="$SCRIPT_DIR/config/instance_id" COLLECTOR_STATS_CONSENT_FILE="$SCRIPT_DIR/config/stats_consent" COLLECTOR_PING_BASE_URL="http://localhost:4000" COLLECTOR_PING_TOKEN="2f64e07c-e930-463f-b118-556a741fb2aa" go run main.go
) &

wait