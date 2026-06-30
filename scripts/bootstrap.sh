#!/usr/bin/env bash
# Full Fluxo bootstrap: deps -> env -> db -> install -> build

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(repo_root)"
# shellcheck source=lib.sh
source "${SCRIPT_DIR}/lib.sh"

log_info "Fluxo bootstrap"
echo

if confirm "Install system dependencies (PostgreSQL, Redis, Bun)? Requires root."; then
    bash "${SCRIPT_DIR}/install-deps.sh"
fi

if [[ ! -f "${ROOT}/.env" ]]; then
    bash "${SCRIPT_DIR}/setup-env.sh"
else
    log_info ".env already exists — skipping setup-env.sh"
fi

if confirm "Set up PostgreSQL database and run migrations?"; then
    bash "${SCRIPT_DIR}/setup-db.sh"
fi

require_cmd bun
cd "$ROOT"
log_info "Installing JS dependencies..."
bun install --frozen-lockfile

log_info "Building monorepo..."
export CI=true
# shellcheck disable=SC1090
[[ -f .env ]] && set -a && source .env && set +a
bun run build

log_ok "Bootstrap complete."
echo
log_info "Next steps:"
echo "  1. Copy systemd units: sudo cp scripts/fluxo-*.service /etc/systemd/system/"
echo "  2. Edit units with your install path and user"
echo "  3. sudo systemctl daemon-reload && sudo systemctl enable --now fluxo-api fluxo-frontend"
echo "  4. Put Nginx/Caddy in front for HTTPS (see DEPLOY.md)"
