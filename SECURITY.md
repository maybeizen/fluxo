# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately by emailing **security@fluxo.cc** or using
[GitHub's private vulnerability reporting](https://github.com/maybeizen/fluxo/security/advisories/new)
if enabled.

Include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to acknowledge reports within **72 hours** and provide a status update
within **7 days**.

## Disclosure

We follow coordinated disclosure. We will work with reporters to understand and
fix issues before public announcement when possible.

## Security best practices for self-hosters

- Never commit `.env` — use `.env.example` as a template only
- Rotate `ENCRYPTION_KEY` and `SESSION_SECRET` if compromised
- Keep PostgreSQL and Redis off the public internet
- Run behind HTTPS with a reverse proxy (see [DEPLOY.md](DEPLOY.md))
