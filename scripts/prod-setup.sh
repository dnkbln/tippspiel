#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${TIPPSPIEL_DEPLOY_ENV:-/etc/tippspiel/deploy.env}"
BACKEND_ENV_FILE="${TIPPSPIEL_BACKEND_ENV:-/etc/tippspiel/backend.env}"
PROVISION_ENV_FILE="${TIPPSPIEL_PROVISION_ENV:-/etc/tippspiel/provision.env}"
BACKEND_SERVICE_FILE="/etc/systemd/system/tippspiel-backend.service"
CADDYFILE="/etc/caddy/Caddyfile"
CADDY_BEGIN="# BEGIN tippspiel managed block"
CADDY_END="# END tippspiel managed block"

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

write_env_assignment() {
  local key="$1"
  local value="$2"

  printf "%s=%q\n" "$key" "$value"
}

url_encode() {
  local value="$1"
  local encoded=""
  local char
  local i
  local LC_ALL=C

  for ((i = 0; i < ${#value}; i += 1)); do
    char="${value:i:1}"
    case "$char" in
      [a-zA-Z0-9.~_-])
        encoded+="$char"
        ;;
      *)
        printf -v char "%%%02X" "'$char"
        encoded+="$char"
        ;;
    esac
  done

  printf "%s" "$encoded"
}

create_config_template() {
  local setup_dir
  local default_user
  local temp_file

  setup_dir="$(dirname "$CONFIG_FILE")"
  default_user="${SUDO_USER:-$(id -un)}"
  temp_file="$(mktemp)"

  install -d -m 0755 "$setup_dir"

  {
    printf "# Tippspiel production deployment configuration\n"
    printf "# Edit this file and rerun scripts/prod-setup.sh.\n"
    write_env_assignment "TIPPSPIEL_APP_DIR" "$PROJECT_ROOT"
    write_env_assignment "TIPPSPIEL_APP_USER" "$default_user"
    write_env_assignment "TIPPSPIEL_PUBLIC_PORT" "8080"
    write_env_assignment "TIPPSPIEL_BACKEND_PORT" "3000"
    write_env_assignment "TIPPSPIEL_DB_NAME" "tippspiel"
    write_env_assignment "TIPPSPIEL_DB_USER" "tippspiel"
    write_env_assignment "TIPPSPIEL_BACKEND_ENV" "$BACKEND_ENV_FILE"
    write_env_assignment "TIPPSPIEL_PROVISION_ENV" "$PROVISION_ENV_FILE"
  } > "$temp_file"

  install -m 0644 "$temp_file" "$CONFIG_FILE"
  rm -f "$temp_file"

  info "created config template: $CONFIG_FILE"
  fail "review the config values and rerun this script"
}

load_config() {
  if [ ! -f "$CONFIG_FILE" ]; then
    create_config_template
  fi

  set -a
  # shellcheck disable=SC1090
  . "$CONFIG_FILE"
  set +a

  : "${TIPPSPIEL_APP_DIR:?missing TIPPSPIEL_APP_DIR in $CONFIG_FILE}"
  : "${TIPPSPIEL_APP_USER:?missing TIPPSPIEL_APP_USER in $CONFIG_FILE}"
  : "${TIPPSPIEL_PUBLIC_PORT:?missing TIPPSPIEL_PUBLIC_PORT in $CONFIG_FILE}"
  : "${TIPPSPIEL_BACKEND_PORT:?missing TIPPSPIEL_BACKEND_PORT in $CONFIG_FILE}"
  : "${TIPPSPIEL_DB_NAME:?missing TIPPSPIEL_DB_NAME in $CONFIG_FILE}"
  : "${TIPPSPIEL_DB_USER:?missing TIPPSPIEL_DB_USER in $CONFIG_FILE}"

  BACKEND_ENV_FILE="${TIPPSPIEL_BACKEND_ENV:-$BACKEND_ENV_FILE}"
  PROVISION_ENV_FILE="${TIPPSPIEL_PROVISION_ENV:-$PROVISION_ENV_FILE}"
}

validate_config() {
  [ -d "$TIPPSPIEL_APP_DIR" ] || fail "TIPPSPIEL_APP_DIR does not exist: $TIPPSPIEL_APP_DIR"
  [ -f "$TIPPSPIEL_APP_DIR/package.json" ] || fail "TIPPSPIEL_APP_DIR is not the project root: $TIPPSPIEL_APP_DIR"
  id "$TIPPSPIEL_APP_USER" >/dev/null 2>&1 || fail "TIPPSPIEL_APP_USER does not exist: $TIPPSPIEL_APP_USER"

  case "$TIPPSPIEL_PUBLIC_PORT" in
    ''|*[!0-9]*) fail "TIPPSPIEL_PUBLIC_PORT must be numeric" ;;
  esac

  case "$TIPPSPIEL_BACKEND_PORT" in
    ''|*[!0-9]*) fail "TIPPSPIEL_BACKEND_PORT must be numeric" ;;
  esac
}

check_prerequisites() {
  info "checking prerequisites"
  require_command devbox
  require_command pnpm
  require_command psql
  require_command pg_isready
  require_command caddy
  require_command systemctl
  require_command sha256sum
  require_command awk
  require_command runuser

  [ -d /run/systemd/system ] || fail "systemd is not available in this environment"
  systemctl is-system-running >/dev/null 2>&1 || true
  systemctl is-active --quiet postgresql || fail "postgresql service is not active"
  systemctl is-enabled --quiet postgresql || info "postgresql service is active but not enabled"

  pg_isready >/dev/null 2>&1 || fail "postgresql does not respond on the default local connection"
}

prompt_secret() {
  local prompt="$1"
  local value

  read -r -s -p "$prompt" value
  printf "\n" >&2
  printf "%s" "$value"
}

configure_database() {
  local db_password

  info "configuring PostgreSQL role and database"
  db_password="$(prompt_secret "PostgreSQL password for role '$TIPPSPIEL_DB_USER': ")"
  [ -n "$db_password" ] || fail "database password must not be empty"

  runuser -u postgres -- psql --set ON_ERROR_STOP=1 \
    --set app_db="$TIPPSPIEL_DB_NAME" \
    --set app_user="$TIPPSPIEL_DB_USER" \
    --set app_password="$db_password" <<'SQL'
SELECT format(
  'CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE',
  :'app_user'
)
WHERE NOT EXISTS (
  SELECT 1 FROM pg_roles WHERE rolname = :'app_user'
)\gexec

ALTER ROLE :"app_user" WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD :'app_password';

SELECT format(
  'CREATE DATABASE %I OWNER %I',
  :'app_db',
  :'app_user'
)
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = :'app_db'
)\gexec
SQL

  runuser -u postgres -- psql -d "$TIPPSPIEL_DB_NAME" --set ON_ERROR_STOP=1 \
    --set app_db="$TIPPSPIEL_DB_NAME" \
    --set app_user="$TIPPSPIEL_DB_USER" <<'SQL'
REVOKE ALL ON DATABASE :"app_db" FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE :"app_db" TO :"app_user";

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
ALTER SCHEMA public OWNER TO :"app_user";
GRANT USAGE, CREATE ON SCHEMA public TO :"app_user";
SQL

  write_backend_env "$db_password"
}

write_backend_env() {
  local db_password="$1"
  local backend_env_dir
  local temp_file
  local database_url
  local encoded_db_password

  backend_env_dir="$(dirname "$BACKEND_ENV_FILE")"
  temp_file="$(mktemp)"
  encoded_db_password="$(url_encode "$db_password")"
  database_url="postgresql://${TIPPSPIEL_DB_USER}:${encoded_db_password}@localhost:5432/${TIPPSPIEL_DB_NAME}?schema=public"

  install -d -m 0755 "$backend_env_dir"

  {
    write_env_assignment "NODE_ENV" "production"
    write_env_assignment "APP_HOST" "127.0.0.1"
    write_env_assignment "APP_PORT" "$TIPPSPIEL_BACKEND_PORT"
    write_env_assignment "DATABASE_URL" "$database_url"
  } > "$temp_file"

  install -o root -g "$TIPPSPIEL_APP_USER" -m 0640 "$temp_file" "$BACKEND_ENV_FILE"
  rm -f "$temp_file"

  info "wrote backend environment: $BACKEND_ENV_FILE"
}

configure_provisioning() {
  local provision_dir
  local temp_file
  local invitation_code
  local bootstrap_token
  local bootstrap_token_hash

  provision_dir="$(dirname "$PROVISION_ENV_FILE")"
  temp_file="$(mktemp)"

  read -r -p "Initial invitation code for production registrations: " invitation_code
  [ -n "$invitation_code" ] || fail "invitation code must not be empty"

  bootstrap_token="$(prompt_secret "Optional bootstrap token for initial admin, leave empty to skip: ")"

  install -d -m 0755 "$provision_dir"

  {
    write_env_assignment "TIPPSPIEL_INVITATION_CODE" "$invitation_code"
    if [ -n "$bootstrap_token" ]; then
      bootstrap_token_hash="$(printf "%s" "$bootstrap_token" | sha256sum | awk '{print $1}')"
      write_env_assignment "TIPPSPIEL_BOOTSTRAP_TOKEN_HASH" "$bootstrap_token_hash"
    fi
  } > "$temp_file"

  install -o root -g "$TIPPSPIEL_APP_USER" -m 0640 "$temp_file" "$PROVISION_ENV_FILE"
  rm -f "$temp_file"

  info "wrote provisioning values: $PROVISION_ENV_FILE"
}

write_backend_service() {
  local devbox_bin
  local temp_file

  info "writing systemd backend service"
  devbox_bin="$(command -v devbox)"
  temp_file="$(mktemp)"

  cat > "$temp_file" <<EOF
[Unit]
Description=Tippspiel Backend
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=$TIPPSPIEL_APP_USER
WorkingDirectory=$TIPPSPIEL_APP_DIR
EnvironmentFile=$BACKEND_ENV_FILE
ExecStart=$devbox_bin run --config $TIPPSPIEL_APP_DIR -- pnpm --filter backend start
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
EOF

  install -m 0644 "$temp_file" "$BACKEND_SERVICE_FILE"
  rm -f "$temp_file"

  systemctl daemon-reload
  systemctl enable tippspiel-backend.service
}

write_caddy_config() {
  local temp_block
  local temp_file

  info "writing Caddy configuration"
  temp_block="$(mktemp)"
  temp_file="$(mktemp)"

  cat > "$temp_block" <<EOF
$CADDY_BEGIN
http://:$TIPPSPIEL_PUBLIC_PORT {
	root * $TIPPSPIEL_APP_DIR/frontend/dist
	encode zstd gzip

	@backend path /auth* /admin* /competitions* /setup* /health
	reverse_proxy @backend 127.0.0.1:$TIPPSPIEL_BACKEND_PORT

	try_files {path} /index.html
	file_server
}
$CADDY_END
EOF

  install -d -m 0755 "$(dirname "$CADDYFILE")"
  touch "$CADDYFILE"

  awk -v begin="$CADDY_BEGIN" -v end="$CADDY_END" '
    $0 == begin { skip = 1; next }
    $0 == end { skip = 0; next }
    skip != 1 { print }
  ' "$CADDYFILE" > "$temp_file"

  {
    cat "$temp_file"
    printf "\n"
    cat "$temp_block"
  } > "$temp_file.new"

  install -m 0644 "$temp_file.new" "$CADDYFILE"
  rm -f "$temp_block" "$temp_file" "$temp_file.new"

  caddy validate --config "$CADDYFILE"
  systemctl enable caddy.service
  systemctl reload caddy.service || systemctl restart caddy.service
}

main() {
  require_root
  load_config
  validate_config
  check_prerequisites
  configure_database
  configure_provisioning
  write_backend_service
  write_caddy_config

  info "setup complete"
  info "run deployment with: sudo TIPPSPIEL_DEPLOY_ENV=$CONFIG_FILE $TIPPSPIEL_APP_DIR/scripts/prod-deploy.sh"
}

main "$@"
