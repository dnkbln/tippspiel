#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(pwd)"
DATA_DIR="$PROJECT_ROOT/.local/postgres-data"
SOCKET_DIR="$PROJECT_ROOT/.local/postgres-socket"
LOG_FILE="$PROJECT_ROOT/.local/postgres.log"
DB_NAME="${TIPPSPIEL_DB_NAME:-tippspiel}"
DB_USER="${TIPPSPIEL_DB_USER:-$(id -un)}"
PORT="${TIPPSPIEL_DB_PORT:-5432}"
DB_LOCALE="${TIPPSPIEL_DB_LOCALE:-C.UTF-8}"

export LANG="${LANG:-$DB_LOCALE}"
export LC_ALL="${LC_ALL:-$DB_LOCALE}"

mkdir -p "$PROJECT_ROOT/.local"
mkdir -p "$SOCKET_DIR"

if [ ! -f "$DATA_DIR/PG_VERSION" ]; then
  echo "Initializing PostgreSQL data directory in $DATA_DIR"
  initdb --locale="$DB_LOCALE" -D "$DATA_DIR"
fi

echo "Starting PostgreSQL..."
pg_ctl \
  -D "$DATA_DIR" \
  -l "$LOG_FILE" \
  -o "-c listen_addresses='' -c unix_socket_directories='$SOCKET_DIR' -p $PORT" \
  start

if psql -h "$SOCKET_DIR" -p "$PORT" -U "$DB_USER" -lqt | cut -d "|" -f 1 | tr -d " " | grep -qx "$DB_NAME"; then
  echo "Database $DB_NAME already exists."
else
  echo "Creating database $DB_NAME for user $DB_USER"
  createdb -h "$SOCKET_DIR" -p "$PORT" -U "$DB_USER" "$DB_NAME"
fi

cat <<EOF

PostgreSQL is running.

Socket directory:
  $SOCKET_DIR

Log file:
  $LOG_FILE

Use this DATABASE_URL in your .env:
  DATABASE_URL=postgresql://$DB_USER@localhost:$PORT/$DB_NAME?host=$SOCKET_DIR&schema=public

To stop the local database:
  bash ./scripts/stop-postgres.sh
EOF
