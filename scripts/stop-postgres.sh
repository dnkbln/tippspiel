#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(pwd)"
DATA_DIR="$PROJECT_ROOT/.local/postgres-data"

if [ ! -f "$DATA_DIR/PG_VERSION" ]; then
  echo "No local PostgreSQL data directory found at $DATA_DIR"
  exit 1
fi

pg_ctl -D "$DATA_DIR" stop

