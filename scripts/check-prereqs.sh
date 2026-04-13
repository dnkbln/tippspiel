#!/usr/bin/env bash

set -u

missing=0

check_command() {
  local command_name="$1"

  if command -v "$command_name" >/dev/null 2>&1; then
    printf "[ok] %s -> %s\n" "$command_name" "$(command -v "$command_name")"
  else
    printf "[missing] %s\n" "$command_name"
    missing=1
  fi
}

echo "Checking required commands..."
check_command git
check_command devbox
check_command node
check_command pnpm
check_command psql

echo
echo "Checking optional helpers..."
check_command corepack
check_command pg_isready

echo
if command -v node >/dev/null 2>&1; then
  echo "Node version: $(node --version)"
fi

if command -v psql >/dev/null 2>&1; then
  echo "PostgreSQL client version: $(psql --version)"
fi

if command -v pg_isready >/dev/null 2>&1; then
  if pg_isready >/dev/null 2>&1; then
    echo "[ok] PostgreSQL server responds on default socket"
  else
    echo "[warn] PostgreSQL server does not respond on the default socket"
  fi
fi

if [ -d .git ]; then
  echo "[ok] Git repository initialized"
else
  echo "[warn] Current directory is not a git repository"
fi

echo
if [ "$missing" -ne 0 ]; then
  echo "One or more required commands are missing."
  exit 1
fi

echo "Required command checks passed."

