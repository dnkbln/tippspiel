#!/usr/bin/env bash

set -euo pipefail

CONFIG_FILE="${TIPPSPIEL_DEPLOY_ENV:-/etc/tippspiel/deploy.env}"
BACKEND_ENV_FILE="${TIPPSPIEL_BACKEND_ENV:-/etc/tippspiel/backend.env}"
PROVISION_ENV_FILE="${TIPPSPIEL_PROVISION_ENV:-/etc/tippspiel/provision.env}"

fail() {
  printf "error: %s\n" "$*" >&2
  exit 1
}

info() {
  printf "==> %s\n" "$*"
}

require_root() {
  if [ "${EUID}" -ne 0 ]; then
    fail "run this script with sudo"
  fi
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    fail "required command is missing: $command_name"
  fi
}

load_config() {
  [ -f "$CONFIG_FILE" ] || fail "missing deploy config: $CONFIG_FILE"

  set -a
  # shellcheck disable=SC1090
  . "$CONFIG_FILE"
  set +a

  : "${TIPPSPIEL_APP_DIR:?missing TIPPSPIEL_APP_DIR in $CONFIG_FILE}"
  : "${TIPPSPIEL_APP_USER:?missing TIPPSPIEL_APP_USER in $CONFIG_FILE}"
  : "${TIPPSPIEL_BACKEND_PORT:?missing TIPPSPIEL_BACKEND_PORT in $CONFIG_FILE}"

  BACKEND_ENV_FILE="${TIPPSPIEL_BACKEND_ENV:-$BACKEND_ENV_FILE}"
  PROVISION_ENV_FILE="${TIPPSPIEL_PROVISION_ENV:-$PROVISION_ENV_FILE}"

  [ -d "$TIPPSPIEL_APP_DIR" ] || fail "TIPPSPIEL_APP_DIR does not exist: $TIPPSPIEL_APP_DIR"
  [ -f "$TIPPSPIEL_APP_DIR/package.json" ] || fail "TIPPSPIEL_APP_DIR is not the project root: $TIPPSPIEL_APP_DIR"
  id "$TIPPSPIEL_APP_USER" >/dev/null 2>&1 || fail "TIPPSPIEL_APP_USER does not exist: $TIPPSPIEL_APP_USER"
}

load_backend_env() {
  [ -f "$BACKEND_ENV_FILE" ] || fail "missing backend env: $BACKEND_ENV_FILE"

  set -a
  # shellcheck disable=SC1090
  . "$BACKEND_ENV_FILE"
  set +a

  : "${DATABASE_URL:?missing DATABASE_URL in $BACKEND_ENV_FILE}"
}

check_prerequisites() {
  require_command devbox
  require_command pnpm
  require_command psql
  require_command curl
  require_command systemctl
  require_command runuser

  [ -d /run/systemd/system ] || fail "systemd is not available in this environment"
}

run_app() {
  runuser -u "$TIPPSPIEL_APP_USER" -- bash -lc 'cd "$1"; shift; exec "$@"' \
    bash "$TIPPSPIEL_APP_DIR" devbox run --config "$TIPPSPIEL_APP_DIR" -- "$@"
}

provision_invitation_code() {
  [ -n "${TIPPSPIEL_INVITATION_CODE:-}" ] || return 0

  info "provisioning production invitation code"
  psql "$DATABASE_URL" --set ON_ERROR_STOP=1 \
    --set invitation_code="$TIPPSPIEL_INVITATION_CODE" <<'SQL'
INSERT INTO "InvitationCode" ("id", "code", "isActive", "createdAt", "updatedAt")
VALUES (
  'prod-invitation-' || md5(:'invitation_code'),
  :'invitation_code',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("code") DO UPDATE
SET
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
SQL
}

provision_bootstrap_token_hash() {
  [ -n "${TIPPSPIEL_BOOTSTRAP_TOKEN_HASH:-}" ] || return 0

  case "$TIPPSPIEL_BOOTSTRAP_TOKEN_HASH" in
    *[!0-9a-f]*) fail "TIPPSPIEL_BOOTSTRAP_TOKEN_HASH must be lowercase sha256 hex" ;;
  esac

  if [ "${#TIPPSPIEL_BOOTSTRAP_TOKEN_HASH}" -ne 64 ]; then
    fail "TIPPSPIEL_BOOTSTRAP_TOKEN_HASH must be 64 characters"
  fi

  info "provisioning initial admin bootstrap token hash"
  psql "$DATABASE_URL" --set ON_ERROR_STOP=1 \
    --set bootstrap_token_hash="$TIPPSPIEL_BOOTSTRAP_TOKEN_HASH" <<'SQL'
INSERT INTO "BootstrapSetup" ("id", "tokenHash", "createdAt", "updatedAt")
VALUES ('initial', :'bootstrap_token_hash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE
SET
  "tokenHash" = EXCLUDED."tokenHash",
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "BootstrapSetup"."completedAt" IS NULL;
SQL
}

provision_database_values() {
  if [ ! -f "$PROVISION_ENV_FILE" ]; then
    info "no provisioning env found; skipping invitation/bootstrap provisioning"
    return 0
  fi

  set -a
  # shellcheck disable=SC1090
  . "$PROVISION_ENV_FILE"
  set +a

  provision_invitation_code
  provision_bootstrap_token_hash
}

run_deploy_steps() {
  info "installing dependencies"
  run_app pnpm install --frozen-lockfile

  info "generating Prisma client"
  run_app pnpm db:generate

  info "deploying database migrations"
  run_app pnpm --filter backend exec prisma migrate deploy

  provision_database_values

  info "building application"
  run_app pnpm build
}

restart_services() {
  info "restarting backend service"
  systemctl restart tippspiel-backend.service

  info "reloading Caddy"
  systemctl reload caddy.service || systemctl restart caddy.service
}

check_health() {
  local health_url
  local attempt

  health_url="http://127.0.0.1:${TIPPSPIEL_BACKEND_PORT}/health"
  info "checking backend health: $health_url"

  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if curl --fail --silent --show-error "$health_url" >/dev/null; then
      info "healthcheck passed"
      return 0
    fi

    sleep 1
  done

  systemctl status tippspiel-backend.service --no-pager || true
  fail "backend healthcheck failed"
}

print_socket_hint() {
  if command -v ss >/dev/null 2>&1; then
    info "listening sockets for backend and Caddy"
    ss -ltnp | grep -E "(:${TIPPSPIEL_BACKEND_PORT}|caddy)" || true
  fi
}

main() {
  require_root
  load_config
  load_backend_env
  check_prerequisites
  run_deploy_steps
  restart_services
  check_health
  print_socket_hint
}

main "$@"
