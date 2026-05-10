#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

DB_NAME="${TIPPSPIEL_DB_NAME:-tippspiel}"
DB_USER="${TIPPSPIEL_DB_USER:-$(id -un)}"
DB_PORT="${TIPPSPIEL_DB_PORT:-5432}"
DB_SOCKET_DIR="$PROJECT_ROOT/.local/postgres-socket"
LOCAL_DATABASE_URL="postgresql://$DB_USER@localhost:$DB_PORT/$DB_NAME?host=$DB_SOCKET_DIR&schema=public"
USE_LOCAL_DB="${TIPPSPIEL_USE_LOCAL_DB:-1}"

echo "==> Checking prerequisites"
bash ./scripts/check-prereqs.sh

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
fi

set -a
. ./.env
set +a

if [ "$USE_LOCAL_DB" = "1" ]; then
  echo "==> Ensuring local PostgreSQL is running"
  if ! pg_isready -h "$DB_SOCKET_DIR" -p "$DB_PORT" >/dev/null 2>&1; then
    bash ./scripts/start-postgres.sh
  else
    echo "Local PostgreSQL already responds on $DB_SOCKET_DIR"
  fi

  export DATABASE_URL="$LOCAL_DATABASE_URL"
  echo "==> Using local development database"
  echo "DATABASE_URL=$DATABASE_URL"
else
  echo "==> Using DATABASE_URL from environment or .env"
fi

if [ ! -d node_modules ]; then
  echo "==> Installing dependencies"
  pnpm install
else
  echo "==> Dependencies already installed"
fi

echo "==> Generating Prisma client"
pnpm db:generate

echo "==> Running database migrations"
pnpm db:migrate

echo "==> Seeding development database"
pnpm db:seed

echo "==> Starting frontend and backend"
pnpm dev
