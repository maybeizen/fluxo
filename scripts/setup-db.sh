#!/usr/bin/env bash
# Create PostgreSQL role/database and run migrations

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(repo_root)"
# shellcheck source=lib.sh
source "${SCRIPT_DIR}/lib.sh"

ENV_FILE="${ROOT}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
    log_err ".env not found. Run scripts/setup-env.sh first."
    exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

DB_USER="${POSTGRES_USER:-fluxo}"
DB_NAME="${POSTGRES_DB:-fluxo}"

if [[ -n "${POSTGRES_URL:-}" ]]; then
    DB_USER="$(echo "$POSTGRES_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')"
    DB_NAME="$(echo "$POSTGRES_URL" | sed -n 's|.*/\([^/?]*\).*|\1|p')"
fi

if confirm "Create PostgreSQL role '${DB_USER}' and database '${DB_NAME}'? (requires sudo postgres access)"; then
    require_cmd psql
    DB_PASSWORD_PROMPT=""
    if confirm "Generate a new database password for role ${DB_USER}?"; then
        DB_PASSWORD_PROMPT="$(gen_secret_base64 | tr -d '/+=' | head -c 32)"
        log_ok "Generated password for ${DB_USER}"
    else
        DB_PASSWORD_PROMPT="$(prompt_secret "Password for ${DB_USER}")"
    fi

    sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD_PROMPT}';
    END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

    if [[ "$POSTGRES_URL" == *"@127.0.0.1"* ]] || [[ "$POSTGRES_URL" == *"@localhost"* ]]; then
        NEW_URL="postgresql://${DB_USER}:${DB_PASSWORD_PROMPT}@127.0.0.1:5432/${DB_NAME}"
        if confirm "Update POSTGRES_URL in .env to match?"; then
            sed -i "s|^POSTGRES_URL=.*|POSTGRES_URL=${NEW_URL}|" "$ENV_FILE"
            export POSTGRES_URL="$NEW_URL"
            log_ok "Updated POSTGRES_URL in .env"
        fi
    fi
fi

require_cmd bun
log_info "Running database migrations..."
cd "$ROOT"
bun run --filter @fluxo/db db:migrate
log_ok "Migrations complete."
