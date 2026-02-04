# @fluxo/eslint-config

Shared ESLint configuration for the Fluxo monorepo.

## Overview

This package provides a centralized ESLint configuration that ensures consistent code style and quality across all packages and apps in the Fluxo monorepo.

## Stack

- **Linter**: ESLint (`^9.x`)
- **Language**: JavaScript/TypeScript

## Prerequisites

- Node.js 20+
- ESLint installed in your package

## Getting Started

### Installation

This package is part of the Fluxo monorepo and uses workspace dependencies. Install dependencies from the root:

```bash
bun install
```

### Usage

In your package's `eslint.config.js`:

```javascript
import baseConfig from '@fluxo/eslint-config'

export default [
    ...baseConfig,
    // Your package-specific overrides here
]
```

Or extend in your `package.json`:

```json
{
    "eslintConfig": {
        "extends": "@fluxo/eslint-config"
    }
}
```

## Available Scripts

This package doesn't have build scripts as it's a simple configuration file. It's consumed directly by ESLint in other packages.
