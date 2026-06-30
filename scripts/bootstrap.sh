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
echo "  1. Process manager — pick one (see DEPLOY.md):"
echo "       systemd: sudo cp scripts/fluxo-*.service /etc/systemd/system/ && sudo systemctl enable --now fluxo-api fluxo-frontend"
echo "       PM2:       pm2 start scripts/ecosystem.config.cjs && pm2 save && pm2 startup"
echo "  2. Put Nginx/Caddy in front for HTTPS (see DEPLOY.md)"
echo "  3. Script reference: scripts/README.md"
