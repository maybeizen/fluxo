#!/usr/bin/env bash
# Install system dependencies for Fluxo on Debian/Ubuntu

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "${SCRIPT_DIR}/lib.sh"

require_root
require_cmd apt-get

log_info "Updating apt packages..."
apt-get update -qq

log_info "Installing PostgreSQL 16, Redis, Node.js 20, and build tools..."
apt-get install -y -qq \
    curl \
    ca-certificates \
    gnupg \
    postgresql \
    postgresql-contrib \
    redis-server \
    build-essential \
    openssl

if ! command -v node >/dev/null 2>&1; then
    log_info "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
fi

if ! command -v bun >/dev/null 2>&1; then
    log_info "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
    export PATH="$BUN_INSTALL/bin:$PATH"
fi

log_info "Enabling PostgreSQL and Redis..."
systemctl enable postgresql redis-server
systemctl start postgresql redis-server

log_ok "System dependencies installed."
log_info "Bun: $(command -v bun || echo 'restart shell to load PATH')"
log_info "Node: $(node --version 2>/dev/null || echo 'n/a')"
log_info "PostgreSQL: $(psql --version 2>/dev/null | head -1 || echo 'n/a')"
log_info "Redis: $(redis-server --version 2>/dev/null || echo 'n/a')"
