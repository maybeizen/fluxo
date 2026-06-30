#!/usr/bin/env bash
# Shared helpers for Fluxo deployment scripts

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[info]${NC} $*"; }
log_ok() { echo -e "${GREEN}[ok]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
log_err() { echo -e "${RED}[error]${NC} $*" >&2; }

prompt_default() {
    local prompt="$1"
    local default="$2"
    local value
    read -r -p "${prompt} [${default}]: " value
    echo "${value:-$default}"
}

prompt_secret() {
    local prompt="$1"
    local value
    read -r -s -p "${prompt}: " value
    echo
    echo "$value"
}

confirm() {
    local prompt="$1"
    local reply
    read -r -p "${prompt} [y/N]: " reply
    [[ "$reply" =~ ^[Yy]$ ]]
}

gen_secret_hex() {
    openssl rand -hex 32
}

gen_secret_base64() {
    openssl rand -base64 32
}

repo_root() {
    cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd
}

require_root() {
    if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
        log_err "This script must be run as root (use sudo)."
        exit 1
    fi
}

require_cmd() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_err "Required command not found: $cmd"
        exit 1
    fi
}
